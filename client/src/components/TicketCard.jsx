import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Video, QrCode, XCircle, CreditCard, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { TicketsAPI } from '../lib/queries';

const STATUS_STYLES = {
  valid: 'bg-luma-green-bg/25 border-luma-green/20 text-luma-yellow',
  scanned: 'bg-luma-blue/10 border-luma-blue/20 text-luma-blue',
  reserved: 'bg-white/[0.04] border-white/[0.08] text-luma-text-muted',
  pending_approval: 'bg-luma-yellow/10 border-luma-yellow/20 text-luma-yellow',
  cancelled: 'bg-luma-red/10 border-luma-red/20 text-luma-red',
  refunded: 'bg-luma-red/10 border-luma-red/20 text-luma-red',
  rejected: 'bg-luma-red/10 border-luma-red/20 text-luma-red',
};

const STATUS_LABEL = {
  valid: 'Confirmed',
  scanned: 'Checked in',
  reserved: 'Awaiting payment',
  pending_approval: 'Awaiting host approval',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  rejected: 'Declined',
};

export function TicketCard({ ticket, onChanged }) {
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const event = ticket.event || {};

  const handleViewQr = async () => {
    setLoading(true);
    try {
      const res = await TicketsAPI.getQrBlob(ticket._id);
      setQrUrl(URL.createObjectURL(res.data));
      setQrOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await TicketsAPI.pay(ticket._id);
      window.location.href = res.data.checkoutUrl;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this ticket?')) return;
    setLoading(true);
    try {
      await TicketsAPI.cancel(ticket._id);
      onChanged?.();
    } finally {
      setLoading(false);
    }
  };

  const canViewQr = ['valid', 'scanned'].includes(ticket.status);
  const canPay = ticket.status === 'reserved' && !ticket.payment?.stripeSessionId;
  const canCancel = ['valid', 'reserved', 'pending_approval'].includes(ticket.status);
  const startDate = event.schedule?.startDate ? new Date(event.schedule.startDate) : null;

  return (
    <>
      <Card className="bg-[#121315]/45 border border-white/[0.06] rounded-[22px] p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-luma-blue/15 to-luma-yellow/5 border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
          {event.bannerUrl ? (
            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <Calendar className="w-6 h-6 text-luma-blue/60" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/eventdetails/${event._id}`} className="text-sm font-bold text-white hover:text-luma-blue transition-colors truncate">
              {event.title || 'Event unavailable'}
            </Link>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[ticket.status] || STATUS_STYLES.reserved}`}>
              {STATUS_LABEL[ticket.status] || ticket.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-luma-text-muted flex-wrap">
            {startDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1">
              {event.location?.type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
              {event.location?.type === 'online' ? 'Online' : event.location?.address || 'Physical'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canViewQr && (
            <Button variant="secondary" size="xs" onClick={handleViewQr} disabled={loading} className="flex items-center gap-1.5">
              {loading ? <Spinner size="xs" /> : <QrCode className="w-3.5 h-3.5" />}
              QR
            </Button>
          )}
          {canPay && (
            <Button variant="primary" size="xs" onClick={handlePay} disabled={loading} className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Pay
            </Button>
          )}
          {canCancel && (
            <Button variant="ghost" size="xs" onClick={handleCancel} disabled={loading} className="text-luma-red hover:text-luma-red-hover flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> Cancel
            </Button>
          )}
        </div>
      </Card>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center">
            {qrUrl && <img src={qrUrl} alt="Ticket QR" className="w-56 h-56 rounded-2xl border border-white/[0.08]" />}
            <p className="text-xs text-luma-text-muted mt-4">Show this code at check-in.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
