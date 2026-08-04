import React, { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { MiniAreaChart } from '../../components/charts/MiniAreaChart';
import { MiniBarChart } from '../../components/charts/MiniBarChart';
import { AdminAPI } from '../../lib/queries';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminAPI.stats()
      .then((res) => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-24 flex justify-center"><Spinner size="lg" variant="primary" /></div>;
  }

  const revenueSeries = (stats?.revenueByMonth || []).map((r) => ({
    label: `${MONTHS[r._id.month - 1]} ${r._id.year}`,
    value: r.revenue,
  }));

  const roleBreakdown = [
    { label: 'Attendees', value: stats?.attendees || 0 },
    { label: 'Organizers', value: stats?.organizers || 0 },
    { label: 'Admins', value: stats?.admins || 0 },
  ];

  const categoryBreakdown = (stats?.eventsByCategory || [])
    .filter((c) => c._id)
    .sort((a, b) => b.count - a.count)
    .map((c) => ({ label: c._id, value: c.count }));

  return (
    <div>
      <div className="flex items-center gap-2 text-luma-red text-xs font-semibold uppercase tracking-widest mb-1.5">
        <ShieldCheck className="w-4 h-4" />
        <span>Platform Overview</span>
      </div>
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">Nexus at a glance</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} accent="blue" />
        <StatCard label="Total Events" value={stats?.totalEvents ?? 0} icon={Calendar} accent="yellow" hint={`${stats?.upcoming ?? 0} upcoming`} />
        <StatCard label="Platform Revenue" value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`} icon={DollarSign} accent="gray" hint={`${stats?.paidTickets ?? 0} paid tickets`} />
        <StatCard label="Pending Review" value={stats?.pending ?? 0} icon={ClipboardCheck} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#121315]/45 border border-white/[0.06] rounded-[24px] p-6">
          <h3 className="text-sm font-bold text-white mb-4">Platform revenue trend</h3>
          <MiniAreaChart data={revenueSeries} formatValue={(v) => `$${v.toFixed(0)}`} emptyLabel="No paid tickets yet" />
        </Card>

        <Card className="bg-[#121315]/45 border border-white/[0.06] rounded-[24px] p-6">
          <h3 className="text-sm font-bold text-white mb-4">Users by role</h3>
          <MiniBarChart data={roleBreakdown} />
        </Card>
      </div>

      <Card className="mt-6 bg-[#121315]/45 border border-white/[0.06] rounded-[24px] p-6">
        <h3 className="text-sm font-bold text-white mb-4">Events by category</h3>
        <MiniBarChart data={categoryBreakdown} />
      </Card>
    </div>
  );
}
