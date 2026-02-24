import json
import re
from urllib.parse import quote_plus, urlparse, unquote_plus
from urllib.request import Request, urlopen

from django.conf import settings
from groq import Groq

client = Groq(api_key=settings.GROQ_API_KEY)

ALLOWED_LANGUAGES = {"English", "Bangla", "Hindi"}
LANGUAGE_QUERY_HINTS = {
    "English": "english",
    "Bangla": "bangla বাংলা",
    "Hindi": "hindi हिंदी",
}
ALLOWED_LINK_TYPES = {"Video", "Playlist", "One-Shot", "Web-Docs", "PDF"}
SOCIAL_BANNED_DOMAINS = {
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "twitter.com",
    "x.com",
    "pinterest.com",
    "snapchat.com",
}
TRUSTED_VIDEO_DOMAINS = {
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "freecodecamp.org",
    "khanacademy.org",
    "coursera.org",
    "edx.org",
}
GENERIC_TOPIC_TOKENS = {
    "and",
    "for",
    "the",
    "with",
    "from",
    "into",
    "your",
    "this",
    "that",
    "stage",
    "topic",
    "module",
    "course",
    "learn",
    "learning",
    "beginner",
    "intermediate",
    "advanced",
    "foundation",
    "foundations",
    "concept",
    "concepts",
    "practice",
    "project",
    "projects",
}
YOUTUBE_WATCH_RE = re.compile(
    r"^https?://(?:www\.)?(?:youtube\.com/watch\?v=[A-Za-z0-9_-]{6,}|youtu\.be/[A-Za-z0-9_-]{6,})(?:[/?&].*)?$"
)
YOUTUBE_PLAYLIST_RE = re.compile(
    r"^https?://(?:www\.)?youtube\.com/(?:playlist\?list=|watch\?.*list=)[A-Za-z0-9_-]{8,}.*$"
)
TRUSTED_DOC_DOMAINS = {
    "developer.mozilla.org",
    "w3schools.com",
    "learn.microsoft.com",
    "docs.python.org",
    "nodejs.org",
    "react.dev",
    "vuejs.org",
    "angular.dev",
    "nextjs.org",
    "tailwindcss.com",
    "docs.djangoproject.com",
    "fastapi.tiangolo.com",
    "kubernetes.io",
    "docker.com",
    "git-scm.com",
    "postgresql.org",
    "mongodb.com",
    "numpy.org",
    "pandas.pydata.org",
    "pytorch.org",
    "tensorflow.org",
    "khanacademy.org",
    "coursera.org",
    "edx.org",
    "freecodecamp.org",
}


def _extract_json_payload(content: str) -> dict:
    if not content:
        raise ValueError("Empty AI response")

    start = content.find("{")
    end = content.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Could not locate JSON object in AI response")

    payload = content[start : end + 1]
    return json.loads(payload)


def _clean_str(value, default=""):
    if value is None:
        return default
    text = str(value).strip()
    return text if text else default


def _normalize_language(value: str | None) -> str:
    language = _clean_str(value, "English").title()
    if language not in ALLOWED_LANGUAGES:
        return "English"
    return language


def _normalize_students_text(value, default: str = "1M+ learners worldwide") -> str:
    text = _clean_str(value, default)
    compact = re.sub(r"\s+", " ", text)
    if len(compact) > 50:
        compact = compact[:50].rstrip()
    if not re.search(r"\d", compact):
        return default
    return compact


def _domain_matches(domain: str, allowed: set[str]) -> bool:
    if not domain:
        return False
    d = domain.lower().replace("www.", "")
    return any(d == a or d.endswith(f".{a}") for a in allowed)


_YOUTUBE_OEMBED_CACHE: dict[str, dict] = {}
_YOUTUBE_SEARCH_CACHE: dict[str, str] = {}


def _get_youtube_oembed(url: str) -> dict:
    cached = _YOUTUBE_OEMBED_CACHE.get(url)
    if cached is not None:
        return cached

    try:
        oembed_url = (
            "https://www.youtube.com/oembed?url="
            + quote_plus(url)
            + "&format=json"
        )
        with urlopen(oembed_url, timeout=4) as resp:
            payload = json.loads(resp.read().decode("utf-8", errors="ignore"))
            status_ok = int(getattr(resp, "status", 200)) == 200
            out = {
                "ok": bool(status_ok),
                "title": _clean_str(payload.get("title"), "").lower(),
                "author": _clean_str(payload.get("author_name"), "").lower(),
            }
            _YOUTUBE_OEMBED_CACHE[url] = out
            return out
    except Exception:
        out = {"ok": False, "title": "", "author": ""}
        _YOUTUBE_OEMBED_CACHE[url] = out
        return out


def _is_embeddable_youtube_video(url: str) -> bool:
    return bool(_get_youtube_oembed(url).get("ok"))


def _youtube_search_direct_link(
    skill: str,
    stage_title: str,
    topic_title: str,
    language: str = "English",
    want_playlist: bool = False,
) -> str | None:
    suffix = "playlist" if want_playlist else "full tutorial"
    lang = _normalize_language(language)
    lang_hint = LANGUAGE_QUERY_HINTS.get(lang, "english")
    query_text = f"{skill} {stage_title} {topic_title} {lang_hint} {suffix}".strip()
    cache_key = f"{query_text.lower()}::{int(want_playlist)}"
    cached = _YOUTUBE_SEARCH_CACHE.get(cache_key)
    if cached:
        return cached

    query = quote_plus(query_text)
    search_url = f"https://www.youtube.com/results?search_query={query}"
    req = Request(
        search_url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
            )
        },
    )
    try:
        with urlopen(req, timeout=5) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception:
        return None

    if want_playlist:
        playlist_ids = re.findall(r'"playlistId":"([A-Za-z0-9_-]{10,})"', html)
        for pid in playlist_ids:
            direct = f"https://www.youtube.com/playlist?list={pid}"
            if _is_valid_link(direct, "Playlist"):
                _YOUTUBE_SEARCH_CACHE[cache_key] = direct
                return direct
        return None

    video_ids = re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', html)
    seen = set()
    for vid in video_ids:
        if vid in seen:
            continue
        seen.add(vid)
        direct = f"https://www.youtube.com/watch?v={vid}"
        if _is_valid_link(direct, "Video"):
            _YOUTUBE_SEARCH_CACHE[cache_key] = direct
            return direct
    return None


def _tokens(text: str) -> set[str]:
    raw = re.findall(r"[a-z0-9]{3,}", (text or "").lower())
    return {t for t in raw if t not in GENERIC_TOPIC_TOKENS}


def _resource_topic_tokens(skill: str, stage_title: str, topic_title: str) -> set[str]:
    return _tokens(f"{skill} {stage_title} {topic_title}")


def _url_tokens(url: str) -> set[str]:
    try:
        p = urlparse(url)
    except Exception:
        return set()
    parts = [
        (p.netloc or "").lower().replace("www.", ""),
        unquote_plus(p.path or ""),
        unquote_plus(p.query or ""),
    ]
    return _tokens(" ".join(parts))


def _is_resource_relevant(
    skill: str, stage_title: str, topic_title: str, url: str, link_type: str
) -> bool:
    expected = _resource_topic_tokens(skill, stage_title, topic_title)
    if not expected:
        return True

    parsed = urlparse(url)
    domain = (parsed.netloc or "").lower().replace("www.", "")

    if domain in {"youtube.com", "youtu.be"}:
        if link_type in {"Video", "One-Shot"} and YOUTUBE_WATCH_RE.match(url):
            meta = _get_youtube_oembed(url)
            text = f"{meta.get('title', '')} {meta.get('author', '')}"
            return len(_tokens(text) & expected) > 0
        return True

    return len(_url_tokens(url) & expected) > 0


def _is_valid_link(url: str, link_type: str) -> bool:
    if not url:
        return False
    if re.search(r"\s", url):
        return False
    try:
        parsed = urlparse(url)
    except Exception:
        return False

    if parsed.scheme not in {"http", "https"}:
        return False

    domain = (parsed.netloc or "").lower().replace("www.", "")
    if not domain:
        return False

    if _domain_matches(domain, SOCIAL_BANNED_DOMAINS):
        return False

    if link_type in {"Video", "Playlist", "One-Shot"}:
        if not _domain_matches(domain, TRUSTED_VIDEO_DOMAINS):
            return False
        if domain in {"youtube.com", "youtu.be"}:
            if link_type == "Playlist":
                return bool(YOUTUBE_PLAYLIST_RE.match(url))
            is_watch = bool(YOUTUBE_WATCH_RE.match(url))
            is_playlist = bool(YOUTUBE_PLAYLIST_RE.match(url))
            if not (is_watch or is_playlist):
                return False
            # Prevent "Video unavailable" by verifying real, embeddable YouTube videos.
            if is_watch:
                return _is_embeddable_youtube_video(url)
            return is_playlist
        return True
    return _domain_matches(domain, TRUSTED_DOC_DOMAINS | TRUSTED_VIDEO_DOMAINS)


def _sanitize_resource(skill: str, stage_title: str, topic_title: str, raw: dict):
    language = _clean_str(raw.get("language"), "English").title()
    if language not in ALLOWED_LANGUAGES:
        language = "English"

    link_type = _clean_str(raw.get("link_type"), "Video")
    if link_type not in ALLOWED_LINK_TYPES:
        link_type = "Video"

    link = _clean_str(raw.get("link"), "")
    if not _is_valid_link(link, link_type):
        return None
    if not _is_resource_relevant(skill, stage_title, topic_title, link, link_type):
        return None

    return {
        "language": language,
        "link_type": link_type,
        "link": link,
    }


def _fallback_learning_link(
    skill: str,
    stage_title: str,
    topic_title: str,
    link_type: str,
    language: str = "English",
) -> str:
    lang = _normalize_language(language)
    lang_hint = LANGUAGE_QUERY_HINTS.get(lang, "english")
    query = quote_plus(f"{skill} {stage_title} {topic_title} {lang_hint}")
    if link_type in {"Video", "One-Shot"}:
        direct_video = _youtube_search_direct_link(
            skill, stage_title, topic_title, language=lang, want_playlist=False
        )
        if direct_video:
            return direct_video
        return f"https://www.youtube.com/results?search_query={query}+full+tutorial"
    if link_type == "Playlist":
        direct_playlist = _youtube_search_direct_link(
            skill, stage_title, topic_title, language=lang, want_playlist=True
        )
        if direct_playlist:
            return direct_playlist
        direct_video = _youtube_search_direct_link(
            skill, stage_title, topic_title, language=lang, want_playlist=False
        )
        if direct_video:
            return direct_video
        return f"https://www.youtube.com/results?search_query={query}+playlist"
    if link_type == "PDF":
        return f"https://www.google.com/search?q={query}+filetype%3Apdf"
    return f"https://www.google.com/search?q={query}+official+documentation"


def _ensure_resources(
    skill: str,
    stage_title: str,
    topic_title: str,
    resources: list[dict],
    min_count: int = 2,
    preferred_language: str = "English",
) -> list[dict]:
    preferred = _normalize_language(preferred_language)
    counts = {lang: 0 for lang in ALLOWED_LANGUAGES}
    for item in resources:
        lang = item.get("language")
        if lang in counts:
            counts[lang] += 1

    fallbacks = []
    seen_links = {r.get("link") for r in resources if r.get("link")}

    # Ensure each selectable language has at least one usable link.
    for lang in ["English", "Bangla", "Hindi"]:
        if counts.get(lang, 0) > 0:
            continue
        link = _fallback_learning_link(skill, stage_title, topic_title, "Video", lang)
        if link in seen_links:
            continue
        fallbacks.append(
            {
                "language": lang,
                "link_type": "Video",
                "link": link,
            }
        )
        seen_links.add(link)
        counts[lang] = counts.get(lang, 0) + 1

    preferred_count = counts.get(preferred, 0)
    if preferred_count >= min_count:
        return resources + fallbacks

    needed = min_count - preferred_count
    # Prefer direct videos first for quick access in the selected language.
    seed_types = ["Video", "Web-Docs", "Playlist", "PDF"]
    for i in range(needed):
        ltype = seed_types[i % len(seed_types)]
        link = _fallback_learning_link(skill, stage_title, topic_title, ltype, preferred)
        if link in seen_links:
            continue
        fallbacks.append(
            {
                "language": preferred,
                "link_type": ltype,
                "link": link,
            }
        )
        seen_links.add(link)
    return resources + fallbacks


def _sanitize_course_payload(skill: str, data: dict, preferred_language: str = "English") -> dict:
    preferred = _normalize_language(preferred_language)
    course = data.get("course") or {}
    raw_paths = data.get("paths") or []

    cleaned_course = {
        "title": _clean_str(course.get("title"), f"{skill} Mastery Path"),
        "description": _clean_str(
            course.get("description"),
            f"Complete beginner-to-advanced learning system for {skill}.",
        ),
        "overview": _clean_str(
            course.get("overview"),
            f"A full roadmap to learn {skill} from fundamentals to professional mastery.",
        ),
        "icon": _clean_str(course.get("icon"), "📘"),
        "category": _clean_str(course.get("category"), "creative"),
        "level": _clean_str(course.get("level"), "beginner"),
        "students": _normalize_students_text(
            course.get("students"),
            "1M+ learners worldwide",
        ),
        "duration": _clean_str(course.get("duration"), "6-12 months"),
        "rating": float(course.get("rating") or 4.7),
        "color": _clean_str(course.get("color"), "from-blue-500 to-purple-600"),
        "tags": list(course.get("tags") or []),
        "career_opportunities": list(course.get("career_opportunities") or []),
        "tools_needed": list(course.get("tools_needed") or []),
        "special_features": list(course.get("special_features") or []),
    }

    cleaned_paths = []
    for p_idx, path in enumerate(raw_paths[:4]):
        roadmaps = path.get("roadmaps") or []
        cleaned_roadmaps = []
        for r_idx, roadmap in enumerate(roadmaps[:24]):
            stage_title = _clean_str(roadmap.get("title"), f"Stage {r_idx + 1}")
            sub_maps = roadmap.get("sub_maps") or []
            cleaned_submaps = []
            for s_idx, sub in enumerate(sub_maps[:12]):
                topic_title = _clean_str(sub.get("title"), f"Topic {s_idx + 1}")
                raw_resources = sub.get("resources") or []
                resources = []
                seen_links = set()
                for res in raw_resources[:10]:
                    cleaned = _sanitize_resource(skill, stage_title, topic_title, res or {})
                    if not cleaned:
                        continue
                    link = cleaned["link"]
                    if link in seen_links:
                        continue
                    seen_links.add(link)
                    resources.append(cleaned)
                resources = _ensure_resources(
                    skill,
                    stage_title,
                    topic_title,
                    resources,
                    min_count=2,
                    preferred_language=preferred,
                )

                cleaned_submaps.append(
                    {
                        "title": topic_title,
                        "micro_desc": _clean_str(sub.get("micro_desc"), topic_title),
                        "resources": resources,
                    }
                )

            if not cleaned_submaps:
                cleaned_submaps = [
                    {
                        "title": f"Stage {r_idx + 1} Foundations",
                        "micro_desc": "Core concepts and practice.",
                        "resources": _ensure_resources(
                            skill,
                            stage_title,
                            "Foundations",
                            [],
                            min_count=2,
                            preferred_language=preferred,
                        ),
                    }
                ]

            cleaned_roadmaps.append(
                {
                    "title": _clean_str(roadmap.get("title"), f"Stage {r_idx + 1}"),
                    "micro_desc": _clean_str(
                        roadmap.get("micro_desc"),
                        "Concepts, practice, and real-world application.",
                    ),
                    "duration": _clean_str(roadmap.get("duration"), "1-2 weeks"),
                    "sub_maps": cleaned_submaps,
                }
            )

        if not cleaned_roadmaps:
            cleaned_roadmaps = [
                {
                    "title": "Foundation Stage",
                    "micro_desc": f"Essential beginner fundamentals for {skill}.",
                    "duration": "1-2 weeks",
                    "sub_maps": [
                        {
                            "title": "Core Concepts",
                            "micro_desc": "Learn fundamentals and essential terminology.",
                            "resources": _ensure_resources(
                                skill,
                                "Foundation Stage",
                                "Core Concepts",
                                [],
                                min_count=2,
                                preferred_language=preferred,
                            ),
                        }
                    ],
                }
            ]

        cleaned_paths.append(
            {
                "title": _clean_str(path.get("title"), f"Path {p_idx + 1}"),
                "mini_desc": _clean_str(path.get("mini_desc"), "Structured learning path."),
                "level": _clean_str(path.get("level"), "beginner"),
                "duration": _clean_str(path.get("duration"), "3-6 months"),
                "roadmaps": cleaned_roadmaps,
            }
        )

    if not cleaned_paths:
        cleaned_paths = [
            {
                "title": "Complete Path",
                "mini_desc": f"Beginner to mastery roadmap for {skill}.",
                "level": "beginner",
                "duration": "6-12 months",
                "roadmaps": [
                    {
                        "title": "Foundation Stage",
                        "micro_desc": "Start from basics and build strong fundamentals.",
                        "duration": "1-2 weeks",
                        "sub_maps": [
                            {
                                "title": "Getting Started",
                                "micro_desc": f"Introduction and setup for {skill}.",
                                "resources": _ensure_resources(
                                    skill,
                                    "Foundation Stage",
                                    "Getting Started",
                                    [],
                                    min_count=2,
                                    preferred_language=preferred,
                                ),
                            }
                        ],
                    }
                ],
            }
        ]

    return {"course": cleaned_course, "paths": cleaned_paths}


def _validate_course_payload(payload: dict):
    paths = payload.get("paths") or []
    if not paths:
        raise ValueError("AI output rejected: no paths generated")

    for p_idx, path in enumerate(paths, start=1):
        roadmaps = path.get("roadmaps") or []
        if not roadmaps:
            raise ValueError(f"AI output rejected: path {p_idx} has no stages")

        for r_idx, roadmap in enumerate(roadmaps, start=1):
            sub_maps = roadmap.get("sub_maps") or []
            if not sub_maps:
                raise ValueError(
                    f"AI output rejected: path {p_idx} stage {r_idx} has no topics"
                )
            for s_idx, sub in enumerate(sub_maps, start=1):
                resources = sub.get("resources") or []
                if not resources:
                    raise ValueError(
                        f"AI output rejected: path {p_idx} stage {r_idx} topic {s_idx} has no resources"
                    )


def _generate_skill_course_once(skill: str, temperature: float, preferred_language: str = "English"):
    preferred = _normalize_language(preferred_language)
    prompt = f"""
You are an AI learning architect.

Create a COMPLETE and PRACTICAL beginner-to-master learning program for the skill: "{skill}".

Quality requirements:
- Cover full progression: fundamentals -> intermediate practice -> advanced projects -> mastery topics.
- Include enough depth to become job-ready / professional in this skill.
- Use ONLY real learning resources.
- Resource links must be valid absolute URLs starting with https://
- Prefer trusted educational sources (YouTube education channels, MDN, official docs, freeCodeCamp, Khan Academy, Coursera/edX).
- Do NOT output entertainment/social links (no Facebook/Instagram/TikTok/X).
- STRICT WARNING: if links are invalid, generic, or not directly educational, the output will be rejected.
- Never default to Python resources unless the requested skill is Python.
- For YouTube links use direct watch/playlist URLs only (no search URLs, no channel home URLs).
- Keep all content educational and directly related to the topic.
- Primary resource language must be {preferred}. Use {preferred} resources first.
- Include realistic worldwide learner demand for this skill in "course.students" (e.g. "12M+ learners worldwide").
- Use concise, useful titles and descriptions.
- Return clean JSON only. No markdown.

Return ONLY valid JSON in this structure:

{{
  "course": {{
    "title": "",
    "description": "",
    "overview": "",
    "icon": "📘",
    "category": "programming",
    "level": "beginner",
    "students": "12M+ learners worldwide",
    "duration": "3-6 months",
    "rating": 4.8,
    "color": "from-blue-500 to-purple-600",
    "tags": [],
    "career_opportunities": [],
    "tools_needed": [],
    "special_features": []
  }},
  "paths": [
    {{
      "title": "",
      "mini_desc": "",
      "level": "beginner",
      "duration": "4-5 months",
      "roadmaps": [
        {{
          "title": "",
          "micro_desc": "",
          "duration": "2-3 weeks",
          "sub_maps": [
            {{
              "title": "",
              "micro_desc": "",
              "resources": [
                {{
                  "language": "English",
                  "link_type": "Video",
                  "link": "https://..."
                }}
              ]
            }}
          ]
        }}
      ]
    }}
  ]
}}
"""

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=7000,
    )

    content = completion.choices[0].message.content
    raw_data = _extract_json_payload(content)
    cleaned = _sanitize_course_payload(skill, raw_data, preferred_language=preferred)
    _validate_course_payload(cleaned)
    return cleaned


def _build_fallback_course_payload(skill: str, preferred_language: str = "English") -> dict:
    preferred = _normalize_language(preferred_language)
    stages = [
        "Foundations",
        "Core Concepts",
        "Tools and Setup",
        "Hands-on Practice",
        "Intermediate Techniques",
        "Advanced Workflows",
        "Real Projects",
        "Mastery and Interview Prep",
    ]
    topics = ["Theory", "Guided Practice", "Application"]

    def build_roadmaps(prefix: str):
        roadmaps = []
        for idx, stage in enumerate(stages, start=1):
            sub_maps = []
            for topic in topics:
                sub_maps.append(
                    {
                        "title": f"{stage} - {topic}",
                        "micro_desc": f"{topic} for {skill} at the {stage.lower()} level.",
                        "resources": _ensure_resources(
                            skill,
                            f"{prefix} {idx}: {stage}",
                            topic,
                            [],
                            min_count=2,
                            preferred_language=preferred,
                        ),
                    }
                )
            roadmaps.append(
                {
                    "title": f"{prefix} {idx}: {stage}",
                    "micro_desc": f"Structured {stage.lower()} progression for {skill}.",
                    "duration": "1-2 weeks",
                    "sub_maps": sub_maps,
                }
            )
        return roadmaps

    return {
        "course": {
            "title": f"{skill} Mastery Path",
            "description": f"Complete beginner-to-master roadmap for {skill}.",
            "overview": f"Learn {skill} through progressive stages, hands-on practice, and project-based mastery.",
            "icon": "📘",
            "category": "creative",
            "level": "beginner",
            "students": "1M+ learners worldwide",
            "duration": "6-12 months",
            "rating": 4.7,
            "color": "from-blue-500 to-purple-600",
            "tags": [skill, "Beginner to Advanced", "Projects"],
            "career_opportunities": ["Freelancer", "Specialist", "Instructor"],
            "tools_needed": ["Internet Access", "Practice Environment"],
            "special_features": ["Structured Curriculum", "Project Roadmap"],
        },
        "paths": [
            {
                "title": "Guided Mastery Path",
                "mini_desc": "Step-by-step path for structured learners.",
                "level": "beginner",
                "duration": "6-9 months",
                "roadmaps": build_roadmaps("Guided Stage"),
            },
            {
                "title": "Project-first Path",
                "mini_desc": "Build real outcomes while learning core concepts.",
                "level": "beginner",
                "duration": "6-9 months",
                "roadmaps": build_roadmaps("Project Stage"),
            },
        ],
    }


def generate_skill_course(skill, preferred_language: str = "English"):
    preferred = _normalize_language(preferred_language)
    # Retry with stricter determinism when AI output fails quality validation.
    attempts = [0.2, 0.1, 0.0]
    last_error = None
    for temp in attempts:
        try:
            return _generate_skill_course_once(skill, temp, preferred_language=preferred)
        except Exception as exc:
            last_error = exc
            continue
    fallback = _build_fallback_course_payload(skill, preferred_language=preferred)
    _validate_course_payload(fallback)
    return fallback


def generate_exam_for_roadmap(roadmap):
    """
    Generate an exam with MIXED question types: multiple choice and short answer (direct write).
    Based on WHAT STUDENTS LEARN from this stage — concepts, skills, topics.
    """
    sections = []
    sections.append(f"Stage: {roadmap.title}\nWhat students learn in this stage: {roadmap.micro_desc or 'N/A'}\n")
    for sub in roadmap.sub_maps.all().order_by("id"):
        parts = [f"  - Topic/Session: {sub.title}"]
        if sub.micro_desc:
            parts.append(f"    Content covered: {sub.micro_desc}")
        sections.append("\n".join(parts))
    context = "\n".join(sections) if sections else f"Stage: {roadmap.title}\n{roadmap.micro_desc or 'General content'}"

    prompt = f"""You are an exam creator for a learning platform. Create a mix of question types that test WHAT THE STUDENT LEARNS from this stage — concepts, skills, and subject matter.

IMPORTANT: Do NOT ask about resource types (Video, PDF, etc.) or language. ONLY ask about the actual LEARNING CONTENT.

LEARNING CONTENT FOR THIS STAGE:
{context}

Create an exam with exactly 10 questions. Use BOTH types:
1) multiple_choice: 5–6 questions. Each has question_text, options (array of 4 strings), correct_index (0–3).
2) short_answer: 4–5 questions (direct write — student types their answer). Each has question_text and expected_keywords: an array of 3–6 key words or short phrases that a correct answer should contain (e.g. ["HTML", "markup", "tags"]). The student's text will be checked for these keywords.

Return ONLY valid JSON (no markdown, no code block):
{{
  "questions": [
    {{
      "type": "multiple_choice",
      "question_text": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0
    }},
    {{
      "type": "short_answer",
      "question_text": "Explain or define X in your own words.",
      "expected_keywords": ["keyword1", "keyword2", "keyword3"]
    }}
  ]
}}
"""
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        max_tokens=4000,
    )
    content = completion.choices[0].message.content.strip()
    if "```" in content:
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content[content.find("{"): content.rfind("}") + 1]
    data = json.loads(content)
    raw = data.get("questions", [])
    out = []
    for i, q in enumerate(raw[:10]):
        qtype = (q.get("type") or "multiple_choice").strip().lower()
        if qtype == "short_answer":
            out.append({
                "type": "short_answer",
                "question_text": (q.get("question_text") or "").strip() or f"Question {i+1}",
                "expected_keywords": list(q.get("expected_keywords") or [])[:8],
            })
        else:
            opts = q.get("options") or []
            if len(opts) < 2:
                continue
            correct_index = max(0, min(int(q.get("correct_index", 0)), len(opts) - 1))
            out.append({
                "type": "multiple_choice",
                "question_text": (q.get("question_text") or "").strip() or f"Question {i+1}",
                "options": opts[:4],
                "correct_index": correct_index,
            })
    return out
