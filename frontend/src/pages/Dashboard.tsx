
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, Clock, Target, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const Dashboard = () => {
  const userStats = {
    totalSkills: 3,
    completedSkills: 1,
    totalHours: 45,
    streak: 7
  };

  const activeSkills = [
    {
      id: 1,
      title: "Web Development",
      icon: "💻",
      progress: 65,
      completedResources: 13,
      totalResources: 20,
      lastAccessed: "2 hours ago",
      nextResource: "JavaScript Projects",
      color: "from-blue-500 to-purple-600"
    },
    {
      id: 2,
      title: "Digital Marketing",
      icon: "📈",
      progress: 30,
      completedResources: 6,
      totalResources: 20,
      lastAccessed: "1 day ago",
      nextResource: "SEO Fundamentals",
      color: "from-green-500 to-teal-600"
    },
    {
      id: 3,
      title: "Python Programming",
      icon: "🐍",
      progress: 15,
      completedResources: 3,
      totalResources: 20,
      lastAccessed: "3 days ago",
      nextResource: "Variables and Data Types",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const recentAchievements = [
    {
      title: "First Steps",
      description: "Completed your first resource",
      icon: "🎯",
      date: "2 days ago"
    },
    {
      title: "Week Warrior",
      description: "Maintained a 7-day learning streak",
      icon: "🔥",
      date: "Today"
    },
    {
      title: "Project Builder",
      description: "Completed your first project",
      icon: "🚀",
      date: "1 week ago"
    }
  ];

  const weeklyActivity = [
    { day: "Mon", hours: 2 },
    { day: "Tue", hours: 1.5 },
    { day: "Wed", hours: 3 },
    { day: "Thu", hours: 2.5 },
    { day: "Fri", hours: 1 },
    { day: "Sat", hours: 4 },
    { day: "Sun", hours: 2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl">🌱</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">SkillSprout</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/skills">
                <Button variant="ghost">Browse Skills</Button>
              </Link>
              <Button variant="ghost">Dashboard</Button>
              <ThemeToggle />
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back! 👋</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Continue your learning journey and reach your goals.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{userStats.totalSkills}</div>
              <div className="text-gray-600 dark:text-gray-400">Active Skills</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mb-3">
                <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{userStats.completedSkills}</div>
              <div className="text-gray-600 dark:text-gray-400">Completed</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{userStats.totalHours}h</div>
              <div className="text-gray-600 dark:text-gray-400">Total Hours</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg mb-3">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{userStats.streak}</div>
              <div className="text-gray-600 dark:text-gray-400">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Skills */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Active Skills</h2>
                <Link to="/skills">
                  <Button variant="outline">Browse More Skills</Button>
                </Link>
              </div>

              <div className="space-y-4">
                {activeSkills.map((skill) => (
                  <Card key={skill.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{skill.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{skill.title}</h3>
                            <Badge variant="secondary">{skill.progress}% complete</Badge>
                          </div>
                          <div className="mb-3">
                            <Progress value={skill.progress} className="h-2" />
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{skill.completedResources} / {skill.totalResources} resources completed</span>
                            <span>Last accessed {skill.lastAccessed}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Next: <span className="font-medium">{skill.nextResource}</span>
                            </span>
                            <Link to={`/skill/${skill.id}`}>
                              <Button size="sm">Continue</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>This Week's Activity</CardTitle>
                <CardDescription>Hours spent learning each day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-32 gap-2">
                  {weeklyActivity.map((day) => (
                    <div key={day.day} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-gradient-to-t from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-t w-full mb-2 transition-all hover:opacity-80"
                        style={{ height: `${(day.hours / 4) * 100}%`, minHeight: '4px' }}
                      ></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{day.day}</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{day.hours}h</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{achievement.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500 dark:text-green-400" />
                  This Week's Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">Complete 5 resources</span>
                      <span className="text-gray-700 dark:text-gray-300">3/5</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">Study 10 hours</span>
                      <span className="text-gray-700 dark:text-gray-300">7/10</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">Maintain streak</span>
                      <span className="text-gray-700 dark:text-gray-300">7/7 days</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/skills">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore New Skills
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Set Learning Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Progress Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
