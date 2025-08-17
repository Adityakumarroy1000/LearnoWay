import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, Users, Star, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const Skills = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");

  const allSkills = [
    {
      id: 1,
      title: "Web Development",
      description: "Learn HTML, CSS, JavaScript, and modern frameworks like React",
      icon: "💻",
      category: "Programming",
      level: "Beginner",
      students: "12.5k",
      duration: "3-6 months",
      rating: 4.8,
      color: "from-blue-500 to-purple-600",
      tags: ["HTML", "CSS", "JavaScript", "React"],
      hasPaths: true,
      pathCount: 4,
      specialFeatures: ["Project-based learning", "Industry mentors", "Job placement assistance"]
    },
    {
      id: 2,
      title: "Digital Marketing",
      description: "Master SEO, social media marketing, and content strategy",
      icon: "📈",
      category: "Marketing",
      level: "Beginner",
      students: "8.2k",
      duration: "2-4 months",
      rating: 4.7,
      color: "from-green-500 to-teal-600",
      tags: ["SEO", "Social Media", "Content Marketing", "Analytics"],
      hasPaths: true,
      pathCount: 5,
      specialFeatures: ["Real campaign analysis", "Tools certification", "Client case studies"]
    },
    {
      id: 3,
      title: "Python Programming",
      description: "From basics to data science, automation, and web development",
      icon: "🐍",
      category: "Programming",
      level: "Beginner",
      students: "15.3k",
      duration: "4-8 months",
      rating: 4.9,
      color: "from-yellow-500 to-orange-600",
      tags: ["Python", "Data Science", "Automation", "Django"],
      hasPaths: true,
      pathCount: 6,
      specialFeatures: ["Interactive coding", "AI/ML projects", "Open source contributions"]
    },
    {
      id: 4,
      title: "Guitar Playing",
      description: "Learn acoustic and electric guitar from beginner to advanced",
      icon: "🎸",
      category: "Music",
      level: "Beginner",
      students: "4.2k",
      duration: "6-12 months",
      rating: 4.6,
      color: "from-amber-500 to-orange-600",
      tags: ["Acoustic", "Electric", "Chords", "Scales"],
      hasPaths: true,
      pathCount: 4,
      specialFeatures: ["Live practice sessions", "Song tutorials", "Performance recording"]
    },
    {
      id: 5,
      title: "Singing",
      description: "Develop your vocal skills, breath control, and stage presence",
      icon: "🎤",
      category: "Music",
      level: "Beginner",
      students: "3.8k",
      duration: "4-8 months",
      rating: 4.7,
      color: "from-pink-500 to-rose-600",
      tags: ["Vocals", "Breath Control", "Performance", "Harmony"],
      hasPaths: true,
      pathCount: 5,
      specialFeatures: ["Voice analysis", "Live coaching", "Recording studio access"]
    },
    {
      id: 6,
      title: "Graphic Design",
      description: "Master Photoshop, Illustrator, and design principles",
      icon: "🎨",
      category: "Design",
      level: "Beginner",
      students: "6.8k",
      duration: "2-5 months",
      rating: 4.6,
      color: "from-pink-500 to-red-600",
      tags: ["Photoshop", "Illustrator", "Design Theory", "Branding"],
      hasPaths: true,
      pathCount: 4,
      specialFeatures: ["Design challenges", "Portfolio building", "Client projects"]
    },
    {
      id: 7,
      title: "Data Analysis",
      description: "Excel, SQL, and data visualization with Python/R",
      icon: "📊",
      category: "Data",
      level: "Intermediate",
      students: "9.1k",
      duration: "3-6 months",
      rating: 4.8,
      color: "from-purple-500 to-indigo-600",
      tags: ["Excel", "SQL", "Python", "Tableau"],
      hasPaths: true,
      pathCount: 5,
      specialFeatures: ["Real datasets", "Business cases", "Certification prep"]
    },
    {
      id: 8,
      title: "Mobile App Development",
      description: "Build iOS and Android apps with React Native or Flutter",
      icon: "📱",
      category: "Programming",
      level: "Intermediate",
      students: "5.4k",
      duration: "4-7 months",
      rating: 4.7,
      color: "from-cyan-500 to-blue-600",
      tags: ["React Native", "Flutter", "iOS", "Android"],
      hasPaths: true,
      pathCount: 3,
      specialFeatures: ["App store deployment", "Cross-platform focus", "UI/UX integration"]
    },
    {
      id: 9,
      title: "Photography",
      description: "Master composition, lighting, and post-processing techniques",
      icon: "📷",
      category: "Creative",
      level: "Beginner",
      students: "7.3k",
      duration: "3-6 months",
      rating: 4.5,
      color: "from-indigo-500 to-blue-600",
      tags: ["Composition", "Lighting", "Editing", "Portfolio"],
      hasPaths: true,
      pathCount: 6,
      specialFeatures: ["Photo challenges", "Equipment guides", "Gallery showcases"]
    },
    {
      id: 10,
      title: "Cooking & Culinary Arts",
      description: "Learn fundamental cooking techniques and international cuisines",
      icon: "👨‍🍳",
      category: "Lifestyle",
      level: "Beginner",
      students: "5.9k",
      duration: "2-5 months",
      rating: 4.4,
      color: "from-orange-500 to-red-600",
      tags: ["Techniques", "Cuisines", "Nutrition", "Presentation"],
      hasPaths: true,
      pathCount: 7,
      specialFeatures: ["Recipe collection", "Video tutorials", "Nutrition guides"]
    },
    {
      id: 11,
      title: "Foreign Languages",
      description: "Learn Spanish, French, German, or Japanese with interactive lessons",
      icon: "🌍",
      category: "Language",
      level: "Beginner",
      students: "11.2k",
      duration: "6-12 months",
      rating: 4.6,
      color: "from-emerald-500 to-green-600",
      tags: ["Grammar", "Vocabulary", "Conversation", "Culture"],
      hasPaths: true,
      pathCount: 8,
      specialFeatures: ["Native speakers", "Cultural immersion", "Progress tracking"]
    },
    {
      id: 12,
      title: "Fitness & Personal Training",
      description: "Build strength, endurance, and healthy lifestyle habits",
      icon: "💪",
      category: "Health",
      level: "Beginner",
      students: "9.7k",
      duration: "3-9 months",
      rating: 4.5,
      color: "from-red-500 to-pink-600",
      tags: ["Strength", "Cardio", "Nutrition", "Recovery"],
      hasPaths: true,
      pathCount: 6,
      specialFeatures: ["Workout tracking", "Meal planning", "Progress photos"]
    }
  ];

  const categories = ["All", "Programming", "Marketing", "Design", "Data", "Music", "Creative", "Lifestyle", "Language", "Health"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const skillLevels = ["all", "beginner", "intermediate", "advanced"];

  const filteredSkills = allSkills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
    const matchesLevel = skillFilter === "all" || skill.level.toLowerCase() === skillFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
              <div className="text-2xl animate-pulse">🌱</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">SkillSprout</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hover:scale-105 transition-transform duration-200">Browse Skills</Button>
              <Link to="/dashboard">
                <Button variant="ghost" className="hover:scale-105 transition-transform duration-200">Dashboard</Button>
              </Link>
              <ThemeToggle />
              <Button className="hover:scale-105 transition-transform duration-200">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-scale-in">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover structured roadmaps with curated free resources to master any skill you want.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 focus:scale-[1.02]"
              />
            </div>
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

          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, index) => (
            <Card 
              key={skill.id} 
              className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-3 border-0 overflow-hidden dark:bg-gray-800 animate-fade-in hover:rotate-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`h-2 bg-gradient-to-r ${skill.color} group-hover:h-3 transition-all duration-300`}></div>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">{skill.icon}</div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="animate-fade-in">{skill.level}</Badge>
                    <Badge variant="outline" className="text-xs animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      {skill.pathCount} paths
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-all duration-300 dark:text-white">
                  {skill.title}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                  {skill.description}
                </CardDescription>
                <div className="flex flex-wrap gap-1 mb-3">
                  {skill.tags.slice(0, 3).map((tag, tagIndex) => (
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
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Special Features:</p>
                  <div className="space-y-1">
                    {skill.specialFeatures.slice(0, 2).map((feature, featureIndex) => (
                      <div 
                        key={featureIndex} 
                        className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 animate-fade-in"
                        style={{ animationDelay: `${featureIndex * 0.1}s` }}
                      >
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
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
                  <div className="text-gray-600 dark:text-gray-300 font-medium">{skill.category}</div>
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

        {filteredSkills.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <p className="text-xl text-gray-500 dark:text-gray-400">No skills found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;
