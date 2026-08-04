import React, { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { EventCard } from '../../components/EventCard';
import { UsersAPI } from '../../lib/queries';

export default function SavedEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    UsersAPI.savedEvents()
      .then((res) => setEvents(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1.5">
        <Bookmark className="w-4 h-4" />
        <span>Saved Events</span>
      </div>
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">Your bookmarks</h1>

      {loading ? (
        <div className="py-24 flex justify-center"><Spinner size="lg" variant="primary" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-[#121315]/30 border border-white/[0.05] rounded-3xl">
          <Bookmark className="w-8 h-8 text-luma-text-muted mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">No saved events</h4>
          <p className="text-xs text-luma-text-muted mt-1">Tap the bookmark icon on any event to save it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
