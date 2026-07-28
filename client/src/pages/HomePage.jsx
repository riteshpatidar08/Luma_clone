import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Video, 
  Clock, 
  Users, 
  Lock, 
  Globe, 
  AlertTriangle,
  RefreshCw,
  Plus,
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { Toast } from '../components/ui/Toast';
import { EventCard } from '../components/EventCard';
import { Button } from '../components/ui/Button';
import {
  Dialog,
  DialogContent
} from '../components/ui/Dialog';

function HomePage() {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Toast notification state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Modal details state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const getEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const res = await axios.get(
        `${apiUrl}/events?searchQuery=${query}`
      );
      setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch events';
      setError(errMsg);
      triggerToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getEvents();
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [query, getEvents]);

  const triggerToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    // setIsModalOpen(true);
  };

  const handleRegister = async () => {
    if (!selectedEvent) return;
    setIsRegistering(true);
    // Simulate API registration delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsRegistering(false);
    setIsModalOpen(false);
    triggerToast(`Successfully registered for "${selectedEvent.title}"!`, 'success');
  };

  // Helper date functions for modal display
  const getEventDateString = (event) => {
    if (!event?.schedule?.startDate) return 'No date scheduled';
    const start = new Date(event.schedule.startDate);
    const end = (event.schedule.endDate || event.schedule.endData) 
      ? new Date(event.schedule.endDate || event.schedule.endData) 
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

  const filteredEvents = events.filter((event) => {
    if (selectedCategory === 'all') return true;
    return (
      event.calender?.toLowerCase() === selectedCategory.toLowerCase() ||
      event.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  const formattedEventDate = selectedEvent ? getEventDateString(selectedEvent) : null;

  return (
    <div className="min-h-screen bg-luma-bg text-luma-text-primary selection:bg-luma-blue/30 selection:text-luma-white font-sans pb-20 relative">
      {/* Toast Notification Feed */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      {/* Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] left-[20%] w-[400px] h-[400px] rounded-full bg-luma-blue/10 blur-[130px] animate-float-1" />
        <div className="absolute bottom-[25%] right-[15%] w-[450px] h-[450px] rounded-full bg-luma-indigo/15 blur-[140px] animate-float-2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        {/* Header and Search section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1.5">
              <Compass className="w-4.5 h-4.5 animate-spin-[25s]" />
              <span>Explore Nexus</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Discover Upcoming Events
            </h1>
            <p className="text-luma-text-muted mt-2 text-sm md:text-base max-w-xl">
              Join live talks, meetups, online workshops, and community events hosted by organizers around the world.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:max-w-md shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-luma-text-gray" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11 pr-4 w-full bg-white/[0.02] border border-white/[0.08] focus:border-luma-blue focus:ring-1 focus:ring-luma-blue h-12 text-sm rounded-[14px] placeholder:text-luma-text-gray transition-all disabled:opacity-50 text-white outline-none backdrop-blur-sm"
              placeholder="Search by title or description..."
            />
          </div>
        </div>

        {/* LOADING STATE SCREEN */}
        {isLoading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <Spinner size="xl" variant="primary" label="Loading amazing events..." />
          </div>
        ) : error ? (
          /* ERROR STATE SCREEN */
          <div className="max-w-md mx-auto text-center py-20 px-6 bg-[#1a1c1e]/60 border border-white/[0.08] rounded-3xl backdrop-blur-md shadow-2xl mt-12 animate-fade-in">
            <div className="inline-flex p-3 rounded-full bg-luma-red/10 border border-luma-red/20 text-luma-red mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Something went wrong</h3>
            <p className="text-sm text-luma-text-muted mt-2 leading-relaxed">
              We encountered an error while retrieving events from the server: {error}
            </p>
            <Button
              onClick={getEvents}
              variant="secondary"
              className="mt-6 flex items-center gap-2 mx-auto bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
          </div>
        ) : events.length === 0 ? (
          /* EMPTY STATE SCREEN */
          <div className="text-center py-24 max-w-lg mx-auto animate-fade-in">
            <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.01] border border-white/[0.08] text-luma-text-muted mb-5 shadow-lg">
              <Calendar className="h-6 w-6 text-luma-blue" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {query ? 'No matching events found' : 'No upcoming events'}
            </h3>
            <p className="text-sm text-luma-text-muted mt-2 leading-relaxed">
              {query 
                ? `We couldn't find any events matching "${query}". Try searching for something else.` 
                : 'There are currently no events listed. Why not create the first event yourself?'}
            </p>
            <div className="mt-8 flex justify-center gap-4">
              {query ? (
                <Button 
                  onClick={() => setQuery('')} 
                  variant="muted"
                  className="rounded-xl px-4"
                >
                  Clear Search
                </Button>
              ) : (
                <Link to="/register/event">
                  <Button 
                    variant="primary" 
                    className="rounded-xl px-5 shadow-[0_4px_18px_rgba(255,255,255,0.08)]"
                  >
                    <Plus className="w-4 h-4 mr-2 text-black" />
                    Create Event
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* DATA STATE SCREEN */
          <div className="animate-fade-in mt-8">
            {/* Show a subtle overlay loader when typing/searching but we already have events on screen */}
            <div className="relative">
              {isLoading && (
                <div className="absolute top-2 right-2 z-20 bg-luma-bg/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.08] flex items-center gap-2 shadow-lg">
                  <Spinner size="xs" variant="primary" />
                  <span className="text-[11px] text-luma-text-muted">Refining search...</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Column 1: Category Sidebar */}
                <div className="lg:col-span-3 space-y-2 lg:sticky lg:top-[100px] bg-[#121315]/20 border border-white/[0.04] p-3 rounded-3xl backdrop-blur-md">
                  <div className="text-[10px] font-bold text-luma-text-muted uppercase tracking-wider px-3 mb-2">
                    Categories
                  </div>
                  <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
                    {[
                      { id: 'all', label: 'All Events', count: events.length },
                      { id: 'personal', label: 'Personal', count: events.filter(e => e.calender === 'personal' || e.category === 'personal').length },
                      { id: 'developer', label: 'Developer Meetups', count: events.filter(e => e.calender === 'developer' || e.category === 'developer').length },
                      { id: 'web3', label: 'Web3 & Tech', count: events.filter(e => e.calender === 'web3' || e.category === 'web3').length },
                      { id: 'social', label: 'Social Gathering', count: events.filter(e => e.calender === 'social' || e.category === 'social').length },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-2xl transition-all cursor-pointer whitespace-nowrap lg:whitespace-normal text-left w-full gap-3 border ${
                          selectedCategory === cat.id
                            ? 'bg-white/[0.08] text-white border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                            : 'text-luma-text-muted hover:text-white hover:bg-white/[0.02] border-transparent'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-luma-blue/20 text-luma-blue border border-luma-blue/10'
                            : 'bg-white/[0.03] text-luma-text-muted border border-white/[0.04]'
                        }`}>
                          {cat.count}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Column 2: Full-width Events list */}
                <div className="lg:col-span-9 space-y-4">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-20 bg-[#121315]/30 border border-white/[0.05] rounded-3xl p-6">
                      <Calendar className="w-8 h-8 text-luma-text-muted mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-white">No events in this category</h4>
                      <p className="text-xs text-luma-text-muted mt-1">Try switching to another category or clearing search terms.</p>
                    </div>
                  ) : (
                    filteredEvents.map((event) => (
                      <EventCard 
                        key={event._id} 
                        event={event} 
                        onClick={() => handleCardClick(event)} 
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EVENT DETAILS MODAL DIALOG */}
      {selectedEvent && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl bg-[#121315]/95 border border-white/[0.1] rounded-[28px] p-0 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            {/* Top highlight gradient */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-luma-blue via-luma-indigo to-luma-yellow opacity-85 z-10" />

            {/* Modal Header Banner */}
            <div className="relative h-56 bg-gradient-to-br from-luma-blue/15 via-luma-indigo/10 to-luma-yellow/5 flex-shrink-0">
              {selectedEvent.bannerUrl ? (
                <img 
                  src={selectedEvent.bannerUrl} 
                  alt={selectedEvent.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <Calendar className="w-12 h-12 text-luma-blue/60 mb-2" />
                  <span className="text-xs text-luma-blue font-bold tracking-widest uppercase">{selectedEvent.calender} calendar</span>
                </div>
              )}

              {/* Status / Visibility Badges */}
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="flex items-center gap-1 bg-[#121315]/80 backdrop-blur-md border border-white/[0.06] rounded-full px-3 py-1 text-[11px] font-semibold text-luma-text-light-gray">
                  {selectedEvent.location === 'online' ? (
                    <Video className="w-3.5 h-3.5 text-luma-blue" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-luma-yellow" />
                  )}
                  <span className="capitalize">{selectedEvent.location}</span>
                </span>
                <span className="flex items-center gap-1 bg-[#121315]/80 backdrop-blur-md border border-white/[0.06] rounded-full px-3 py-1 text-[11px] font-semibold text-luma-text-light-gray">
                  {selectedEvent.visibility === 'Private' ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Globe className="w-3.5 h-3.5" />
                  )}
                  <span>{selectedEvent.visibility}</span>
                </span>
              </div>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 md:p-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between gap-4 mb-2.5">
                <span className="text-xs font-bold text-luma-blue uppercase tracking-widest">
                  {selectedEvent.calender} calendar
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    selectedEvent.options?.ticketPrice !== undefined && selectedEvent.options?.ticketPrice > 0
                      ? 'bg-luma-blue/10 border-luma-blue/20 text-luma-blue'
                      : 'bg-luma-green-bg/25 border-luma-green/20 text-luma-yellow'
                  }`}>
                    {selectedEvent.options?.ticketPrice !== undefined && selectedEvent.options?.ticketPrice > 0
                      ? `$${selectedEvent.options.ticketPrice}`
                      : 'Free Entry'}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {selectedEvent.title}
              </h2>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-y border-white/[0.05] py-5">
                {/* Date/Time Block */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-luma-text-dimmed block">Date & Time</span>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-luma-blue mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{formattedEventDate?.date}</p>
                      <p className="text-xs text-luma-text-muted mt-0.5">{formattedEventDate?.time}</p>
                      <p className="text-[10px] text-luma-text-dimmed mt-0.5">Timezone: {selectedEvent.schedule?.timeZone || 'UTC'}</p>
                    </div>
                  </div>
                </div>

                {/* Location Block */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-luma-text-dimmed block">Location</span>
                  <div className="flex items-start gap-2.5">
                    {selectedEvent.location === 'online' ? (
                      <>
                        <Video className="w-4 h-4 text-luma-blue mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white">Online Event</p>
                          <a 
                            href={selectedEvent.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-luma-blue hover:underline break-all mt-0.5 block"
                          >
                            {selectedEvent.meetingLink || 'Link will be visible upon registration'}
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 text-luma-yellow mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white">Physical Location</p>
                          <p className="text-xs text-luma-text-muted mt-0.5 leading-relaxed">{selectedEvent.address || 'Address details not provided'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Attributes / Options Grid */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                {selectedEvent.options?.requireApproval && (
                  <div className="flex items-center gap-1.5 text-xs bg-white/[0.02] border border-white/[0.06] text-luma-text-muted px-3 py-1.5 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-luma-yellow" />
                    <span>Host Approval Required to Join</span>
                  </div>
                )}
                {selectedEvent.options?.capacity && (
                  <div className="flex items-center gap-1.5 text-xs bg-white/[0.02] border border-white/[0.06] text-luma-text-muted px-3 py-1.5 rounded-full">
                    <Users className="w-4 h-4" />
                    <span>Capacity: {selectedEvent.options.capacity} attendees</span>
                  </div>
                )}
              </div>

              {/* About Event */}
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-luma-text-dimmed">About this event</h4>
                <p className="text-sm text-luma-text-muted leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 bg-[#1a1c1e]/40 border-t border-white/[0.06] flex items-center justify-between gap-4">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="ghost"
                className="text-xs font-semibold hover:bg-white/[0.04]"
                disabled={isRegistering}
              >
                Close Dialog
              </Button>

              <Button
                onClick={handleRegister}
                disabled={isRegistering}
                variant="primary"
                className="h-10 text-xs font-bold px-6 rounded-xl bg-white hover:bg-white/95 text-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_4px_18px_rgba(255,255,255,0.08)] flex items-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <Spinner size="xs" variant="muted" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Register for Event</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default HomePage;
