import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Check, X, Mail } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Avatar } from '../../components/ui/Avatar';
import { TicketsAPI } from '../../lib/queries';

const STATUS_BADGE = {
  valid: 'bg-luma-green-bg/25 border-luma-green/20 text-luma-yellow',
  scanned: 'bg-luma-blue/10 border-luma-blue/20 text-luma-blue',
  reserved: 'bg-white/[0.04] border-white/[0.08] text-luma-text-muted',
  pending_approval: 'bg-luma-yellow/10 border-luma-yellow/20 text-luma-yellow',
  cancelled: 'bg-luma-red/10 border-luma-red/20 text-luma-red',
  refunded: 'bg-luma-red/10 border-luma-red/20 text-luma-red',
  rejected: 'bg-luma-red/10 border-luma-red/20 text-luma-red',
};

export default function EventAttendeesPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await TicketsAPI.forEvent(eventId);
      setTickets(res.data.data);
      setEventTitle(res.data.event?.title || '');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    setActioning(id);
    try {
      await TicketsAPI.approve(id);
      load();
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id) => {
    setActioning(id);
    try {
      await TicketsAPI.reject(id);
      load();
    } finally {
      setActioning(null);
    }
  };

  const pending = tickets.filter((t) => t.status === 'pending_approval');
  const others = tickets.filter((t) => t.status !== 'pending_approval');

  return (
    <div>
      <button
        onClick={() => navigate('/organizer/events')}
        className="flex items-center gap-2 text-xs font-semibold text-luma-text-muted hover:text-white mb-6 cursor-pointer bg-transparent border-none p-0"
      >
        <ChevronLeft className="w-4 h-4" /> Back to My Events
      </button>

      <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1.5">
        <Users className="w-4 h-4" />
        <span>Attendees</span>
      </div>
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">{eventTitle || 'Event attendees'}</h1>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" variant="primary" /></div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-luma-yellow mb-3">Awaiting approval ({pending.length})</h3>
              <div className="space-y-2">
                {pending.map((t) => (
                  <Card key={t._id} className="bg-luma-yellow/[0.04] border border-luma-yellow/20 rounded-2xl p-4 flex items-center gap-3">
                    <Avatar src={t.user?.avatarUrl} fallback={t.attendeeInfo?.name?.[0] || 'U'} className="h-9 w-9" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{t.attendeeInfo?.name}</p>
                      <p className="text-[11px] text-luma-text-muted flex items-center gap-1"><Mail className="w-3 h-3" />{t.attendeeInfo?.email}</p>
                    </div>
                    <Button size="xs" variant="primary" disabled={actioning === t._id} onClick={() => handleApprove(t._id)} className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="xs" variant="ghost" disabled={actioning === t._id} onClick={() => handleReject(t._id)} className="text-luma-red flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Decline
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-bold text-white mb-3">All attendees ({others.length})</h3>
            {others.length === 0 ? (
              <p className="text-xs text-luma-text-muted">No registrations yet.</p>
            ) : (
              <div className="space-y-2">
                {others.map((t) => (
                  <Card key={t._id} className="bg-[#121315]/45 border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                    <Avatar src={t.user?.avatarUrl} fallback={t.attendeeInfo?.name?.[0] || 'U'} className="h-9 w-9" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{t.attendeeInfo?.name}</p>
                      <p className="text-[11px] text-luma-text-muted">{t.attendeeInfo?.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_BADGE[t.status]}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
