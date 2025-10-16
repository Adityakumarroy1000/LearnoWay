// src/pages/Index.tsx (replace your existing file)
import { Link } from "react-router-dom";
import { BACKEND_BASE } from "../api/config";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import {
  BookOpen,
  Target,
  TrendingUp,
  Users,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";
import CustomNav from "@/components/CustomNavbar";
import { useState } from "react";

function normalizeProfile(raw: any) {
  const firstName = raw.first_name ?? raw.firstName ?? "";
  const lastName = raw.last_name ?? raw.lastName ?? "";
  const bio = raw.bio ?? "";
  const occupation = raw.occupation ?? "";
  let profileImage = raw.profile_image ?? raw.profileImage ?? "";

  if (profileImage && !profileImage.startsWith("http")) {
    // profileImage could be "/media/..." or "media/..."
    if (profileImage.startsWith("/"))
      profileImage = `${BACKEND_BASE}${profileImage}`;
    else profileImage = `${BACKEND_BASE}/${profileImage}`;
  }

  if (!profileImage) profileImage = "/default-profile.png"; // your app-level fallback

  return { firstName, lastName, bio, occupation, profileImage };
}

const Index = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Featured skills data
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
      rating: 4.8,
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
      rating: 4.7,
    },
    {
      id: 3,
      title: "Guitar Playing",
      description: "Learn acoustic and electric guitar techniques",
      icon: "🎸",
      students: "4.2k",
      duration: "6-12 months",
      color: "from-amber-500 to-orange-600",
      difficulty: "Beginner",
      rating: 4.9,
    },
  ];

  // Stats data
  const stats = [
    {
      icon: Users,
      label: "Active Learners",
      value: "50,000+",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: BookOpen,
      label: "Free Resources",
      value: "10,000+",
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: Target,
      label: "Skills Available",
      value: "25+",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: "87%",
      color: "text-orange-600 dark:text-orange-400",
    },
  ];
  // ... (the rest of your Index UI: hero, stats, featuredSkills) ...
  // I'm including only the navbar part below for brevity but keep the rest of your file unchanged.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <CustomNav onLoginChange={setIsLoggedIn} />
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            Discover expertly curated learning pathways that transform beginners
            into experts using the best free resources on the internet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in mb-12">
            <Link to={isLoggedIn ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {isLoggedIn ? "Continue Learning" : "Start Learning Today"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
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

      {/* Stats */}
      <section className="py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center group cursor-pointer">
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
            {featuredSkills.map((skill) => (
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

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl mb-8 opacity-90 leading-relaxed max-w-2xl mx-auto">
            Join thousands of learners who have successfully mastered new skills
            and advanced their careers with SkillSprout.
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
            <span>© 2025 SkillSprout</span>
            <span>•</span>
            <span>Made with ❤️ for learners</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
