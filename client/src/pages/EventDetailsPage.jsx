import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Calendar, 
  MapPin, 
  Video, 
  Clock, 
  Users, 
  Lock, 
  Globe, 
  ShieldCheck, 
  ChevronLeft, 
  Sparkles, 
  Copy, 
  Check, 
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  User,
  Phone,
  Mail,
  Share2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/Dialog';
import { Toast } from '../components/ui/Toast';
import { Spinner } from '../components/ui/Spinner';

function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  // States
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Modal and Form States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password : "" ,
  });

  // Toast States
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const triggerToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  // Pre-fill email from auth if logged in
  useEffect(() => {
    if (auth?.isAuthenticated && auth?.email) {
      setRegisterFormData((prev) => ({
        ...prev,
        email: auth.email,
      }));
    }
  }, [auth]);

  // Fetch Event Details
  const fetchEventDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const res = await axios.get(`${apiUrl}/events/${id}`);
      if (res.data && res.data.success) {
        setEvent(res.data.data);
      } else {
        setError('Could not retrieve event details.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch event details';
      setError(errMsg);
      triggerToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  // Event countdown timer
  useEffect(() => {
    if (!event?.schedule?.startDate) return;
    const start = new Date(event.schedule.startDate);
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = start - now;
      if (diff <= 0) {
        console.log()
        setCountdown('Live Now');
        return;  
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      
      let str = '';
      if (days > 0) str += `${days}d `;
      if (hours > 0 || days > 0) str += `${hours}h `;
      str += `${minutes}m`;
      setCountdown(`Starts in ${str}`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [event]);

  // Handle register form change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit registration form
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Simple Validation
    if (!registerFormData.name.trim()) {
      triggerToast('Name is required', 'warning');
      return;
    }
    if (!registerFormData.email.trim()) {
      triggerToast('Email is required', 'warning');
      return;
    }
    if (!registerFormData.phone.trim()) {
      triggerToast('Phone number is required', 'warning');
      return;
    }

    setIsRegistering(true);

    try {
      // Simulate registration delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      triggerToast(
        event.options?.requireApproval 
          ? `Invite request submitted successfully for "${event.title}"!`
          : `Successfully registered for "${event.title}"!`, 
        'success'
      );
      
      setIsRegisterModalOpen(false);
      // Reset name and phone (keep email as it matches auth status)
      setRegisterFormData(prev => ({
        ...prev,
        name: '',
        phone: ''
      }));
    } catch (err) {
      console.error(err);
      triggerToast('Failed to register. Please try again.', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  // Copy address to clipboard
  const handleCopyAddress = () => {
    if (event?.address) {
      navigator.clipboard.writeText(event.address);
      setCopied(true);
      triggerToast('Address copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Date styling helper
  const getFormattedDates = (eventObj) => {
    if (!eventObj?.schedule?.startDate) return null;
    const start = new Date(eventObj.schedule.startDate);
    const end = (eventObj.schedule.endDate || eventObj.schedule.endData) 
      ? new Date(eventObj.schedule.endDate || eventObj.schedule.endData) 
      : null;

    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    };

    const datePart = start.toLocaleDateString('en-US', options);
    const timePart = start.toLocaleTimeString('en-US', timeOptions);
    const endPart = end ? ` - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : '';

    return {
      date: datePart,
      time: `${timePart}${endPart}`
    };
  };

  const getBadgeDate = (eventObj) => {
    if (!eventObj?.schedule?.startDate) return null;
    const start = new Date(eventObj.schedule.startDate);
    return {
      month: start.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: start.getDate(),
      weekday: start.toLocaleString('en-US', { weekday: 'short' })
    };
  };

  // Share event link
  const handleShareEvent = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast('Event link copied to clipboard!', 'success');
  };

  const formattedDate = getFormattedDates(event);
  const badgeDate = getBadgeDate(event);

  return (
    <div className="min-h-screen bg-luma-bg text-luma-text-primary selection:bg-luma-blue/30 selection:text-luma-white font-sans py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Toast Feed */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      {/* Ambient background animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-luma-blue/5 blur-[130px] animate-float-1" />
        <div className="absolute bottom-[20%] right-[5%] w-[500px] h-[500px] rounded-full bg-luma-indigo/10 blur-[150px] animate-float-2" />
        <div className="absolute top-[45%] right-[25%] w-[350px] h-[350px] rounded-full bg-luma-yellow/5 blur-[110px] animate-float-3" />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Back Link and Action header */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-xs font-semibold text-luma-text-muted hover:text-white transition-colors group cursor-pointer bg-transparent border-none outline-none p-0"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Events</span>
          </button>
          
          {event && (
            <button
              onClick={handleShareEvent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-luma-text-muted hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          )}
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
            <Spinner size="lg" variant="primary" label="Loading event information..." />
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="max-w-md mx-auto text-center py-20 px-6 bg-[#1a1c1e]/60 border border-white/[0.08] rounded-3xl backdrop-blur-md shadow-2xl mt-8 animate-fade-in">
            <div className="inline-flex p-3 rounded-full bg-luma-red/10 border border-luma-red/20 text-luma-red mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Failed to load event</h3>
            <p className="text-sm text-luma-text-muted mt-2 leading-relaxed">
              {error}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={fetchEventDetails}
                variant="secondary"
                className="flex items-center gap-2 bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="text-luma-text-muted hover:text-white"
              >
                Go back home
              </Button>
            </div>
          </div>
        ) : event ? (
          /* DATA STATE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Left Column - Cover and details */}
            <div className="lg:col-span-8 space-y-6">
              {/* Event Cover Banner */}
              <div className="relative rounded-[24px] overflow-hidden border border-white/[0.08] bg-gradient-to-br from-luma-blue/10 via-luma-indigo/5 to-luma-yellow/5 h-[240px] sm:h-[360px] md:h-[400px] shadow-2xl shrink-0 group">
                {event.bannerUrl ? (
                  <img 
                    src={event.bannerUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative p-6 text-center">
                    <div className="absolute inset-0 bg-grid-white/[0.02]" />
                    <Calendar className="w-16 h-16 text-luma-blue/60 mb-3" />
                    <span className="text-sm text-luma-text-muted font-bold uppercase tracking-widest">
                      {event.calender || 'Event'} Calendar
                    </span>
                  </div>
                )}

                {/* Banner Date Overlay */}
                {badgeDate && (
                  <div className="absolute bottom-6 left-6 bg-luma-bg/95 backdrop-blur-md border border-white/[0.1] rounded-2xl p-3 flex flex-col items-center justify-center min-w-[62px] min-h-[66px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] font-bold tracking-wider text-luma-blue leading-none mb-0.5">{badgeDate.month}</span>
                    <span className="text-2xl font-extrabold text-white leading-none">{badgeDate.day}</span>
                  </div>
                )}

                {/* Countdown Time Overlay badge */}
                {countdown && (
                  <div className="absolute top-6 right-6 bg-[#121315]/80 backdrop-blur-md border border-white/[0.06] rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-luma-yellow shadow-md flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-luma-yellow animate-pulse" />
                    <span>{countdown}</span>
                  </div>
                )}
              </div>

              {/* Event Metadata (Calendar, visibility, location format) */}
              <div className="flex flex-wrap gap-2.5">
                <span className="flex items-center gap-1 bg-luma-blue/10 border border-luma-blue/20 rounded-full px-3 py-1 text-[11px] font-semibold text-luma-blue uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{event.calender} Calendar</span>
                </span>
                <span className="flex items-center gap-1.5 bg-[#121315]/60 border border-white/[0.06] rounded-full px-3 py-1 text-xs font-medium text-luma-text-light-gray">
                  {event.location === 'online' ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-luma-blue" />
                      <span>Online Event</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-luma-yellow" />
                      <span>In-Person</span>
                    </>
                  )}
                </span>
                <span className="flex items-center gap-1.5 bg-[#121315]/60 border border-white/[0.06] rounded-full px-3 py-1 text-xs font-medium text-luma-text-light-gray">
                  {event.visibility === 'Private' ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Private (Invite only)</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      <span>Public Event</span>
                    </>
                  )}
                </span>
              </div>

              {/* Event Title */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {event.title}
                </h1>
              </div>

              {/* Organizer Profile Card */}
              <div className="flex items-center gap-3.5 border-y border-white/[0.05] py-5">
                <div className="h-11 w-11 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-luma-blue font-bold text-lg shadow-inner">
                  {event.organizer?.profile?.name ? event.organizer.profile.name[0].toUpperCase() : 'O'}
                </div>
                <div>
                  <p className="text-[10px] text-luma-text-dimmed uppercase tracking-widest font-semibold">Hosted By</p>
                  <p className="text-sm font-bold text-white mt-0.5">{event.organizer?.profile?.name || 'Luma Host'}</p>
                </div>
              </div>

              {/* Description About block */}
              <div className="space-y-3.5">
                <h2 className="text-lg font-bold text-white tracking-tight">About this Event</h2>
                <p className="text-sm sm:text-base text-luma-text-muted leading-relaxed whitespace-pre-line bg-[#121315]/20 border border-white/[0.04] rounded-2xl p-5 sm:p-6">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Right Column - Sticky registration card */}
            <div className="lg:col-span-4 lg:sticky lg:top-[100px] space-y-6">
              <Card className="bg-[#121315]/65 border border-white/[0.08] rounded-[28px] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-[24px] relative overflow-hidden transition-all duration-300 hover:border-white/[0.12]">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-luma-blue via-luma-indigo to-luma-yellow opacity-80" />
                
                <div className="space-y-5">
                  {/* Date & Time info */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-luma-text-dimmed block">Date & Time</span>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-luma-blue mt-0.5 shrink-0 animate-pulse" />
                      <div>
                        <p className="text-sm font-bold text-white leading-snug">{formattedDate?.date}</p>
                        <p className="text-xs text-luma-text-muted mt-1 font-medium">{formattedDate?.time}</p>
                        <p className="text-[10px] text-luma-text-dimmed mt-0.5">Timezone: {event.schedule?.timeZone || 'UTC'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location info */}
                  <div className="border-t border-white/[0.05] pt-4.5 space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-luma-text-dimmed block">Location</span>
                    <div className="flex items-start gap-3">
                      {event.location === 'online' ? (
                        <>
                          <Video className="w-5 h-5 text-luma-blue mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">Online Event</p>
                            <p className="text-xs text-luma-text-muted mt-1 leading-relaxed">
                              Virtual conference details and links are sent upon registration approval.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-5 h-5 text-luma-yellow mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">Venue Location</p>
                            <p className="text-xs text-luma-text-muted mt-1 leading-relaxed break-words">{event.address || 'Address details not provided'}</p>
                            {event.address && (
                              <button 
                                onClick={handleCopyAddress} 
                                className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-luma-blue hover:text-luma-yellow transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                              >
                                {copied ? <Check className="w-3.5 h-3.5 text-luma-yellow" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copied ? 'Copied to Clipboard' : 'Copy Venue Address'}</span>
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Capacity limits */}
                  <div className="border-t border-white/[0.05] pt-4.5 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-luma-text-dimmed block mb-1.5">Admission</span>
                      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${
                        event.options?.ticketPrice !== undefined && event.options?.ticketPrice > 0
                          ? 'bg-luma-blue/15 border-luma-blue/30 text-luma-blue'
                          : 'bg-luma-green-bg/25 border-luma-green/20 text-luma-yellow'
                      }`}>
                        {event.options?.ticketPrice !== undefined && event.options?.ticketPrice > 0
                          ? `$${event.options.ticketPrice}`
                          : 'Free Entry'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-luma-text-dimmed block mb-1.5">Capacity</span>
                      {event.options?.capacity ? (
                        <div className="flex items-center gap-1.5 text-xs text-luma-text-muted font-bold py-1">
                          <Users className="w-4 h-4" />
                          <span>{event.options.capacity} spots</span>
                        </div>
                      ) : (
                        <div className="text-xs text-luma-text-muted font-bold py-1">
                          Unlimited
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approval block details */}
                  {event.options?.requireApproval && (
                    <div className="flex items-start gap-2 bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-xl">
                      <ShieldCheck className="w-4.5 h-4.5 text-luma-yellow mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-white block">Approval Needed</span>
                        <span className="text-[10px] text-luma-text-muted mt-0.5 block leading-normal">
                          The host reviews all RSVPs. You'll receive confirmation after approval.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Register action button */}
                  <div className="border-t border-white/[0.05] pt-5">
                    <Button
                      onClick={() => setIsRegisterModalOpen(true)}
                      variant="primary"
                      className="w-full h-11 text-xs font-bold rounded-xl bg-white hover:bg-white/95 text-black hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_4px_18px_rgba(255,255,255,0.08)] flex items-center justify-center gap-2"
                    >
                      <span>{event.options?.requireApproval ? 'Request invite' : 'Register for Event'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* NOT FOUND STATE */
          <div className="text-center py-24 max-w-lg mx-auto">
            <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.01] border border-white/[0.08] text-luma-text-muted mb-5 shadow-lg">
              <Calendar className="h-6 w-6 text-luma-blue" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Event not found</h3>
            <p className="text-sm text-luma-text-muted mt-2">
              We couldn't locate this event in our system. It may have been deleted or the link is invalid.
            </p>
            <div className="mt-8">
              <Button onClick={() => navigate('/')} variant="primary" className="rounded-xl px-5">
                Go back home
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* POPUP REGISTRATION DIALOG FORM */}
      {event && (
        <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
          <DialogContent className="max-w-md bg-[#121315]/95 border border-white/[0.1] rounded-[28px] p-0 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            {/* Top gold line highlight */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-luma-blue via-luma-indigo to-luma-yellow opacity-85 z-10" />

            {/* Glassmorphic Loading Overlay */}
            {isRegistering && (
              <div className="absolute inset-0 bg-[#121315]/80 backdrop-blur-[6px] z-50 flex items-center justify-center rounded-[28px] animate-fade-in">
                <Spinner size="lg" variant="primary" label={event.options?.requireApproval ? "Submitting request..." : "Registering your spot..."} />
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              {/* Form Content */}
              <div className="p-6 sm:p-8 space-y-5">
                <DialogHeader className="border-none pb-1">
                  <div className="flex items-center gap-1.5 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>RSVP CONFIRMATION</span>
                  </div>
                  <DialogTitle className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {event.options?.requireApproval ? 'Request Invite' : 'Register for Event'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-luma-text-muted mt-1 leading-relaxed">
                    Enter your contact details below. You will receive an RSVP confirmation email for <strong className="text-white font-semibold">"{event.title}"</strong>.
                  </DialogDescription>
                </DialogHeader>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-name" className="text-xs font-semibold text-luma-text-muted tracking-wide flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-luma-blue" />
                      <span>Full Name</span>
                    </label>
                    <Input
                      id="reg-name"
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={registerFormData.name}
                      onChange={handleInputChange}
                      className="w-full bg-luma-black/45 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5 placeholder:text-luma-text-gray"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-email" className="text-xs font-semibold text-luma-text-muted tracking-wide flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-luma-blue" />
                      <span>Email Address</span>
                    </label>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={registerFormData.email}
                      onChange={handleInputChange}
                      className="w-full bg-luma-black/45 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5 placeholder:text-luma-text-gray"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-phone" className="text-xs font-semibold text-luma-text-muted tracking-wide flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-luma-blue" />
                      <span>Phone Number</span>
                    </label>
                    <Input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="e.g. +1 (555) 019-2834"
                      value={registerFormData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-luma-black/45 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5 placeholder:text-luma-text-gray"
                    />
                  </div>
                </div>
              </div>


              {/* Form Footer */}
              <div className="px-6 py-4 bg-[#1a1c1e]/40 border-t border-white/[0.06] flex items-center justify-end gap-3 rounded-b-[28px]">
                <Button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  variant="ghost"
                  className="h-10 text-xs font-semibold rounded-lg hover:bg-white/[0.04] text-luma-text-muted hover:text-white"
                  disabled={isRegistering}
                >
                  Cancel
                </Button>


                <Button
                  type="submit"
                  disabled={isRegistering}
                  variant="primary"
                  className="h-10 text-xs font-bold px-6 rounded-xl bg-white hover:bg-white/95 text-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_4px_18px_rgba(255,255,255,0.08)] flex items-center gap-2"
                >
                  <span>{event.options?.requireApproval ? 'Request Invite' : 'Confirm Registration'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default EventDetailsPage;
