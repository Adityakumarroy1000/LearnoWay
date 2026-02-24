import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import CustomNav from "@/components/CustomNavbar";
import api from "@/api/axios";

type DashboardSummary = {
  active_skills: number;
  completed_skills: number;
  weekly_sessions: number;
  estimated_hours: number;
  streak_days: number;
};

type ActiveSkill = {
  course_id: number;
  title: string;
  icon?: string | null;
  level?: string | null;
  category?: string | null;
  progress_pct: number;
  completed_stages: number;
  total_stages: number;
  last_activity?: string | null;
  next_stage_title?: string | null;
};

type WeeklyActivity = {
  date: string;
  label: string;
  sessions: number;
};

type DashboardGoal = {
  key: string;
  label: string;
  current: number;
  target: number;
};

type DashboardResponse = {
  summary: DashboardSummary;
  active_skills: ActiveSkill[];
  weekly_activity: WeeklyActivity[];
  goals?: DashboardGoal[];
};

const Dashboard = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get<DashboardResponse>(
          "/skills/courses/dashboard-summary/"
        );
        if (!mounted) return;
        setData(res.data);
      } catch (err: unknown) {
        if (!mounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load user dashboard data"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const achievements = useMemo(() => {
    if (!data) return [];
    const items: Array<{
      title: string;
      description: string;
      icon: string;
      date: string;
    }> = [];

    if (data.summary.active_skills > 0) {
      items.push({
        title: "Learning In Progress",
        description: `You are actively working on ${data.summary.active_skills} skill(s).`,
        icon: "🎯",
        date: "Now",
      });
    }
    if (data.summary.weekly_sessions >= 5) {
      items.push({
        title: "Consistent Week",
        description: `${data.summary.weekly_sessions} stage completions this week.`,
        icon: "🔥",
        date: "This week",
      });
    }
    if (data.summary.streak_days >= 3) {
      items.push({
        title: "Streak Builder",
        description: `${data.summary.streak_days}-day activity streak.`,
        icon: "🚀",
        date: "Today",
      });
    }
    if (data.summary.completed_skills > 0) {
      items.push({
        title: "Skill Finisher",
        description: `${data.summary.completed_skills} fully completed skill(s).`,
        icon: "🏆",
        date: "Milestone",
      });
    }

    if (!items.length) {
      return [
        {
          title: "No Achievements Yet",
          description: "Pass stages to unlock achievements.",
          icon: "📘",
          date: "Start now",
        },
      ];
    }
    return items.slice(0, 4);
  }, [data]);

  const goals = useMemo(() => {
    if (!data) return [];
    if (data.goals?.length) return data.goals;
    return [
      {
        key: "weekly_stages",
        label: "Complete 8 stages",
        current: data.summary.weekly_sessions,
        target: 8,
      },
      {
        key: "active_skills",
        label: "Keep 3 active skills",
        current: data.summary.active_skills,
        target: 3,
      },
      {
        key: "streak_days",
        label: "Maintain 7-day streak",
        current: data.summary.streak_days,
        target: 7,
      },
    ];
  }, [data]);

  const weeklyMaxSessions = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, ...data.weekly_activity.map((d) => Number(d.sessions) || 0));
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <CustomNav />
        <div className="max-w-7xl mx-auto px-4 py-10 text-gray-600 dark:text-gray-300">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <CustomNav />
        <div className="max-w-7xl mx-auto px-4 py-10 text-red-600">
          {error || "Unable to load dashboard"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <CustomNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Dashboard is now fully user-based and updates from your real progress.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            value={data.summary.active_skills}
            label="Active Skills"
            color="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            icon={<Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />}
            value={data.summary.completed_skills}
            label="Completed"
            color="bg-green-100 dark:bg-green-900/30"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
            value={`${data.summary.estimated_hours}h`}
            label="This Week"
            color="bg-purple-100 dark:bg-purple-900/30"
          />
          <StatCard
            icon={<Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
            value={data.summary.streak_days}
            label="Day Streak"
            color="bg-orange-100 dark:bg-orange-900/30"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Active Skills
                </h2>
                <Link to="/skills">
                  <Button variant="outline">Browse More Skills</Button>
                </Link>
              </div>

              <div className="space-y-4">
                {data.active_skills.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-gray-600 dark:text-gray-300">
                      No progress yet for this account. Start a skill and pass stage exams.
                    </CardContent>
                  </Card>
                ) : (
                  data.active_skills.map((skill) => (
                    <Card key={skill.course_id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{skill.icon || "📚"}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {skill.title}
                              </h3>
                              <Badge variant="secondary">{skill.progress_pct}% complete</Badge>
                            </div>
                            <div className="mb-3">
                              <Progress value={skill.progress_pct} className="h-2" />
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>
                                {skill.completed_stages} / {skill.total_stages} stages completed
                              </span>
                              <span>Last activity {formatRelative(skill.last_activity || undefined)}</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Next:{" "}
                                <span className="font-medium">
                                  {skill.next_stage_title || "Skill complete"}
                                </span>
                              </span>
                              <Link to={`/skill/${skill.course_id}`}>
                                <Button size="sm">Continue</Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>This Week's Activity</CardTitle>
                <CardDescription>Completed stages per day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-32 gap-2">
                  {data.weekly_activity.map((day) => {
                    const sessions = Number(day.sessions) || 0;
                    const barHeightPercent = (sessions / weeklyMaxSessions) * 100;
                    return (
                      <div key={day.date} className="flex flex-col items-center flex-1 h-full">
                        <div className="w-full flex-1 flex items-end mb-2">
                          <div
                            className="bg-gradient-to-t from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-t w-full transition-all hover:opacity-80"
                            style={{
                              height: sessions > 0 ? `${barHeightPercent}%` : "4px",
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {day.label}
                        </span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {sessions}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {achievement.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500 dark:text-green-400" />
                  This Week's Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <GoalRow
                      key={goal.key}
                      label={goal.label}
                      current={goal.current}
                      target={goal.target}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

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
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Refresh Dashboard
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Progress Report (Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <Card className="text-center">
      <CardContent className="p-6">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${color}`}>
          {icon}
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
        <div className="text-gray-600 dark:text-gray-400">{label}</div>
      </CardContent>
    </Card>
  );
}

function GoalRow({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const percent = Math.min(100, target > 0 ? (current / target) * 100 : 0);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-700 dark:text-gray-300">
          {Math.min(current, target)}/{target}
        </span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}

function formatRelative(iso?: string): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60 * 1000) return "just now";
  const minutes = Math.floor(ms / (60 * 1000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default Dashboard;
