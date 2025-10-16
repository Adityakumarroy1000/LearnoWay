from django.contrib import admin
from .models import CourseCard
# Custom Admin Branding
admin.site.site_header = "LMS Admin"
admin.site.site_title = "LMS Admin Portal"
admin.site.index_title = "Welcome to LMS Admin"


@admin.register(CourseCard)
class CourseCard(admin.ModelAdmin):
    list_display = (
        "title",
        "description",
        "icon",
        "level",
        "category",
        "students",
        "duration",
        "rating",
        "color",
        "tags",
        "has_paths",
        "path_count",
        "special_features",
        "created_at",
    )
    list_filter = ("level", "category", "created_at")
    search_fields = ("title", "description", "category")  # nice UI for ManyToManyField
    fieldsets = (
        ("Card Info", {
          "fields": (
            "title",
        "description",
        "icon",
        "level",
        "category",
        "students",
        "duration",
        "rating",
        "color",
        "tags",
        "has_paths",
        "path_count",
        "special_features",
          )
        }),
        ("Courses/Skill Info", {
          "fields": (
            "overview",
            "career_opportunities",
            "tools_needed",
            "paths",
          )
        }),
        ("Metadata", {
            "fields": ("created_at",),
            "classes": ("collapse",),  # collapsible in admin
        }),
    )
readonly_fields = ("created_at",)



