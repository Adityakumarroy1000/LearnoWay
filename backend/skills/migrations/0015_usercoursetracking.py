from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("skills", "0014_rename_quiz_to_exam_session"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="UserCourseTracking",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "selected_language",
                    models.CharField(
                        choices=[
                            ("english", "English"),
                            ("bangla", "Bangla"),
                            ("hindi", "Hindi"),
                        ],
                        default="english",
                        max_length=20,
                    ),
                ),
                ("completed_sub_map_ids", models.JSONField(blank=True, default=list)),
                ("activity_by_date", models.JSONField(blank=True, default=dict)),
                (
                    "last_accessed_at",
                    models.DateTimeField(default=django.utils.timezone.now),
                ),
                ("last_activity_at", models.DateTimeField(blank=True, null=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "course",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_tracking",
                        to="skills.coursecard",
                    ),
                ),
                (
                    "selected_path",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="selected_by_users",
                        to="skills.path",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="course_tracking",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "unique_together": {("user", "course")},
            },
        ),
    ]
