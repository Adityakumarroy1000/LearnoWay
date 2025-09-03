# api/admin.py
from django.contrib import admin
from .models import Course
admin.site.site_header = "LMS Admin"
admin.site.site_title = "LMS Admin Portal"
admin.site.index_title = "Welcome to LMS Admin"

class CustomAdminSite(admin.AdminSite):
    class Media:
        css = {
            'all': ('css/admin_custom.css',)
        }
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "video_link")
