# api/models.py
from django.db import models
from django.utils import timezone


class Skill(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    video_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Course(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    video_link = models.URLField()

    def __str__(self):
        return self.name
