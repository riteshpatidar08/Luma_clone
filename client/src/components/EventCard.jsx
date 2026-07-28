import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Video, 
  Clock, 
  Users, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';

export function EventCard({ event, onClick }) {
  const {
    
    title,
    description,
    visibility,
    bannerUrl,
    calender,
    schedule,
    location,
    address,
    meetingLink,
    options
  } = event;

  console.log(event)
  // Safely parse start and end dates
  const startDate = schedule?.startDate ? new Date(schedule.startDate) : null;
  const endDate = (schedule?.endDate || schedule?.endData) ? new Date(schedule.endDate || schedule.endData) : null;

  // Extract date components for the calendar badge
  const month = startDate 
    ? startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() 
    : '';
  const day = startDate ? startDate.getDate() : '';
  const weekday = startDate 
    ? startDate.toLocaleString('en-US', { weekday: 'short' }) 
    : '';

  // Format time range
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const timeRange = startDate
    ? `${weekday}, ${startDate.toLocaleString('en-US', { month: 'short' })} ${day} • ${formatTime(startDate)}${
        endDate ? ` - ${formatTime(endDate)}` : ''
      }`
    : 'No Date Scheduled';

  // Format currency/price
  const priceDisplay = options?.ticketPrice !== undefined && options?.ticketPrice > 0
    ? `$${options.ticketPrice}`
    : 'Free';

  return (
    <Link to={`/eventDetails/${event._id}`}>
    <Card 
      className="group flex flex-col md:flex-row bg-[#121315]/45 border border-white/[0.06] rounded-[24px] overflow-hidden hover:border-white/[0.12] hover:bg-[#121315]/65 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 transition-all duration-300 relative cursor-pointer w-full"
      // onClick={onClick}
    >
      {/* Banner / Image Area */}
      <div className="relative h-44 md:h-auto md:w-64 overflow-hidden bg-gradient-to-br from-luma-blue/10 via-luma-indigo/5 to-luma-yellow/5 shrink-0">
        {bannerUrl ? (
          <img 
            src={bannerUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center relative p-4 text-center min-h-[160px] md:min-h-0">
            {/* Ambient pattern for event placeholder */}
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <Calendar className="w-10 h-10 text-luma-blue/60 mb-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xs text-luma-text-muted font-medium uppercase tracking-widest">{calender || 'Event'}</span>
          </div>
        )}

        {/* Date Badge Overlay */}
        {startDate && (
          <div className="absolute top-4 left-4 bg-luma-bg/90 backdrop-blur-md border border-white/[0.08] rounded-2xl p-2 flex flex-col items-center justify-center min-w-[54px] min-h-[58px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <span className="text-[10px] font-bold tracking-wider text-luma-blue leading-none mb-0.5">{month}</span>
            <span className="text-xl font-extrabold text-white leading-none">{day}</span>
          </div>
        )}

        {/* Visibility / Location Badges Overlay */}
        <div className="absolute top-4 right-4 flex gap-1.5 md:hidden">
          <span className="flex items-center gap-1 bg-[#121315]/80 backdrop-blur-md border border-white/[0.06] rounded-full px-2.5 py-1 text-[10px] font-semibold text-luma-text-light-gray shadow-md">
            {location === 'online' ? (
              <>
                <Video className="w-3 h-3 text-luma-blue" />
                <span>Online</span>
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3 text-luma-yellow" />
                <span>Physical</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Calendar title & visibility & Location Badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-luma-blue uppercase tracking-widest truncate max-w-[150px]">
                {calender} calendar
              </span>
              <span className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.05] rounded-full px-2 py-0.5 text-[9px] font-semibold text-luma-text-muted">
                {location === 'online' ? (
                  <>
                    <Video className="w-2.5 h-2.5 text-luma-blue" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-2.5 h-2.5 text-luma-yellow" />
                    <span>Physical</span>
                  </>
                )}
              </span>
            </div>
            
            <span className="flex items-center gap-1 text-[10px] text-luma-text-muted bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.04]">
              {visibility === 'Private' ? (
                <>
                  <Lock className="w-2.5 h-2.5" />
                  <span>Private</span>
                </>
              ) : (
                <>
                  <Globe className="w-2.5 h-2.5" />
                  <span>Public</span>
                </>
              )}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-luma-blue transition-colors line-clamp-1">
            {title}
          </h3>

          {/* Event Description */}
          <p className="text-sm text-luma-text-muted mt-2 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Schedule / Time Row */}
          <div className="mt-4 space-y-2 border-t border-white/[0.04] pt-4">
            <div className="flex items-center gap-2 text-xs text-luma-text-muted">
              <Clock className="w-3.5 h-3.5 text-luma-blue shrink-0" />
              <span className="truncate">{timeRange}</span>
            </div>

            {/* Location Address / Link Row */}
            <div className="flex items-center gap-2 text-xs text-luma-text-muted">
              {location === 'online' ? (
                <>
                  <Video className="w-3.5 h-3.5 text-luma-blue shrink-0" />
                  <span className="truncate text-luma-blue/80 hover:underline">
                    {meetingLink || 'Link provided upon registration'}
                  </span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-luma-yellow shrink-0" />
                  <span className="truncate">{address || 'Location to be announced'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Badges and Join Button */}
        <div className="mt-5 border-t border-white/[0.04] pt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5 items-center">
            {/* Ticket Price */}
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              priceDisplay === 'Free'
                ? 'bg-luma-green-bg/25 border-luma-green/20 text-luma-yellow'
                : 'bg-luma-blue/10 border-luma-blue/20 text-luma-blue'
            }`}>
              {priceDisplay}
            </span>

            {/* Require Approval */}
            {options?.requireApproval && (
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/[0.02] border border-white/[0.06] text-luma-text-muted px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-luma-yellow" />
                <span>Approval Required</span>
              </span>
            )}

            {/* Capacity */}
            {options?.capacity && (
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/[0.02] border border-white/[0.06] text-luma-text-muted px-2 py-0.5 rounded-full">
                <Users className="w-3 h-3" />
                <span>Cap: {options.capacity}</span>
              </span>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="xs"
            className="group/btn text-luma-blue hover:text-luma-yellow flex items-center gap-1 pr-0 pl-2 bg-transparent hover:bg-transparent font-semibold text-xs"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Card>
    </Link>
  );
}
