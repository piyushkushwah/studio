"use client";

import { useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from "@/components/ui/chart";
import { ArrowLeft, Calendar as CalendarIcon, PieChart as PieChartIcon } from "lucide-react";
import Link from "next/link";

const CHART_CONFIG = {
  work: { label: "Work", color: "hsl(var(--chart-1))" },
  personal: { label: "Personal", color: "hsl(var(--chart-2))" },
  shopping: { label: "Shopping", color: "hsl(var(--chart-3))" },
  urgent: { label: "Urgent", color: "hsl(var(--chart-4))" },
  other: { label: "Other", color: "hsl(var(--chart-5))" },
};

export default function AnalyticsPage() {
  const { tasks, isInitialized } = useTasks();

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((task) => {
      const label = task.label || "other";
      counts[label] = (counts[label] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: CHART_CONFIG[name as keyof typeof CHART_CONFIG]?.label || name,
      value,
      fill: CHART_CONFIG[name as keyof typeof CHART_CONFIG]?.color || "hsl(var(--muted))",
    }));
  }, [tasks]);

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="bg-primary text-white p-2 rounded-lg">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-primary">Task Analytics</h1>
        </div>
      </header>

      <main className="w-full max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Tasks</CardDescription>
              <CardTitle className="text-2xl">{tasks.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-2xl text-accent">
                {tasks.filter(t => t.completed).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Completion Rate</CardDescription>
              <CardTitle className="text-2xl">
                {tasks.length > 0 
                  ? `${Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%` 
                  : '0%'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle>Tasks by Label</CardTitle>
            <CardDescription>Distribution of your tasks across categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {tasks.length > 0 ? (
              <ChartContainer config={CHART_CONFIG} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={60}
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
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                No tasks available for analysis
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
