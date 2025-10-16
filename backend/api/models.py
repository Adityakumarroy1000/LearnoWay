# api/models.py
from django.db import models
from django.utils import timezone


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
        ("Blue and Purple", "from-blue-500 to-purple-600"),
        ("Green and teal", "from-green-500 to-teal-600"),
        ("Yellow and Orange", "from-yellow-500 to-orange-600"),
        ("Amber and Orange", "from-amber-500 to-orange-600"),
        ("Pink and Rose", "from-pink-500 to-rose-600"),
        ("Pink and Red", "from-pink-500 to-red-600"),
        ("Purple and Indigo", "from-purple-500 to-indigo-600"),
        ("Cyan and Blue", "from-cyan-500 to-blue-600"),
        ("Indigo and Blue", "from-indigo-500 to-blue-600"),
        ("Orange and Red", "from-orange-500 to-red-600"),
        ("Emerald and Green", "from-emerald-500 to-green-600"),
        ("Red and Pink", "from-red-500 to-pink-600"),
    ]


    title = models.CharField(max_length=255)
    description = models.TextField()
    overview = models.TextField(blank=True, null=True, help_text="Detailed course overview")
    icon = models.CharField(max_length=10, help_text="Emoji or icon symbol", blank=True, null=True)  
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="creative")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    students = models.CharField(max_length=50, help_text="e.g. 12.5k, 5.4k", default=0)
    duration = models.CharField(max_length=50, help_text="e.g. 3-6 months")
    rating = models.FloatField(default=0.0)
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, default="Blue and Purple")

    tags = models.JSONField(default=list, blank=True)  
    has_paths = models.BooleanField(default=True)
    path_count = models.PositiveIntegerField(default=0)
    special_features = models.JSONField(default=list, blank=True)


    career_opportunities = models.JSONField(default=list, blank=True, help_text="List of possible careers")  
    tools_needed = models.JSONField(default=list, blank=True, help_text="Tools required for the course")  
    paths = models.JSONField(default=list, blank=True, help_text="Different learning paths (frontend, backend, etc.)")

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


