import React, { useEffect, useState, useCallback } from 'react';
import { ClipboardCheck, Check, X, MapPin, Video, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { AdminAPI, EventsAPI } from '../../lib/queries';

const STATUS_BADGE = {
  approved: 'bg-luma-green-bg/25 border-luma-green/20 text-luma-yellow',
  pending: 'bg-luma-yellow/10 border-luma-yellow/20 text-luma-yellow',
  rejected: 'bg-luma-red/10 border-luma-red/20 text-luma-red',
};

export default function AdminModerationPage() {
  const [tab, setTab] = useState('pending');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  const load = useCallback(async (status) => {
    setLoading(true);
    try {
      const res = await AdminAPI.events({ status });
      setEvents(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab === 'all' ? undefined : tab);
  }, [tab, load]);

  const handleAction = async (id, status) => {
    setActioning(id);
    try {
      await EventsAPI.setStatus(id, status);
      load(tab === 'all' ? undefined : tab);
    } finally {
      setActioning(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-luma-red text-xs font-semibold uppercase tracking-widest mb-1.5">
        <ClipboardCheck className="w-4 h-4" />
        <span>Moderation</span>
      </div>
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">Review submitted events</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-3">
          {loading ? (
            <div className="py-16 flex justify-center"><Spinner size="lg" variant="primary" /></div>
          ) : events.length === 0 ? (
            <p className="text-xs text-luma-text-muted py-10 text-center">Nothing here.</p>
          ) : (
            events.map((event) => (
              <Card key={event._id} className="bg-[#121315]/45 border border-white/[0.06] rounded-[20px] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/[0.03] shrink-0 flex items-center justify-center">
                  {event.bannerUrl ? <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" /> : <Calendar className="w-5 h-5 text-luma-text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">{event.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_BADGE[event.status]}`}>{event.status}</span>
                  </div>
                  <p className="text-[11px] text-luma-text-muted mt-1 flex items-center gap-3">
                    <span>By {event.organizer?.name || 'Unknown'}</span>
                    <span className="flex items-center gap-1">
                      {event.location?.type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {event.location?.type === 'online' ? 'Online' : event.location?.address || 'Physical'}
                    </span>
                  </p>
                </div>
                {event.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="xs" variant="primary" disabled={actioning === event._id} onClick={() => handleAction(event._id, 'approved')} className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="xs" variant="ghost" disabled={actioning === event._id} onClick={() => handleAction(event._id, 'rejected')} className="text-luma-red flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
