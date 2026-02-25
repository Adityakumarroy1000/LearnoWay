# skils/admin.py
import nested_admin
from django.contrib import admin
from .models import CourseCard, Path, Roadmap, SubMap,Resource

# Custom Admin Branding
admin.site.site_header = "LearnoWay Admin"
admin.site.site_title = "LearnoWay Admin Portal"
admin.site.index_title = "Welcome to LearnoWay Admin"

# Inline Path model inside CourseCard
class ResourceInline(nested_admin.NestedStackedInline):
    model = Resource
    extra = 1
    fields = (
        "sub_map",
        "link",
        "link_type",
        "language"
    )
    show_change_link = True

class SubMapInline(nested_admin.NestedStackedInline):
    model = SubMap
    extra = 1
    fields = ("title","micro_desc", "resources_count",)
    readonly_fields = ("resources_count",)
    show_change_link = True
    inlines = [ResourceInline]



class RoadmapInline(nested_admin.NestedStackedInline):
    model = Roadmap
    extra = 1
    fields = ('title', 'micro_desc', 'duration', 'sub_map_count')
    # Optional: allows collapsing
    readonly_fields = ("sub_map_count", )
    verbose_name_plural = "Roadmaps"
    inlines = [SubMapInline]




class PathInline(nested_admin.NestedStackedInline):
    model = Path
    inlines = [RoadmapInline]
    extra = 1 # makes each Path collapsible
    readonly_fields = ("roadmap_count", )

@admin.register(CourseCard)
class CourseCardAdmin(nested_admin.NestedModelAdmin):
    list_display = (
        "title",
        "category",
        "level",
        "students",
        "duration",
        "rating",
        "path_count",
        "created_at",
    )
    list_filter = ("level", "category", "created_at")
    search_fields = ("title", "description", "category")

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
                "special_features",
            )
        }),
        ("Courses/Skill Info", {
            "fields": (
                "overview",
                "career_opportunities",
                "tools_needed",
            )
        }),
        ("Metadata", {
            "fields": ("path_count", "created_at"),
            "classes": ("collapse",),  # collapsible in admin
        }),
    )

    readonly_fields = ("path_count", "created_at")
    inlines = [PathInline]  # show related paths inline

    class Media:
        css = {
            'all': (r'admin/css/custom_adminlte.css',),
        }


@admin.register(Path)
class PathAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "level", "duration")
    list_filter = ("level", "course")
    search_fields = ("title", "mini_desc")
    readonly_fields = ("roadmap_count",)
    inlines = [RoadmapInline]
    class Media:
        css = {
            'all': (r'admin/css/custom_adminlte.css',)
        }



@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ("title", "path", "duration", "sub_map_count", )
    readonly_fields = ("sub_map_count",)
    search_fields = ("title", "path__title")
    inlines = [SubMapInline]


@admin.register(SubMap)
class SubMapAdmin(nested_admin.NestedModelAdmin):
    inlines = [ResourceInline]
    list_display = ("title", "micro_desc", "roadmap", "resources_count", )
    readonly_fields = ("resources_count",)


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = (
        "sub_map",
        "link",
        "link_type",
        "language",
    )
