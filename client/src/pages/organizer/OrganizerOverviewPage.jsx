import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, DollarSign, ClipboardCheck, ArrowRight, Plus, CheckCircle2 } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Avatar } from '../../components/ui/Avatar';
import { MiniAreaChart } from '../../components/charts/MiniAreaChart';
import { MiniBarChart } from '../../components/charts/MiniBarChart';
import { OrganizerAPI } from '../../lib/queries';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function OrganizerOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrganizerAPI.overview()
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

  const statusBreakdown = [
    { label: 'Approved', value: stats?.approved || 0 },
    { label: 'Pending review', value: stats?.pending || 0 },
    { label: 'Rejected', value: stats?.rejected || 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1.5">
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Your hosting performance</h1>
        </div>
        <Link to="/register/event">
          <Button variant="primary" className="rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Event
          </Button>
        </Link>
      </div>

      {stats?.pendingApprovals > 0 && (
        <Link
          to="/organizer/events"
          className="flex items-center justify-between bg-luma-yellow/10 border border-luma-yellow/20 rounded-2xl px-5 py-3.5 mb-6 hover:bg-luma-yellow/[0.14] transition-colors group"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-luma-yellow">
            <ClipboardCheck className="w-4 h-4" />
            {stats.pendingApprovals} RSVP{stats.pendingApprovals > 1 ? 's' : ''} waiting on your approval
          </span>
          <ArrowRight className="w-4 h-4 text-luma-yellow group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events" value={stats?.totalEvents ?? 0} icon={Calendar} accent="blue" hint={`${stats?.upcoming ?? 0} upcoming`} />
        <StatCard label="Attendees" value={stats?.totalAttendees ?? 0} icon={Users} accent="yellow" hint={`${stats?.checkedIn ?? 0} checked in`} />
        <StatCard label="Revenue" value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`} icon={DollarSign} accent="gray" />
        <StatCard label="Approved" value={stats?.approved ?? 0} icon={CheckCircle2} accent="blue" hint={`${stats?.pending ?? 0} pending`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#121315]/45 border border-white/[0.06] rounded-[24px] p-6">
          <h3 className="text-sm font-bold text-white mb-4">Revenue trend</h3>
          <MiniAreaChart data={revenueSeries} formatValue={(v) => `$${v.toFixed(0)}`} emptyLabel="No paid tickets sold yet" />
        </Card>

        <Card className="bg-[#121315]/45 border border-white/[0.06] rounded-[24px] p-6">
          <h3 className="text-sm font-bold text-white mb-4">Events by status</h3>
          <MiniBarChart data={statusBreakdown} />
        </Card>
      </div>

      <Card className="mt-6 bg-[#121315]/45 border border-white/[0.06] rounded-[24px] p-6">
        <h3 className="text-sm font-bold text-white mb-4">Recent activity</h3>
        {stats?.recentTickets?.length ? (
          <div className="space-y-3">
            {stats.recentTickets.map((t) => (
              <div key={t._id} className="flex items-center gap-3 text-xs">
                <Avatar src={t.user?.avatarUrl} fallback={t.user?.name?.[0] || 'U'} className="h-8 w-8" />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold truncate">{t.user?.name || 'Someone'} registered for {t.event?.title}</p>
                  <p className="text-luma-text-dimmed">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-luma-text-muted">No activity yet.</p>
        )}
      </Card>
    </div>
  );
}
