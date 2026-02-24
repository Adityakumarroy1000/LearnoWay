from .services.groq_ai import generate_skill_course, generate_exam_for_roadmap
from rest_framework import status
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from collections import defaultdict
from datetime import timedelta, date
from django.utils import timezone
from .models import (
    CourseCard,
    Path,
    Roadmap,
    SubMap,
    Resource,
    Quiz,
    QuizQuestion,
    StageProgress,
    ExamSession,
    UserCourseTracking,
)
from .serializers import (
    CourseSerializer, PathSerializer,
    RoadmapSerializer, SubMapSerializer, ResourceSerializer
)

EXAM_PASS_THRESHOLD = 0.7  # 70% correct to pass



class CourseViewSet(viewsets.ModelViewSet):
    queryset = CourseCard.objects.all().prefetch_related(
        'path_items__roadmaps__sub_maps__resources'
    )
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    @action(
        detail=False,
        methods=["get"],
        url_path="dashboard-summary",
        permission_classes=[IsAuthenticated],
    )
    def dashboard_summary(self, request):
        user = request.user
        tracking_qs = (
            UserCourseTracking.objects.filter(user=user)
            .select_related("course", "selected_path")
            .order_by("-last_accessed_at")
        )

        stage_rows = list(
            StageProgress.objects.filter(user=user).values(
                "roadmap_id", "roadmap__path__course_id", "passed_at"
            )
        )
        passed_by_course = defaultdict(set)
        stage_activity_by_day = defaultdict(int)
        for row in stage_rows:
            passed_by_course[row["roadmap__path__course_id"]].add(row["roadmap_id"])
            passed_at = row.get("passed_at")
            if passed_at:
                local_day = timezone.localtime(passed_at).date()
                stage_activity_by_day[local_day] += 1

        roadmaps_by_course = defaultdict(list)
        for roadmap in Roadmap.objects.select_related("path__course").order_by("id"):
            roadmaps_by_course[roadmap.path.course_id].append(roadmap)

        submaps_by_course = defaultdict(set)
        for sub in SubMap.objects.select_related("roadmap__path").all():
            submaps_by_course[sub.roadmap.path.course_id].add(sub.id)

        today = timezone.localdate()
        weekly_activity = []
        weekly_sessions = 0
        total_activity = defaultdict(int)
        active_skills = []
        completed_skills_count = 0
        tracked_course_ids = set()

        for item in tracking_qs:
            course_id = item.course_id
            tracked_course_ids.add(course_id)
            course_submaps = submaps_by_course.get(course_id, set())
            completed_submaps = set(
                [sid for sid in item.completed_sub_map_ids if sid in course_submaps]
            )
            total_units = len(course_submaps)
            completed_units = len(completed_submaps)
            progress_pct = (
                round((completed_units / total_units) * 100) if total_units > 0 else 0
            )
            if total_units > 0 and completed_units >= total_units:
                completed_skills_count += 1

            roadmaps = roadmaps_by_course.get(course_id, [])
            passed_ids = passed_by_course.get(course_id, set())
            next_stage_title = None
            for roadmap in roadmaps:
                if roadmap.id not in passed_ids:
                    next_stage_title = roadmap.title
                    break

            active_skills.append(
                {
                    "course_id": course_id,
                    "title": item.course.title,
                    "icon": item.course.icon,
                    "level": item.course.level,
                    "category": item.course.category,
                    "progress_pct": progress_pct,
                    "completed_stages": completed_units,
                    "total_stages": total_units,
                    "last_activity": item.last_accessed_at,
                    "next_stage_title": next_stage_title,
                }
            )

            for date_key, count in (item.activity_by_date or {}).items():
                try:
                    day = date.fromisoformat(date_key)
                except Exception:
                    continue
                total_activity[day] += int(count or 0)

        # Backfill active skill cards for users who have StageProgress but no UserCourseTracking row yet.
        missing_course_ids = set(passed_by_course.keys()) - tracked_course_ids
        if missing_course_ids:
            courses = {
                c.id: c
                for c in CourseCard.objects.filter(id__in=list(missing_course_ids))
            }
            for course_id in missing_course_ids:
                course = courses.get(course_id)
                if not course:
                    continue
                course_submaps = submaps_by_course.get(course_id, set())
                passed_ids = passed_by_course.get(course_id, set())
                roadmaps = roadmaps_by_course.get(course_id, [])
                total_units = len(course_submaps)
                completed_units = min(len(passed_ids), total_units)
                progress_pct = (
                    round((completed_units / total_units) * 100) if total_units > 0 else 0
                )
                if total_units > 0 and completed_units >= total_units:
                    completed_skills_count += 1

                next_stage_title = None
                for roadmap in roadmaps:
                    if roadmap.id not in passed_ids:
                        next_stage_title = roadmap.title
                        break

                active_skills.append(
                    {
                        "course_id": course_id,
                        "title": course.title,
                        "icon": course.icon,
                        "level": course.level,
                        "category": course.category,
                        "progress_pct": progress_pct,
                        "completed_stages": completed_units,
                        "total_stages": total_units,
                        "last_activity": None,
                        "next_stage_title": next_stage_title,
                    }
                )

        for day, count in stage_activity_by_day.items():
            total_activity[day] += count

        active_skills.sort(
            key=lambda x: x["last_activity"].timestamp()
            if x.get("last_activity")
            else 0,
            reverse=True,
        )

        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            sessions = total_activity.get(d, 0)
            weekly_sessions += sessions
            weekly_activity.append(
                {
                    "date": d.isoformat(),
                    "label": d.strftime("%a"),
                    "sessions": sessions,
                }
            )

        streak = 0
        cursor = today
        while total_activity.get(cursor, 0) > 0:
            streak += 1
            cursor = cursor - timedelta(days=1)

        goals = [
            {
                "key": "weekly_stages",
                "label": f"Complete {max(8, weekly_sessions + 2)} stages",
                "current": weekly_sessions,
                "target": max(8, weekly_sessions + 2),
            },
            {
                "key": "active_skills",
                "label": f"Keep {max(3, len(active_skills))} active skills",
                "current": len(active_skills),
                "target": max(3, len(active_skills)),
            },
            {
                "key": "streak_days",
                "label": f"Maintain {max(7, streak + 1)}-day streak",
                "current": streak,
                "target": max(7, streak + 1),
            },
        ]

        return Response(
            {
                "summary": {
                    "active_skills": len(active_skills),
                    "completed_skills": completed_skills_count,
                    "weekly_sessions": weekly_sessions,
                    "estimated_hours": round(weekly_sessions * 0.5, 1),
                    "streak_days": streak,
                },
                "active_skills": active_skills,
                "weekly_activity": weekly_activity,
                "goals": goals,
            }
        )

    @action(
        detail=True,
        methods=["get", "post"],
        url_path="user-progress",
        permission_classes=[IsAuthenticated],
    )
    def user_progress(self, request, pk=None):
        course = self.get_object()
        tracking, _ = UserCourseTracking.objects.get_or_create(
            user=request.user,
            course=course,
        )

        if request.method.lower() == "get":
            return Response(
                {
                    "course_id": course.id,
                    "selected_path_id": tracking.selected_path_id,
                    "selected_language": tracking.selected_language,
                    "completed_sub_map_ids": tracking.completed_sub_map_ids or [],
                    "last_accessed_at": tracking.last_accessed_at,
                    "last_activity_at": tracking.last_activity_at,
                }
            )

        selected_path_id = request.data.get("selected_path_id")
        selected_language = request.data.get("selected_language")
        completed_sub_map_ids = request.data.get("completed_sub_map_ids")
        track_activity = bool(request.data.get("track_activity", False))

        if selected_path_id is not None:
            path = Path.objects.filter(id=selected_path_id, course_id=course.id).first()
            tracking.selected_path = path

        if selected_language in {"english", "bangla", "hindi"}:
            tracking.selected_language = selected_language

        if isinstance(completed_sub_map_ids, list):
            valid_ids = set(
                SubMap.objects.filter(roadmap__path__course_id=course.id).values_list(
                    "id", flat=True
                )
            )
            cleaned = []
            for sid in completed_sub_map_ids:
                try:
                    n = int(sid)
                except Exception:
                    continue
                if n in valid_ids:
                    cleaned.append(n)
            tracking.completed_sub_map_ids = sorted(set(cleaned))

        now = timezone.now()
        tracking.last_accessed_at = now
        if track_activity:
            day_key = timezone.localdate().isoformat()
            activity = tracking.activity_by_date or {}
            activity[day_key] = int(activity.get(day_key, 0)) + 1
            tracking.activity_by_date = activity
            tracking.last_activity_at = now

        tracking.save()
        return Response(
            {
                "course_id": course.id,
                "selected_path_id": tracking.selected_path_id,
                "selected_language": tracking.selected_language,
                "completed_sub_map_ids": tracking.completed_sub_map_ids or [],
                "last_accessed_at": tracking.last_accessed_at,
                "last_activity_at": tracking.last_activity_at,
            }
        )

    @action(detail=False, methods=["post"], url_path="ai-generate")
    def ai_generate(self, request):
        skill = request.data.get("skill")
        selected_language = str(request.data.get("selected_language", "english")).lower()
        language_map = {
            "english": "English",
            "bangla": "Bangla",
            "hindi": "Hindi",
        }
        preferred_language = language_map.get(selected_language, "English")

        if not skill:
            return Response(
                {"error": "Skill is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1️⃣ Check DB (cache)
        existing = CourseCard.objects.filter(
            title__icontains=skill
        ).first()
        if existing:
            has_requested_language = Resource.objects.filter(
                sub_map__roadmap__path__course=existing,
                language=preferred_language,
            ).exists()
            if has_requested_language:
                serializer = self.get_serializer(existing)
                return Response(serializer.data)

        # 2️⃣ Call Grok AI
        try:
            ai_data = generate_skill_course(skill, preferred_language=preferred_language)
        except Exception as e:
            return Response(
                {"error": "AI generation failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        course_data = ai_data["course"]

        # 3️⃣ Save CourseCard
        course = CourseCard.objects.create(
            title=course_data["title"],
            description=course_data["description"],
            overview=course_data["overview"],
            icon=course_data.get("icon"),
            category=course_data["category"],
            level=course_data["level"],
            students=course_data.get("students", "1M+ learners worldwide"),
            duration=course_data["duration"],
            rating=course_data.get("rating", 4.5),
            color=course_data["color"],
            tags=course_data.get("tags", []),
            career_opportunities=course_data.get("career_opportunities", []),
            tools_needed=course_data.get("tools_needed", []),
            special_features=course_data.get("special_features", []),
        )

        # 4️⃣ Save Paths → Roadmaps → SubMaps → Resources
        for path_data in ai_data["paths"]:
            path = Path.objects.create(
                course=course,
                title=path_data["title"],
                mini_desc=path_data["mini_desc"],
                level=path_data["level"],
                duration=path_data["duration"],
            )

            for rm_data in path_data["roadmaps"]:
                roadmap = Roadmap.objects.create(
                    path=path,
                    title=rm_data["title"],
                    micro_desc=rm_data["micro_desc"],
                    duration=rm_data["duration"],
                )

                for sm_data in rm_data["sub_maps"]:
                    sub_map = SubMap.objects.create(
                        roadmap=roadmap,
                        title=sm_data["title"],
                        micro_desc=sm_data.get("micro_desc", "")
                    )

                    for res in sm_data.get("resources", []):
                        Resource.objects.create(
                            sub_map=sub_map,
                            language=res["language"],
                            link_type=res["link_type"],
                            link=res.get("link")
                        )

        serializer = self.get_serializer(course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class PathViewSet(viewsets.ModelViewSet):
    queryset = Path.objects.all().prefetch_related('roadmaps__sub_maps__resources')
    serializer_class = PathSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["get"], url_path="stage-progress")
    def stage_progress(self, request, pk=None):
        """Return list of roadmap IDs the current user has passed for this path. For anonymous, returns [] (frontend can use localStorage)."""
        path = self.get_object()
        if not request.user.is_authenticated:
            return Response({"passed_roadmap_ids": []})
        passed = StageProgress.objects.filter(
            user=request.user,
            roadmap__path_id=path.id,
        ).values_list("roadmap_id", flat=True)
        return Response({"passed_roadmap_ids": list(passed)})


class RoadmapViewSet(viewsets.ModelViewSet):
    queryset = Roadmap.objects.all().prefetch_related('sub_maps__resources')
    serializer_class = RoadmapSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["get"], url_path="exam")
    def get_exam(self, request, pk=None):
        """Generate a fresh AI exam (MC + short answer) for this roadmap every time."""
        import uuid
        roadmap = self.get_object()
        try:
            questions_data = generate_exam_for_roadmap(roadmap)
        except Exception as e:
            return Response(
                {"error": "Failed to generate exam", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        if not questions_data:
            return Response(
                {"error": "No questions generated"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        session_key = str(uuid.uuid4())
        ExamSession.objects.create(
            session_key=session_key,
            roadmap=roadmap,
            questions_json=questions_data,
        )
        questions = []
        for i, q in enumerate(questions_data):
            out = {
                "id": i,
                "order": i,
                "type": q.get("type", "multiple_choice"),
                "question_text": q.get("question_text", ""),
            }
            if out["type"] == "multiple_choice":
                out["options"] = q.get("options", [])
            questions.append(out)
        return Response({
            "roadmap_id": roadmap.id,
            "session_key": session_key,
            "questions": questions,
        })

    @action(detail=True, methods=["post"], url_path="exam/submit")
    def submit_exam(self, request, pk=None):
        """Submit answers. Body: { "session_key": "...", "answers": [0, "text", ...] }. Returns passed, score."""
        roadmap = self.get_object()
        session_key = request.data.get("session_key")
        answers = request.data.get("answers")
        if not session_key:
            return Response(
                {"error": "session_key required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if answers is None or not isinstance(answers, list):
            return Response(
                {"error": "answers array required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            session = ExamSession.objects.get(
                session_key=session_key, roadmap=roadmap
            )
        except ExamSession.DoesNotExist:
            return Response(
                {"error": "Exam session not found or expired. Start a new exam."},
                status=status.HTTP_404_NOT_FOUND,
            )
        questions = session.questions_json
        if len(answers) != len(questions):
            return Response(
                {"error": "Answer count does not match question count"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        correct = 0
        review = []
        for i, q in enumerate(questions):
            if i >= len(answers):
                continue

            qtype = q.get("type", "multiple_choice")
            ans = answers[i]
            question_text = q.get("question_text", "")
            item = {
                "question_id": i,
                "order": i,
                "type": qtype,
                "question_text": question_text,
                "is_correct": False,
            }

            if qtype == "multiple_choice":
                options = q.get("options", [])
                correct_index = int(q.get("correct_index", 0))
                selected_index = None
                if isinstance(ans, int):
                    selected_index = ans
                elif isinstance(ans, str) and ans.isdigit():
                    selected_index = int(ans)

                user_answer_text = None
                if (
                    selected_index is not None
                    and 0 <= selected_index < len(options)
                ):
                    user_answer_text = options[selected_index]

                correct_answer_text = None
                if 0 <= correct_index < len(options):
                    correct_answer_text = options[correct_index]

                is_correct = selected_index == correct_index
                if is_correct:
                    correct += 1

                item.update({
                    "selected_index": selected_index,
                    "selected_text": user_answer_text,
                    "correct_index": correct_index,
                    "correct_text": correct_answer_text,
                    "is_correct": is_correct,
                })
            else:
                # short_answer: check expected_keywords in answer text
                text = (ans if isinstance(ans, str) else str(ans)).strip()
                text_lower = text.lower()
                keywords = q.get("expected_keywords") or []
                kw_lower = [k.lower() for k in keywords if k]

                if not kw_lower:
                    is_correct = bool(text)
                else:
                    matches = [k for k in kw_lower if k in text_lower]
                    is_correct = len(matches) >= max(1, len(kw_lower) * 0.5)

                if is_correct:
                    correct += 1

                item.update({
                    "user_answer": text,
                    "expected_keywords": keywords,
                    "is_correct": is_correct,
                })

            review.append(item)
        score = correct / len(questions) if questions else 0
        passed = score >= EXAM_PASS_THRESHOLD
        if passed and request.user.is_authenticated:
            StageProgress.objects.get_or_create(
                user=request.user, roadmap=roadmap
            )
        session.delete()
        return Response({
            "passed": passed,
            "score": round(score * 100),
            "correct": correct,
            "total": len(questions),
            "review": review,
        })


class SubMapViewSet(viewsets.ModelViewSet):
    queryset = SubMap.objects.all().prefetch_related('resources')
    serializer_class = SubMapSerializer
    permission_classes = [AllowAny]


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [AllowAny]




