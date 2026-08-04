import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Plus,
  Compass,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { Toast } from '../components/ui/Toast';
import { EventCard } from '../components/EventCard';
import { Button } from '../components/ui/Button';
import { EventsAPI } from '../lib/queries';

const CATEGORIES = [
  { id: 'all', label: 'All Events' },
  { id: 'personal', label: 'Personal' },
  { id: 'developer', label: 'Developer Meetups' },
  { id: 'web3', label: 'Web3 & Tech' },
  { id: 'social', label: 'Social Gathering' },
  { id: 'business', label: 'Business' },
  { id: 'health', label: 'Health & Wellness' },
];

function HomePage() {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const triggerToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const getEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await EventsAPI.list({ searchQuery: query, limit: 30 });
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
    return () => clearTimeout(timer);
  }, [query, getEvents]);

  const filteredEvents = events.filter((event) => {
    if (selectedCategory === 'all') return true;
    const eventCategory = (event.category || event.calender || '').toLowerCase();
    return eventCategory === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-luma-bg text-luma-text-primary selection:bg-luma-blue/30 selection:text-luma-white font-sans pb-20 relative">
      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />

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
            <Link to="/discover" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-luma-yellow hover:text-luma-blue transition-colors">
              <MapPin className="w-3.5 h-3.5" />
              Browse events near you instead
            </Link>
          </div>

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

        {isLoading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <Spinner size="xl" variant="primary" label="Loading amazing events..." />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-20 px-6 bg-[#1a1c1e]/60 border border-white/[0.08] rounded-3xl backdrop-blur-md shadow-2xl mt-12 animate-fade-in">
            <div className="inline-flex p-3 rounded-full bg-luma-red/10 border border-luma-red/20 text-luma-red mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Something went wrong</h3>
            <p className="text-sm text-luma-text-muted mt-2 leading-relaxed">
              We encountered an error while retrieving events from the server: {error}
            </p>
            <Button onClick={getEvents} variant="secondary" className="mt-6 flex items-center gap-2 mx-auto bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08]">
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
          </div>
        ) : events.length === 0 ? (
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
                <Button onClick={() => setQuery('')} variant="muted" className="rounded-xl px-4">
                  Clear Search
                </Button>
              ) : (
                <Link to="/register/event">
                  <Button variant="primary" className="rounded-xl px-5 shadow-[0_4px_18px_rgba(255,255,255,0.08)]">
                    <Plus className="w-4 h-4 mr-2 text-black" />
                    Create Event
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in mt-8">
            <div className="relative">
              {isLoading && (
                <div className="absolute top-2 right-2 z-20 bg-luma-bg/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.08] flex items-center gap-2 shadow-lg">
                  <Spinner size="xs" variant="primary" />
                  <span className="text-[11px] text-luma-text-muted">Refining search...</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-3 space-y-2 lg:sticky lg:top-[100px] bg-[#121315]/20 border border-white/[0.04] p-3 rounded-3xl backdrop-blur-md">
                  <div className="text-[10px] font-bold text-luma-text-muted uppercase tracking-wider px-3 mb-2">
                    Categories
                  </div>
                  <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
                    {CATEGORIES.map((cat) => {
                      const count = cat.id === 'all'
                        ? events.length
                        : events.filter((e) => (e.category || e.calender || '').toLowerCase() === cat.id).length;
                      return (
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
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="lg:col-span-9 space-y-4">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-20 bg-[#121315]/30 border border-white/[0.05] rounded-3xl p-6">
                      <Calendar className="w-8 h-8 text-luma-text-muted mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-white">No events in this category</h4>
                      <p className="text-xs text-luma-text-muted mt-1">Try switching to another category or clearing search terms.</p>
                    </div>
                  ) : (
                    filteredEvents.map((event) => <EventCard key={event._id} event={event} />)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
