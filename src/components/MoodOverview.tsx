import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Table, Eye, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useJournal } from "../context/JournalContext";

export const MoodOverview: React.FC = () => {
  const { entries, stats } = useJournal();
  const [showTable, setShowTable] = useState(false);

  if (entries.length === 0) {
    return null;
  }

  const chartData = [...entries]
    .slice(0, 15)
    .reverse()
    .map((entry, index) => {
      let dateLabel = `Entry ${index + 1}`;
      if (entry.createdAt && typeof entry.createdAt.toDate === "function") {
        dateLabel = entry.createdAt.toDate().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
      }
      return {
        id: entry.id,
        index: index + 1,
        date: dateLabel,
        score: entry.score || 50,
        mood: entry.mood || "Reflective",
        category: entry.category || "General",
      };
    });

  return (
    <section
      aria-labelledby="mood-overview-heading"
      className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-neutral-100">
        <div>
          <h2 id="mood-overview-heading" className="text-lg font-bold text-neutral-900">
            Reflection Mood Overview
          </h2>
          <p className="text-xs text-neutral-500">
            Self-reported emotional trends based on your recent journal entries (1 - 100 scale).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Trend pill */}
          <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-neutral-100 font-medium text-neutral-700">
            {stats.scoreTrend === "improving" && (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Trending upward</span>
              </>
            )}
            {stats.scoreTrend === "declining" && (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>Gently dipping</span>
              </>
            )}
            {stats.scoreTrend === "stable" && (
              <>
                <Minus className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
                <span>Steady</span>
              </>
            )}
            {stats.scoreTrend === "insufficient_data" && <span>Accumulating data</span>}
          </div>

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            aria-expanded={showTable}
            aria-controls="mood-table-view"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition"
          >
            {showTable ? (
              <>
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Show Chart</span>
              </>
            ) : (
              <>
                <Table className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Accessible Table</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showTable ? (
        <div id="mood-table-view" className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700">
            <caption className="sr-only">
              Historical journal entry mood scores and categories
            </caption>
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-900 font-semibold">
              <tr>
                <th scope="col" className="p-3">#</th>
                <th scope="col" className="p-3">Date</th>
                <th scope="col" className="p-3">Mood</th>
                <th scope="col" className="p-3">Score (1-100)</th>
                <th scope="col" className="p-3">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {chartData.map((row) => (
                <tr key={row.id} className="hover:bg-neutral-50/50">
                  <td className="p-3 font-medium">{row.index}</td>
                  <td className="p-3">{row.date}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-[11px]">
                      {row.mood}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-neutral-900">{row.score}</td>
                  <td className="p-3">{row.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-60 w-full" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                formatter={(val: any, _name: any, item: any) => [
                  `${val} (${item.payload.mood})`,
                  "Score",
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: "#ffffff", stroke: "#d97706" }}
                activeDot={{ r: 6, fill: "#d97706" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
