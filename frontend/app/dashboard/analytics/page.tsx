// Add this as a new page component (e.g., app/dashboard/analytics/page.tsx)
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { IInternshipApplication } from '../page'; // reuse your type definition if possible

const COLORS = ['#6366f1', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const fetcher = (url: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }).then(res => res.json());

  const { data: apps } = useSWR<IInternshipApplication[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/applications`, fetcher);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !apps) return null;

  const statusCounts = apps.reduce<Record<string, number>>((acc, app) => {
    acc[app.applicationStatus] = (acc[app.applicationStatus] || 0) + 1;
    return acc;
  }, {});

  const byDate = apps.reduce<Record<string, number>>((acc, app) => {
    const date = new Date(app.applicationDate).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const dateData = Object.entries(byDate).map(([date, count]) => ({ date, count }));

  const byLocation = apps.reduce<Record<string, number>>((acc, app) => {
    acc[app.location] = (acc[app.location] || 0) + 1;
    return acc;
  }, {});
  const locationData = Object.entries(byLocation).map(([location, count]) => ({ location, count }));

  const monthly = apps.reduce<Record<string, number>>((acc, app) => {
    const month = new Date(app.applicationDate).toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const monthData = Object.entries(monthly).map(([month, count]) => ({ month, count }));

  return (
    <div className="p-10 space-y-12">
      <button
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center px-4 py-2 bg-white text-purple-700 font-semibold border-3 border-purple-400 rounded-xl shadow-sm hover:bg-purple-50 hover:border-purple-300 transition-colors"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-slate-800 text-center -mt-8">📊 Application Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 1. Applications by Status */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Applications by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(statusCounts).map(([status, value], index) => ({ name: status, value }))}
                cx="50%"
                cy="50%"
                label
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.keys(statusCounts).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Applications by Day */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Applications by Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Applications by Month */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Applications by Month</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#34d399" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Applications by Location */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Applications by Location</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="location" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#fbbf24" barSize={20} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
