"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import LoadingSpinner from "@/components/ui/loadingspinner";
import {
  DailyReportItem,
  MonthlyReportItem,
  ReportData,
  YearlyReportItem,
} from "@/types/report";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const { token, isLoading, redirectToLogin } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<"daily" | "monthly" | "yearly">(
    "monthly"
  );

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      redirectToLogin("/admin/reports");
      return;
    }

    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/events/reports`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch report data");
        }

        const data: ReportData = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [token, isLoading, redirectToLogin]);

  if (isLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-20">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            No Data Available
          </h2>
          <p className="text-red-600">
            We couldn't find any report data. Please create events and sell
            tickets to generate reports.
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data based on selected time frame
  const timeData = reportData[timeFrame];
  const labels = (() => {
    switch (timeFrame) {
      case "daily":
        return (reportData.daily as DailyReportItem[]).map((d) => d.date);
      case "monthly":
        return (reportData.monthly as MonthlyReportItem[]).map((m) => m.month);
      case "yearly":
        return (reportData.yearly as YearlyReportItem[]).map((y) => y.year);
      default:
        return [];
    }
  })();

  const chartData = {
    labels,
    datasets: [
      {
        label: "Attendees",
        data: timeData.map((item) => item.count),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  // Event distribution chart data
  const eventDistributionData = {
    labels: reportData.eventDistribution.map((item) => item.eventName),
    datasets: [
      {
        data: reportData.eventDistribution.map((item) => item.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Top events chart data
  const topEventsData = {
    labels: reportData.topEvents.map((item) => item.eventName),
    datasets: [
      {
        label: "Attendees",
        data: reportData.topEvents.map((item) => item.attendees),
        backgroundColor: "rgba(79, 70, 229, 0.7)",
        borderColor: "rgb(79, 70, 229)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Event Reports & Analytics</h1>

      {/* Time Frame Selector */}
      <div className="mb-8 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold">Time Frame:</h2>
          {(["daily", "monthly", "yearly"] as const).map((frame) => (
            <button
              key={frame}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeFrame === frame
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setTimeFrame(frame)}
            >
              {frame.charAt(0).toUpperCase() + frame.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendees Over Time Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">
            Attendees Over Time ({timeFrame})
          </h2>
          <div className="h-80">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: "Attendee Trend" },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    title: { display: true, text: "Number of Attendees" },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Event Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Event Distribution</h2>
          <div className="h-80">
            <Pie
              data={eventDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                    labels: { boxWidth: 15, padding: 15 },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Events Chart */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">Top Performing Events</h2>
        <div className="h-96">
          <Bar
            data={topEventsData}
            options={{
              indexAxis: "y" as const,
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: { precision: 0 },
                  title: { display: true, text: "Number of Attendees" },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Events"
          value={reportData.eventDistribution.length}
          description="All events you've organized"
        />
        <SummaryCard
          title="Total Attendees"
          value={reportData.yearly.reduce((sum, item) => sum + item.count, 0)}
          description="All-time attendees across events"
        />
        <SummaryCard
          title="Top Event"
          value={
            reportData.topEvents.length > 0
              ? reportData.topEvents[0].eventName
              : "N/A"
          }
          description={
            reportData.topEvents.length > 0
              ? `${reportData.topEvents[0].attendees} attendees`
              : ""
          }
          isText
        />
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  title,
  value,
  description,
  isText = false,
}: {
  title: string;
  value: string | number;
  description: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <div className="mt-2">
        {isText ? (
          <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
        ) : (
          <p className="text-3xl font-bold text-blue-600">{value}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
