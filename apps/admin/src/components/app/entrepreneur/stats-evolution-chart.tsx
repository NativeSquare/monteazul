"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { StatsPeriod } from "./granularity";
import { formatBucketLabel } from "./granularity";

type SeriesPoint = {
  bucket: string;
  visits: number;
  whatsappContacts: number;
  instagramClicks: number;
};

const chartConfig = {
  visits: {
    label: "Visitas",
    color: "var(--primary)",
  },
  whatsappContacts: {
    label: "Contactos por WhatsApp",
    // WhatsApp brand green (design.md).
    color: "#25a35a",
  },
  instagramClicks: {
    label: "Clics a Instagram",
    // Instagram brand magenta.
    color: "#e1306c",
  },
} satisfies ChartConfig;

/**
 * Evolution chart of the Estadísticas page: Visitas + Contactos por WhatsApp
 * (+ Clics a Instagram when the fiche has a link — `showInstagram`) over the
 * day/week/month buckets returned by the aggregation. The recharts patterns
 * mirror the template dashboard's interactive area chart.
 */
export function StatsEvolutionChart({
  series,
  period,
  showInstagram = true,
}: {
  series: SeriesPoint[];
  period: StatsPeriod;
  showInstagram?: boolean;
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
      <AreaChart data={series} margin={{ left: 4, right: 12 }}>
        <defs>
          <linearGradient id="fillVisitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillWhatsapp" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-whatsappContacts)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-whatsappContacts)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillInstagram" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-instagramClicks)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-instagramClicks)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="bucket"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value) => formatBucketLabel(String(value), period)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={28}
          allowDecimals={false}
          // Counts can never be negative — pin the axis at 0.
          domain={[0, "auto"]}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                formatBucketLabel(String(value), period)
              }
              indicator="dot"
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="visits"
          name="visits"
          type="monotone"
          fill="url(#fillVisitas)"
          stroke="var(--color-visits)"
        />
        <Area
          dataKey="whatsappContacts"
          name="whatsappContacts"
          type="monotone"
          fill="url(#fillWhatsapp)"
          stroke="var(--color-whatsappContacts)"
        />
        {showInstagram ? (
          <Area
            dataKey="instagramClicks"
            name="instagramClicks"
            type="monotone"
            fill="url(#fillInstagram)"
            stroke="var(--color-instagramClicks)"
          />
        ) : null}
      </AreaChart>
    </ChartContainer>
  );
}
