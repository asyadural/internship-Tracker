import { PieChart, Pie, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { IInternshipApplication } from '@/app/dashboard/page';

interface AnalyticsComponentProps {
  apps: IInternshipApplication[];
}

export default function AnalyticsComponent({ apps }: AnalyticsComponentProps) {
  const statusData = Object.entries(
    apps.reduce((acc, app) => {
      acc[app.applicationStatus] = (acc[app.applicationStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count }));

  const dayData = Object.entries(
    apps.reduce((acc, app) => {
      const date = new Date(app.applicationDate).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([date, count]) => ({ date, count }));

  const monthData = Object.entries(
    apps.reduce((acc, app) => {
      const date = new Date(app.applicationDate);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([month, count]) => ({ month, count }));

  const locationData = Object.entries(
    apps.reduce((acc, app) => {
      acc[app.location] = (acc[app.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([location, count]) => ({ location, count }));

  const roleData = Object.entries(
    apps.reduce((acc, app) => {
      const role = app.positionTitle || 'Unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([role, count]) => ({ role, count }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h3 className="font-bold mb-4">Applications by Status</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={70}
              fill="#8884d8"
              label
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4">
        <h3 className="font-bold mb-4">Applications by Day</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dayData}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4">
        <h3 className="font-bold mb-4">Applications by Month</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthData}>
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <Bar dataKey="count" fill="#34d399" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4">
        <h3 className="font-bold mb-4">Applications by Location</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart layout="vertical" data={locationData}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="location" width={120} />
            <Tooltip />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <Bar dataKey="count" fill="#facc15" radius={[0, 5, 5, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h3 className="font-bold mb-4">Most Applied-To Roles</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart layout="vertical" data={roleData}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="role" width={150} />
            <Tooltip />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <Bar dataKey="count" fill="#818cf8" radius={[0, 5, 5, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
