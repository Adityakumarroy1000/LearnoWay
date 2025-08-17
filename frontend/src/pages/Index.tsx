
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Target, TrendingUp, Users, User, ArrowRight, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import axios from "axios";

const Index = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/hello/")
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error(err));
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const profile = localStorage.getItem("userProfile");
    setIsLoggedIn(loggedIn);
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("profileCompleted");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserProfile(null);
  };

  const featuredSkills = [
    {
      id: 1,
      title: "Web Development",
      description: "Learn HTML, CSS, JavaScript, and modern frameworks",
      icon: "💻",
      students: "12.5k",
      duration: "3-6 months",
      color: "from-blue-500 to-purple-600",
      difficulty: "Beginner",
      rating: 4.8
    },
    {
      id: 2,
      title: "Digital Marketing",
      description: "Master SEO, social media, and content marketing",
      icon: "📈",
      students: "8.2k",
      duration: "2-4 months",
      color: "from-green-500 to-teal-600",
      difficulty: "Intermediate",
      rating: 4.7
    },
    {
      id: 4,
      title: "Guitar Playing",
      description: "Learn acoustic and electric guitar techniques",
      icon: "🎸",
      students: "4.2k",
      duration: "6-12 months",
      color: "from-amber-500 to-orange-600",
      difficulty: "Beginner",
      rating: 4.9
    }
  ];

  const stats = [
    { icon: Users, label: "Active Learners", value: "50,000+", color: "text-blue-600 dark:text-blue-400" },
    { icon: BookOpen, label: "Free Resources", value: "10,000+", color: "text-green-600 dark:text-green-400" },
    { icon: Target, label: "Skills Available", value: "25+", color: "text-purple-600 dark:text-purple-400" },
    { icon: TrendingUp, label: "Success Rate", value: "87%", color: "text-orange-600 dark:text-orange-400" }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Navigation */}
        <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3 group">
                <div className="text-2xl transition-transform group-hover:scale-110">
                  🌱
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {message}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/skills">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Browse Skills
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Dashboard
                  </Button>
                </Link>
                <ThemeToggle />

                {isLoggedIn && userProfile ? (
                  <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 rounded-full px-3 py-2 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                    <Avatar className="w-8 h-8 ring-2 ring-blue-500/20">
                      <AvatarImage src={userProfile.profileImage} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        {userProfile.firstName ? (
                          userProfile.firstName[0]
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {userProfile.firstName} {userProfile.lastName}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="ml-2"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link to="/login">
                      <Button
                        variant="outline"
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 dark:from-blue-400/5 dark:to-purple-400/5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span>100% Free Learning Platform</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in leading-tight">
              Master Any Skill with
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block mt-2">
                Premium Resources, Zero Cost
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in leading-relaxed">
              Discover expertly curated learning pathways that transform
              beginners into experts using the best free resources on the
              internet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in mb-12">
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    Continue Learning
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    Start Learning Today
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
              <Link to="/skills">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 hover:border-blue-300 transition-all duration-300"
                >
                  Explore All Skills
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>4.8/5 rating</span>
              </div>
              <div>•</div>
              <div>50,000+ students</div>
              <div>•</div>
              <div>No credit card required</div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl border border-gray-200/50 dark:border-gray-600/50`}
                  >
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:scale-105 transition-transform">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Skills */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-900 dark:to-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Target className="w-4 h-4" />
                <span>Most Popular</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Start Your Learning Journey
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Choose from our most popular skills, each with a structured
                roadmap and hand-picked resources.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredSkills.map((skill, index) => (
                <Card
                  key={skill.id}
                  className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 overflow-hidden dark:bg-gray-800/50 backdrop-blur-sm bg-white/80"
                >
                  <div className={`h-1 bg-gradient-to-r ${skill.color}`}></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {skill.icon}
                      </div>
                      <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                          {skill.rating}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white">
                      {skill.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {skill.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{skill.students}</span>
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                          {skill.difficulty}
                        </span>
                      </div>
                      <span>{skill.duration}</span>
                    </div>
                    <Link to={isLoggedIn ? "/dashboard" : "/login"}>
                      <Button className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg">
                        Start Learning
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed max-w-2xl mx-auto">
              Join thousands of learners who have successfully mastered new
              skills and advanced their careers with SkillSprout.
            </p>
            <Link to={isLoggedIn ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-10 py-4 bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
              >
                {isLoggedIn ? "Continue Learning" : "Get Started Now"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="text-3xl">🌱</div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  SkillSprout
                </h3>
              </div>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed max-w-2xl mx-auto">
                Empowering learners worldwide with free, high-quality education
                resources that make skill development accessible to everyone.
              </p>
              <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm">
                <span>© 2024 SkillSprout</span>
                <span>•</span>
                <span>Made with ❤️ for learners</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
