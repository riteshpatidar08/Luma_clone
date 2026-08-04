import React, { useEffect, useState, useCallback } from 'react';
import { Ticket, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Spinner } from '../../components/ui/Spinner';
import { TicketCard } from '../../components/TicketCard';
import { TicketsAPI } from '../../lib/queries';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await TicketsAPI.mine();
      setTickets(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const upcoming = tickets.filter((t) => t.event?.schedule?.startDate && new Date(t.event.schedule.startDate) >= now && !['cancelled', 'refunded', 'rejected'].includes(t.status));
  const past = tickets.filter((t) => !upcoming.includes(t));

  return (
    <div>
      <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1.5">
        <Ticket className="w-4 h-4" />
        <span>My Tickets</span>
      </div>
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">Your registrations</h1>

      {loading ? (
        <div className="py-24 flex justify-center"><Spinner size="lg" variant="primary" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-[#121315]/30 border border-white/[0.05] rounded-3xl">
          <Calendar className="w-8 h-8 text-luma-text-muted mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">No tickets yet</h4>
          <p className="text-xs text-luma-text-muted mt-1">Register for an event and it'll show up here.</p>
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past & Other ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-xs text-luma-text-muted py-6">No upcoming events.</p>
            ) : (
              upcoming.map((t) => <TicketCard key={t._id} ticket={t} onChanged={load} />)
            )}
          </TabsContent>
          <TabsContent value="past" className="space-y-3">
            {past.length === 0 ? (
              <p className="text-xs text-luma-text-muted py-6">Nothing here.</p>
            ) : (
              past.map((t) => <TicketCard key={t._id} ticket={t} onChanged={load} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
