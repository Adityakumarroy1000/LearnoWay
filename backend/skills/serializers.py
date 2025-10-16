from rest_framework import serializers
from .models import CourseCard, Path, Roadmap, SubMap, Resource


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'language', 'link_type', 'link']


class SubMapSerializer(serializers.ModelSerializer):
    resources = serializers.SerializerMethodField()

    class Meta:
        model = SubMap
        fields = ['id', 'title', "micro_desc", 'resources_count', 'resources']

    def create(self, validated_data):
        resources_data = validated_data.pop('resources', [])
        sub_map = SubMap.objects.create(**validated_data)
        for resource_data in resources_data:
            Resource.objects.create(sub_map=sub_map, **resource_data)
        sub_map.update_resources_count()
        return sub_map

    def get_resources(self, obj):
        grouped = {}
        for res in obj.resources.all():
            lang = res.language
            if lang not in grouped:
                grouped[lang] = []
            grouped[lang].append({
                "link_type": res.link_type,
                "link": res.link,
            })
        return grouped



class RoadmapSerializer(serializers.ModelSerializer):
    sub_maps = SubMapSerializer(many=True, read_only=False)

    class Meta:
        model = Roadmap
        fields = ['id', 'title', 'micro_desc',
                  'duration', 'sub_map_count', 'sub_maps']

    def create(self, validated_data):
        sub_maps_data = validated_data.pop('sub_maps', [])
        roadmap = Roadmap.objects.create(**validated_data)
        for sub_map_data in sub_maps_data:
            SubMap.objects.create(roadmap=roadmap, **sub_map_data)
        roadmap.update_sub_map_count()
        return roadmap


class PathSerializer(serializers.ModelSerializer):
    roadmaps = RoadmapSerializer(many=True, read_only=False)

    class Meta:
        model = Path
        fields = ['id', 'icon', 'title', 'mini_desc',
                  'level', 'duration', 'roadmap_count', 'roadmaps']

    def create(self, validated_data):
        roadmaps_data = validated_data.pop('roadmaps', [])
        path = Path.objects.create(**validated_data)
        for roadmap_data in roadmaps_data:
            Roadmap.objects.create(path=path, **roadmap_data)
        path.update_roadmap_count()
        return path


class CourseSerializer(serializers.ModelSerializer):
    path_items = PathSerializer(many=True, read_only=False)

    class Meta:
        model = CourseCard
        fields = [
            'id', 'title', 'description', 'overview', 'icon', 'category', 'level',
            'students', 'duration', 'rating', 'color', 'tags', 'has_paths',
            'path_count', 'special_features', 'career_opportunities',
            'tools_needed',  'path_items'
        ]
        read_only_fields = ['path_count',]

    def create(self, validated_data):
        paths_data = validated_data.pop('path_items', [])
        course = CourseCard.objects.create(**validated_data)
        for path_data in paths_data:
            Path.objects.create(course=course, **path_data)
        course.update_path_count()
        return course
