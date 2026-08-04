import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Pencil, Trash2, Users, ScanLine, Plus, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { OrganizerAPI, EventsAPI } from '../../lib/queries';

const STATUS_BADGE = {
  approved: 'bg-luma-green-bg/25 border-luma-green/20 text-luma-yellow',
  pending: 'bg-white/[0.04] border-white/[0.08] text-luma-text-muted',
  rejected: 'bg-luma-red/10 border-luma-red/20 text-luma-red',
};

export default function OrganizerEventsPage() {
  const [tab, setTab] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (status) => {
    setLoading(true);
    try {
      const res = await OrganizerAPI.myEvents({ status });
      setEvents(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab === 'all' ? undefined : tab);
  }, [tab, load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    await EventsAPI.remove(id);
    load(tab === 'all' ? undefined : tab);
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1.5">
            <CalendarDays className="w-4 h-4" />
            <span>My Events</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Manage your events</h1>
        </div>
        <Link to="/register/event">
          <Button variant="primary" className="rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Event
          </Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-3">
          {loading ? (
            <div className="py-16 flex justify-center"><Spinner size="lg" variant="primary" /></div>
          ) : events.length === 0 ? (
            <p className="text-xs text-luma-text-muted py-10 text-center">No events in this view.</p>
          ) : (
            events.map((event) => (
              <Card key={event._id} className="bg-[#121315]/45 border border-white/[0.06] rounded-[20px] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/[0.03] shrink-0">
                  {event.bannerUrl && <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">{event.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_BADGE[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-luma-text-muted mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(event.schedule.startDate).toLocaleDateString()} · {event.ticketsSold} sold
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <Link to={`/organizer/events/${event._id}/attendees`}>
                    <Button variant="ghost" size="xs" className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Attendees</Button>
                  </Link>
                  <Link to={`/organizer/events/${event._id}/checkin`}>
                    <Button variant="ghost" size="xs" className="flex items-center gap-1"><ScanLine className="w-3.5 h-3.5" />Check-in</Button>
                  </Link>
                  <Link to={`/organizer/events/${event._id}/edit`}>
                    <Button variant="secondary" size="xs" className="flex items-center gap-1"><Pencil className="w-3.5 h-3.5" />Edit</Button>
                  </Link>
                  <Button variant="ghost" size="xs" onClick={() => handleDelete(event._id)} className="text-luma-red hover:text-luma-red-hover flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
