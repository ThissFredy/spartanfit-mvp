"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import Link from "next/link";

type ChartData = {
  exerciseName: string;
  absoluteMax: number;
  data: { date: string; maxWeight: number }[];
};

export function WorkoutProgressCharts({ chartsData }: { chartsData: ChartData[] }) {
  if (!chartsData || chartsData.length === 0) {
    return (
      <EmptyState
        title="Aún no tienes progreso registrado"
        description="Agrega tu primer entrenamiento para ver cómo evoluciona tu carga máxima."
        icon={<Activity className="h-6 w-6" />}
        action={
          <Link
            href="/dashboard"
            className="inline-flex rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            Registrar entrenamiento
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {chartsData.map((chart, index) => (
        <Card
          key={chart.exerciseName}
          className="overflow-hidden animate-[fade-in-up_500ms_ease-out_both] motion-reduce:animate-none"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="max-w-[70%] truncate text-base capitalize">
              {chart.exerciseName}
            </CardTitle>
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300">
              Max: {chart.absoluteMax} kg
            </span>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" debounce={120}>
                <LineChart data={chart.data} margin={{ top: 4, right: 8, bottom: 6, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#a1a1aa"
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    tickMargin={8}
                    minTickGap={20}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    tickMargin={8}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#3f3f46",
                      color: "#fff",
                      borderRadius: "0.75rem",
                      boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
                    }}
                    labelStyle={{ color: "#d4d4d8" }}
                    itemStyle={{ color: "#f87171", fontWeight: "bold" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    name="Carga máxima"
                    stroke="#c22524"
                    strokeWidth={2.5}
                    dot={{ fill: "#18181b", stroke: "#c22524", strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: "#c22524" }}
                    isAnimationActive
                    animationDuration={700}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
