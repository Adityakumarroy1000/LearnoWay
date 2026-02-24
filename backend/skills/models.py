# skils/models.py
from django.db import models
from django.utils import timezone
from django.conf import settings


class CourseCard(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    CATEGORY_CHOICES = [
        ('programming', 'Programming'),
        ('marketing', 'Marketing'),
        ('design', 'Design'),
        ('data', 'Data'),
        ('music', 'Music'),
        ('creative', 'Creative'),
        ('lifestyle', 'Lifestyle'),
        ('language', 'Language'),
        ('health', 'Health'),
    ]

    COLOR_CHOICES = [
        ("from-blue-500 to-purple-600", "Blue and Purple"),
        ("from-green-500 to-teal-600", "Green and teal"),
        ("from-yellow-500 to-orange-600", "Yellow and Orange"),
        ("from-amber-500 to-orange-600", "Amber and Orange"),
        ("from-pink-500 to-rose-600", "Pink and Rose"),
        ("from-pink-500 to-red-600", "Pink and Red"),
        ("from-purple-500 to-indigo-600", "Purple and Indigo"),
        ("from-cyan-500 to-blue-600", "Cyan and Blue"),
        ("from-indigo-500 to-blue-600", "Indigo and Blue"),
        ("from-orange-500 to-red-600", "Orange and Red"),
        ("from-emerald-500 to-green-600", "Emerald and Green"),
        ("from-red-500 to-pink-600", "Red and Pink"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    overview = models.TextField(
        blank=True, null=True, help_text="Detailed course overview")
    icon = models.CharField(
        max_length=10, help_text="Emoji or icon symbol", blank=True, null=True)
    category = models.CharField(
        max_length=50, choices=CATEGORY_CHOICES, default="creative")
    level = models.CharField(
        max_length=20, choices=LEVEL_CHOICES, default='beginner')
    students = models.CharField(
        max_length=50, help_text="e.g. 12.5k, 5.4k", default=0)
    duration = models.CharField(max_length=50, help_text="e.g. 3-6 months")
    rating = models.FloatField(default=0.0)
    color = models.CharField(choices=COLOR_CHOICES, default="Blue and Purple")

    tags = models.JSONField(default=list, blank=True)
    has_paths = models.BooleanField(default=True)
    path_count = models.PositiveIntegerField(default=0)
    special_features = models.JSONField(default=list, blank=True)

    career_opportunities = models.JSONField(
        default=list, blank=True, help_text="List of possible careers")
    tools_needed = models.JSONField(
        default=list, blank=True, help_text="Tools required for the course")
    paths = models.JSONField(
        default=list, blank=True, help_text="Different learning paths (frontend, backend, etc.)")
    created_at = models.DateTimeField(default=timezone.now)

    def update_path_count(self):
        """Update path count based on related Path objects"""
        self.path_count = self.path_items.count()  # use related manager
        self.save()

    def __str__(self):
        return self.title


class Path(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    course = models.ForeignKey(
        CourseCard, related_name="path_items", on_delete=models.CASCADE)
    icon = models.CharField(max_length=10, blank=True, null=True)
    title = models.CharField(max_length=255)
    mini_desc = models.CharField(max_length=255)
    level = models.CharField(
        max_length=20, choices=LEVEL_CHOICES, default='beginner')
    duration = models.CharField(max_length=50, help_text="e.g. 4–5 months")
    roadmap_count = models.PositiveIntegerField(default=0, editable=False)

    def update_roadmap_count(self):
        """Update roadmap count based on related roadmaps"""
        self.roadmap_count = self.roadmaps.count()
        self.save()

    def save(self, *args, **kwargs):
        """When a Path is saved, update path_count on its course"""
        super().save(*args, **kwargs)
        self.course.update_path_count()

    def delete(self, *args, **kwargs):
        """When deleted, also update the course path_count"""
        course = self.course
        super().delete(*args, **kwargs)
        course.update_path_count()

    def __str__(self):
        return f"{self.title} ({self.course.title})"


class Roadmap(models.Model):
    path = models.ForeignKey(
        Path, related_name="roadmaps", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    micro_desc = models.CharField(max_length=255)
    duration = models.CharField(max_length=50, help_text="e.g. 2–3 weeks")
    sub_map_count = models.PositiveIntegerField(default=0, editable=False)

    def __str__(self):
        return f"{self.title} ({self.path.title})"

    def save(self, *args, **kwargs):
        """When a roadmap is saved, update roadmap_count in path"""
        super().save(*args, **kwargs)
        self.path.update_roadmap_count()

    def delete(self, *args, **kwargs):
        path = self.path
        super().delete(*args, **kwargs)
        path.update_roadmap_count()

    def update_sub_map_count(self):
        """Automatically update number of SubMaps"""
        self.sub_map_count = self.sub_maps.count()
        self.save()


class SubMap(models.Model):
    roadmap = models.ForeignKey(
        "Roadmap", related_name="sub_maps", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    micro_desc = models.CharField(max_length=255, blank=True, null=True)
    resources_count = models.PositiveIntegerField(default=0, editable=False)

    def __str__(self):
        return f"{self.title} ({self.roadmap.title})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.roadmap.update_sub_map_count()

    def delete(self, *args, **kwargs):
        roadmap = self.roadmap
        super().delete(*args, **kwargs)
        roadmap.update_sub_map_count()

    def update_resources_count(self):
        """Automatically update number of Resources"""
        self.resources_count = self.resources.count()
        self.save()


class Resource(models.Model):
    LANGUAGE_CHOICES = [
        ('English', 'English'),
        ('Bangla', 'Bangla'),
        ('Hindi', 'Hindi'),
    ]

    TYPE_CHOICES = [
        ('Video', 'Video'),
        ('Playlist', 'Playlist'),
        ('One-Shot', 'One-Shot'),
        ('Web-Docs', 'Web-Docs'),
        ('PDF', 'PDF'),
    ]

    sub_map = models.ForeignKey(
        "SubMap", related_name="resources", on_delete=models.CASCADE
    )

    language = models.CharField(
        max_length=20, choices=LANGUAGE_CHOICES, default='English'
    )

    link_type = models.CharField(
        max_length=20, choices=TYPE_CHOICES, default='Video'
    )

    link = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.sub_map.title} - {self.language} - {self.link_type}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.sub_map.update_resources_count()

    def delete(self, *args, **kwargs):
        sub_map = self.sub_map
        super().delete(*args, **kwargs)
        sub_map.update_resources_count()


class Quiz(models.Model):
    """One quiz per roadmap (stage). AI-generated questions."""
    roadmap = models.OneToOneField(
        Roadmap, related_name="quiz", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Quiz for {self.roadmap.title}"


class QuizQuestion(models.Model):
    """Multiple choice question for a quiz."""
    quiz = models.ForeignKey(
        Quiz, related_name="questions", on_delete=models.CASCADE
    )
    order = models.PositiveSmallIntegerField(default=0)
    question_text = models.TextField()
    options = models.JSONField(
        help_text="List of answer options, e.g. ['A', 'B', 'C', 'D']"
    )
    correct_index = models.PositiveSmallIntegerField(
        help_text="0-based index of the correct option"
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.question_text[:50]


class StageProgress(models.Model):
    """Tracks which stage (roadmap) a user has passed via exam."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="stage_progress",
        on_delete=models.CASCADE,
    )
    roadmap = models.ForeignKey(
        Roadmap, related_name="passed_by", on_delete=models.CASCADE
    )
    passed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = [["user", "roadmap"]]

    def __str__(self):
        return f"{self.user} passed {self.roadmap.title}"


class ExamSession(models.Model):
    """One-time AI-generated exam for a single attempt. Can include MC and short-answer (direct write)."""
    session_key = models.CharField(max_length=64, unique=True, db_index=True)
    roadmap = models.ForeignKey(
        Roadmap, related_name="exam_sessions", on_delete=models.CASCADE
    )
    questions_json = models.JSONField(
        help_text="List of {type, question_text, options?, correct_index?, expected_keywords?}"
    )
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"ExamSession {self.session_key[:8]}…"

class UserCourseTracking(models.Model):
    """Per-user learning tracking for a course. Stored on server, not device."""

    LANGUAGE_CHOICES = [
        ("english", "English"),
        ("bangla", "Bangla"),
        ("hindi", "Hindi"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="course_tracking",
        on_delete=models.CASCADE,
    )
    course = models.ForeignKey(
        CourseCard,
        related_name="user_tracking",
        on_delete=models.CASCADE,
    )
    selected_path = models.ForeignKey(
        Path,
        related_name="selected_by_users",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    selected_language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        default="english",
    )
    completed_sub_map_ids = models.JSONField(default=list, blank=True)
    activity_by_date = models.JSONField(default=dict, blank=True)
    last_accessed_at = models.DateTimeField(default=timezone.now)
    last_activity_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["user", "course"]]

    def __str__(self):
        return f"{self.user} tracking {self.course}"
