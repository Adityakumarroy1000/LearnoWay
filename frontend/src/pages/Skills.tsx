import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Clock, Users, Star, Filter } from "lucide-react";
import CustomNav from "@/components/CustomNavbar";
import { buildApiUrl } from "@/api/config";
const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showGenerateHint, setShowGenerateHint] = useState(false);


  const categories = [
    "All",
    "programming",
    "marketing",
    "design",
    "data",
    "music",
    "creative",
    "lifestyle",
    "language",
    "health",
  ];



  const normalize = (text: string = "") =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

  const hasSimilarSkill = (query: string) => {
    const q = normalize(query);
    if (!q) return false;

    return skills.some((skill) => {
      const title = normalize(skill.title);

      return title === q;
    });
  };


  // ✅ Fetch data from Django API
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(buildApiUrl("/skills/courses/"));
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setSkills(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // ✅ Filter system
  const filteredSkills = skills.filter((skill) => {
    const q = normalize(searchTerm);
    const title = normalize(skill.title);
    const desc = normalize(skill.description || "");
    const matchesSearch = !q || title.includes(q) || desc.includes(q);

    const matchesCategory =
      selectedCategory === "All" ||
      skill.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLevel =
      skillFilter === "all" ||
      skill.level.toLowerCase() === skillFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesLevel;
  });

  useEffect(() => {
    const q = normalize(searchTerm);
    const searchHasAnyMatch = skills.some((skill) => {
      const title = normalize(skill.title);
      const desc = normalize(skill.description || "");
      return title.includes(q) || desc.includes(q);
    });
    const exactTitleExists = skills.some(
      (skill) => normalize(skill.title) === q
    );

    if (
      searchTerm.trim().length > 2 &&
      !searchHasAnyMatch &&
      !exactTitleExists
    ) {
      setShowGenerateHint(true);
    } else {
      setShowGenerateHint(false);
    }
  }, [searchTerm, skills]);



  // ✅ Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-600 dark:text-gray-300">
        Loading skills...
      </div>
    );
  }

  // ✅ Error UI
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-red-500">
        Error: {error}
      </div>
    );
  }

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "expert":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // inside your Skills component
const handleAISearch = async () => {
  if (!searchTerm.trim()) return;

  if (hasSimilarSkill(searchTerm)) {
    setShowGenerateHint(false);
    return;
  }

  try {
    setAiLoading(true);
    const storedLanguage = (localStorage.getItem("language") || "english").toLowerCase();
    const selectedLanguage =
      storedLanguage === "bangla" || storedLanguage === "hindi"
        ? storedLanguage
        : "english";

    const res = await fetch(
      buildApiUrl("/skills/courses/ai-generate/"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: searchTerm.trim(),
          selected_language: selectedLanguage,
        }),
      }
    );

    if (!res.ok) throw new Error("AI generation failed");

    const data = await res.json();

    // ✅ Add the generated skill to skills
    setSkills((prevSkills) => {
      if (
        prevSkills.some((s) => normalize(s.title) === normalize(data.title))
      ) {
        return prevSkills;
      }
      return [data, ...prevSkills];
    });

    // ❌ DO NOT clear the search term
    setShowGenerateHint(false);
  } catch (err) {
    setError("Failed to generate skill");
  } finally {
    setAiLoading(false);
  }
};







  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 🌱 Navbar */}
      <CustomNav />

      {/* 🌟 Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-scale-in">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover structured roadmaps with curated free resources to master
            any skill you want.
          </p>
        </div>

        {/* Search + Filters */}
        <div
          className="mb-8 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search or type a skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && showGenerateHint && !aiLoading) {
                    handleAISearch();
                  }
                }}
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-40 hover:scale-105 transition-transform duration-200">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full hover:scale-105 transition-all duration-300 animate-fade-in capitalize"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, index) => (
            <Card
              key={skill.id}
              className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-3 border-0 overflow-hidden dark:bg-gray-800 animate-fade-in hover:rotate-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`h-2 bg-gradient-to-r ${skill.color} group-hover:h-3 transition-all duration-300`}
              ></div>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {skill.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="secondary"
                      className={`${getDifficultyColor(
                        skill.level
                      )} hover:scale-110 transition-transform duration-200`}
                    >
                      {skill.level}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs animate-fade-in"
                      style={{ animationDelay: "0.1s" }}
                    >
                      {skill.path_count} paths
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-all duration-300 dark:text-white">
                  {skill.title}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                  {skill.description}
                </CardDescription>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {skill.tags?.slice(0, 3).map((tag, tagIndex) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs hover:scale-110 transition-transform duration-200 animate-fade-in"
                      style={{ animationDelay: `${tagIndex * 0.05}s` }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Special Features */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Special Features:
                  </p>
                  <div className="space-y-1">
                    {skill.special_features?.slice(0, 2).map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 animate-fade-in"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>

              {/* Bottom Info */}
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1 hover:text-blue-600 transition-colors duration-200">
                    <Users className="w-4 h-4" />
                    {skill.students}
                  </div>
                  <div className="flex items-center gap-1 hover:text-green-600 transition-colors duration-200">
                    <Clock className="w-4 h-4" />
                    {skill.duration}
                  </div>
                  <div className="flex items-center gap-1 hover:text-yellow-600 transition-colors duration-200">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:animate-pulse" />
                    {skill.rating}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium capitalize">
                    {skill.category}
                  </div>
                </div>

                <Link to={`/skill/${skill.id}`}>
                  <Button className="w-full group-hover:bg-blue-600 transition-all duration-300 hover:scale-105 active:scale-95">
                    View Roadmap
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {showGenerateHint && !aiLoading && (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-xl text-gray-600 dark:text-gray-300">
              ✨ Skill........
            </p>
            <p className="mt-2 text-blue-600 font-semibold">
              Press <kbd className="px-2 py-1 border rounded">Enter</kbd> to
              get the skill
            </p>
          </div>
        )}

        {aiLoading && (
          <div className="flex flex-col items-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Loading skill.......
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;

