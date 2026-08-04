import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronLeft } from 'lucide-react';
import { EventForm } from '../components/EventForm';
import { Toast } from '../components/ui/Toast';
import { EventsAPI, UsersAPI } from '../lib/queries';
import { updateToken } from '../redux/authSlice';

function CreateEventPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await EventsAPI.create(formData);

      // Creating a first event silently upgrades attendee -> organizer on
      // the server, which reissues a JWT carrying the new role claim. Sync
      // both the token and full profile client-side so the organizer
      // dashboard (role-gated, and its API calls) work immediately instead
      // of bouncing home or 403ing on a stale token.
      if (res.data.token) {
        const me = await UsersAPI.me();
        dispatch(updateToken({ token: res.data.token, user: me.data.data }));
      }

      setToast({ open: true, message: 'Event created! Awaiting admin approval.', type: 'success' });
      setTimeout(() => navigate('/organizer/events'), 1200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-luma-bg text-luma-text-primary font-sans py-12 px-4 sm:px-6 lg:px-8 relative">
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((t) => ({ ...t, open: false }))} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[380px] h-[380px] rounded-full bg-luma-blue/10 blur-[120px] animate-float-1" />
        <div className="absolute bottom-[15%] right-[10%] w-[420px] h-[420px] rounded-full bg-luma-indigo/15 blur-[130px] animate-float-2" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-6 flex items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-semibold text-luma-text-muted hover:text-white transition-colors group cursor-pointer bg-transparent border-none outline-none p-0"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Events</span>
          </button>
        </div>

        <EventForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create Event" onCancel={() => navigate('/')} />
      </div>
    </div>
  );
}

export default CreateEventPage;
