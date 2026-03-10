"use client";

import { useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from "@/components/ui/chart";
import { ArrowLeft, PieChart as PieChartIcon, Info } from "lucide-react";
import Link from "next/link";

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
    return config;
  }, [labels]);

  const chartData = useMemo(() => {
    if (!tasks.length) return [];
    
    const counts: Record<string, number> = {};
    tasks.forEach((task) => {
      const labelName = task.label || "other";
      counts[labelName] = (counts[labelName] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value], index) => {
      const labelObj = labels.find(l => l.name === name);
      return {
        name: chartConfig[name]?.label || name,
        label: name,
        value,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
  }, [tasks, labels, chartConfig]);

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
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
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

      <main className="w-full max-w-4xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Total Tasks</CardDescription>
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Completed</CardDescription>
              <CardTitle className="text-2xl md:text-3xl font-bold text-accent">
                {stats.completed}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Completion Rate</CardDescription>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                {stats.rate}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-xl shadow-primary/5 border-white/40 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Tasks by Label</CardTitle>
            <CardDescription>Distribution across your custom categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] md:h-[450px] flex items-center justify-center p-2 md:p-6">
            {tasks.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      innerRadius="50%"
                      paddingAngle={5}
                      strokeWidth={0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center py-12">
                <div className="bg-muted p-4 rounded-full">
                  <Info className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">No Tasks Found</h4>
                  <p className="text-muted-foreground text-sm max-w-[250px]">
                    Add some tasks on the home page to see your productivity breakdown.
                  </p>
                </div>
                <Link href="/">
                  <Button variant="outline" className="rounded-xl">Go to Dashboard</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}