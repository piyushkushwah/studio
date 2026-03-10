
"use client";

import { useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from "@/components/ui/chart";
import { ArrowLeft, PieChart as PieChartIcon, Info, TrendingUp } from "lucide-react";
import Link from "next/link";
import { subDays, format, eachDayOfInterval } from "date-fns";

export default function AnalyticsPage() {
  const { tasks, labels, isInitialized } = useTasks();

  const chartConfig = useMemo(() => {
    const config: any = {};
    labels.forEach((label, index) => {
      config[label.name] = {
        label: label.name.charAt(0).toUpperCase() + label.name.slice(1),
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
    // Add default entry for the trend chart
    config["completed"] = { label: "Completed", color: "hsl(var(--accent))" };
    return config;
  }, [labels]);

  const labelData = useMemo(() => {
    if (!tasks.length) return [];
    
    const counts: Record<string, number> = {};
    tasks.forEach((task) => {
      const labelName = task.label || "other";
      counts[labelName] = (counts[labelName] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value], index) => {
      return {
        name: chartConfig[name]?.label || name,
        label: name,
        value,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
  }, [tasks, chartConfig]);

  const weeklyTrendData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
      return {
        date: format(date, "EEE"),
        completed: dayTasks.filter((t) => t.completed).length,
        total: dayTasks.length,
      };
    });
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  }, [tasks]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading your stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="bg-primary text-white p-2 rounded-lg shrink-0">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-primary truncate">Task Analytics</h1>
        </div>
      </header>

      <main className="w-full max-w-5xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Total Lifetime</CardDescription>
              <CardTitle className="text-2xl font-bold text-primary">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Completed</CardDescription>
              <CardTitle className="text-2xl font-bold text-accent">
                {stats.completed}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Efficiency</CardDescription>
              <CardTitle className="text-2xl font-bold">
                {stats.rate}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Label Distribution */}
          <Card className="shadow-xl shadow-primary/5 border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Category Distribution</CardTitle>
              <CardDescription>Breakdown of all tasks by label</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {tasks.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={labelData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        innerRadius="50%"
                        paddingAngle={5}
                        strokeWidth={0}
                      >
                        {labelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <ChartLegend content={<ChartLegendContent />} className="flex-wrap" />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card className="shadow-xl shadow-primary/5 border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">7-Day Progress</CardTitle>
              <CardDescription>Completed tasks this week</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {tasks.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyTrendData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                      />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="completed" 
                        fill="hsl(var(--accent))" 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 text-center py-12">
      <div className="bg-muted p-4 rounded-full">
        <Info className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <div>
        <h4 className="font-bold text-lg">No Data Available</h4>
        <p className="text-muted-foreground text-sm max-w-[200px]">
          Start adding tasks to visualize your productivity.
        </p>
      </div>
    </div>
  );
}
