import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { EventForm } from '../../components/EventForm';
import { Toast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';
import { EventsAPI } from '../../lib/queries';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    EventsAPI.getById(id)
      .then((res) => setEvent(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await EventsAPI.update(id, formData);
      setToast({ open: true, message: 'Event updated -- back under review.', type: 'success' });
      setTimeout(() => navigate('/organizer/events'), 1200);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-24 flex justify-center"><Spinner size="lg" variant="primary" /></div>;
  }

  if (!event) {
    return <p className="text-sm text-luma-text-muted">Event not found.</p>;
  }

  return (
    <div>
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((t) => ({ ...t, open: false }))} />
      <button
        type="button"
        onClick={() => navigate('/organizer/events')}
        className="flex items-center gap-2 text-xs font-semibold text-luma-text-muted hover:text-white transition-colors mb-6 cursor-pointer bg-transparent border-none p-0"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to My Events</span>
      </button>
      <EventForm
        initialData={event}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save Changes"
        onCancel={() => navigate('/organizer/events')}
      />
    </div>
  );
}
