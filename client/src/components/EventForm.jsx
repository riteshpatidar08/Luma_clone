import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Video,
  Clock,
  Users,
  Lock,
  Globe,
  Sparkles,
  Upload,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Switch } from './ui/Switch';
import { Spinner } from './ui/Spinner';
import { LocationAutocomplete } from './LocationAutocomplete';

const toLocalInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function EventForm({ initialData, onSubmit, submitting, submitLabel = 'Create Event', onCancel }) {
  const [formDataState, setFormDataState] = useState(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    visibility: initialData?.visibility || 'Public',
    calender: initialData?.calender || initialData?.category || 'personal',
    startDate: toLocalInput(initialData?.schedule?.startDate),
    endDate: toLocalInput(initialData?.schedule?.endDate),
    location: initialData?.location?.type || 'online',
    address: initialData?.location?.address || '',
    placeId: initialData?.location?.placeId || '',
    city: initialData?.location?.city || '',
    country: initialData?.location?.country || '',
    lat: initialData?.location?.coordinates?.coordinates?.[1],
    lng: initialData?.location?.coordinates?.coordinates?.[0],
    meetingLink: initialData?.location?.meetingLink || '',
    ticketType: initialData?.options?.ticketPrice > 0 ? 'paid' : 'free',
    ticketPrice: initialData?.options?.ticketPrice || '',
    capacityType: initialData?.options?.capacity ? 'limited' : 'unlimited',
    capacity: initialData?.options?.capacity || '',
    requireApproval: initialData?.options?.requireApproval || false,
  }));

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(initialData?.bannerUrl || null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceSelect = ({ formattedAddress, placeId, lat, lng, city, country }) => {
    setFormDataState((prev) => ({ ...prev, address: formattedAddress, placeId, lat, lng, city, country }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formDataState.title.trim()) return setError('Event name is required.');
    if (!formDataState.description.trim()) return setError('Description is required.');
    if (!formDataState.startDate) return setError('Start date is required.');
    if (formDataState.location === 'online' && !formDataState.meetingLink.trim())
      return setError('Meeting link is required for online events.');
    if (formDataState.location === 'physical' && !formDataState.address.trim())
      return setError('Physical address is required for in-person events.');
    if (formDataState.ticketType === 'paid' && (!formDataState.ticketPrice || Number(formDataState.ticketPrice) <= 0))
      return setError('Ticket price must be greater than 0.');
    if (formDataState.capacityType === 'limited' && (!formDataState.capacity || Number(formDataState.capacity) <= 0))
      return setError('Capacity limit must be at least 1.');
    if (!bannerFile && !bannerPreview) return setError('Please upload an event banner cover image.');

    const formData = new FormData();
    formData.append('title', formDataState.title);
    formData.append('description', formDataState.description);
    formData.append('visibility', formDataState.visibility);
    formData.append('calender', formDataState.calender);
    formData.append('category', formDataState.calender);
    formData.append('startDate', formDataState.startDate);
    if (formDataState.endDate) formData.append('endDate', formDataState.endDate);
    formData.append('location', formDataState.location);
    if (formDataState.location === 'online') {
      formData.append('meetingLink', formDataState.meetingLink);
    } else {
      formData.append('address', formDataState.address);
      if (formDataState.placeId) formData.append('placeId', formDataState.placeId);
      if (formDataState.city) formData.append('city', formDataState.city);
      if (formDataState.country) formData.append('country', formDataState.country);
      if (formDataState.lat) formData.append('lat', formDataState.lat);
      if (formDataState.lng) formData.append('lng', formDataState.lng);
    }

    const optionsObj = {
      ticketPrice: formDataState.ticketType === 'paid' ? Number(formDataState.ticketPrice) : 0,
      requireApproval: formDataState.requireApproval,
      capacity: formDataState.capacityType === 'limited' ? Number(formDataState.capacity) : undefined,
    };
    formData.append('options', JSON.stringify(optionsObj));
    if (bannerFile) formData.append('bannerUrl', bannerFile);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong');
    }
  };

  const previewStartDate = formDataState.startDate ? new Date(formDataState.startDate) : null;
  const previewMonth = previewStartDate ? previewStartDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '';
  const previewDay = previewStartDate ? previewStartDate.getDate() : '';
  const previewWeekday = previewStartDate ? previewStartDate.toLocaleString('en-US', { weekday: 'short' }) : '';
  const formatPreviewTime = (date) => date?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) || '';
  const previewTimeRange = previewStartDate
    ? `${previewWeekday}, ${previewStartDate.toLocaleString('en-US', { month: 'short' })} ${previewDay} • ${formatPreviewTime(previewStartDate)}${
        formDataState.endDate ? ` - ${formatPreviewTime(new Date(formDataState.endDate))}` : ''
      }`
    : 'No Date Scheduled';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Column 1: Live Card Preview */}
      <div className="lg:col-span-5 lg:sticky lg:top-[100px] space-y-4">
        <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest px-1">
          <Sparkles className="w-4 h-4" />
          <span>Live Card Preview</span>
        </div>

        <Card className="group flex flex-col h-full bg-[#121315]/45 border border-white/[0.06] rounded-[24px] overflow-hidden hover:border-white/[0.12] transition-all duration-300 relative">
          <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-luma-blue/10 via-luma-indigo/5 to-luma-yellow/5 shrink-0">
            {bannerPreview ? (
              <img src={bannerPreview} alt={formDataState.title || 'Banner Preview'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center relative p-4 text-center">
                <Calendar className="w-10 h-10 text-luma-blue/60 mb-2" />
                <span className="text-xs text-luma-text-muted font-medium uppercase tracking-widest">{formDataState.calender} calendar</span>
              </div>
            )}
            {previewStartDate && (
              <div className="absolute top-4 left-4 bg-luma-bg/90 backdrop-blur-md border border-white/[0.08] rounded-2xl p-2 flex flex-col items-center justify-center min-w-[54px] min-h-[58px] shadow-[0_4px_20px_rgba(0,0,0,0.4)] animate-fade-in">
                <span className="text-[10px] font-bold tracking-wider text-luma-blue leading-none mb-0.5">{previewMonth}</span>
                <span className="text-xl font-extrabold text-white leading-none">{previewDay}</span>
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-1.5">
              <span className="flex items-center gap-1 bg-[#121315]/80 backdrop-blur-md border border-white/[0.06] rounded-full px-2.5 py-1 text-[10px] font-semibold text-luma-text-light-gray shadow-md">
                {formDataState.location === 'online' ? (
                  <>
                    <Video className="w-3 h-3 text-luma-blue" /> <span>Online</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3 text-luma-yellow" /> <span>Physical</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold text-luma-blue uppercase tracking-widest truncate max-w-[150px]">
                  {formDataState.calender} calendar
                </span>
                <span className="flex items-center gap-1 text-[10px] text-luma-text-muted bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.04]">
                  {formDataState.visibility === 'Private' ? (
                    <>
                      <Lock className="w-2.5 h-2.5" /> <span>Private</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-2.5 h-2.5" /> <span>Public</span>
                    </>
                  )}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">{formDataState.title || 'Untitled Event'}</h3>
              <p className="text-sm text-luma-text-muted mt-2 line-clamp-2 leading-relaxed">
                {formDataState.description || 'Your event description will appear here as you fill in the details...'}
              </p>
              <div className="mt-4 space-y-2 border-t border-white/[0.04] pt-4">
                <div className="flex items-center gap-2 text-xs text-luma-text-muted">
                  <Clock className="w-3.5 h-3.5 text-luma-blue shrink-0" />
                  <span className="truncate">{previewTimeRange}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-luma-text-muted">
                  {formDataState.location === 'online' ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-luma-blue shrink-0" />
                      <span className="truncate text-luma-blue/80">{formDataState.meetingLink || 'Meeting link will go here'}</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-luma-yellow shrink-0" />
                      <span className="truncate">{formDataState.address || 'Address details will go here'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 border-t border-white/[0.04] pt-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    formDataState.ticketType === 'free' || !formDataState.ticketPrice || Number(formDataState.ticketPrice) <= 0
                      ? 'bg-luma-green-bg/25 border-luma-green/20 text-luma-yellow'
                      : 'bg-luma-blue/10 border-luma-blue/20 text-luma-blue'
                  }`}
                >
                  {formDataState.ticketType === 'paid' && Number(formDataState.ticketPrice) > 0 ? `$${formDataState.ticketPrice}` : 'Free'}
                </span>
                {formDataState.requireApproval && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/[0.02] border border-white/[0.06] text-luma-text-muted px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-luma-yellow" /> <span>Approval Required</span>
                  </span>
                )}
                {formDataState.capacityType === 'limited' && formDataState.capacity && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/[0.02] border border-white/[0.06] text-luma-text-muted px-2 py-0.5 rounded-full">
                    <Users className="w-3 h-3" /> <span>Cap: {formDataState.capacity}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Column 2: Form */}
      <div className="lg:col-span-7">
        <Card className="bg-[#121315]/65 border border-white/[0.08] rounded-[28px] p-6 sm:p-8 shadow-[0_24px_80px_-15px_rgba(0,0,0,0.8)] backdrop-blur-[24px] relative overflow-hidden transition-all duration-500 hover:border-white/[0.15]">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-luma-blue via-luma-indigo to-luma-yellow opacity-80" />

          {submitting && (
            <div className="absolute inset-0 bg-[#121315]/80 backdrop-blur-[8px] z-50 flex items-center justify-center rounded-[28px] animate-fade-in">
              <Spinner size="lg" variant="primary" label="Saving your event..." />
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1">
              <Calendar className="w-4 h-4" />
              <span>Configure Event</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">Event Details</h1>
          </div>

          {error && (
            <div className="mb-5 text-xs font-semibold text-luma-red bg-luma-red/10 border border-luma-red/20 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="title" className="text-xs font-medium text-luma-text-muted">
                Event Name
              </label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Nexus Developer Meetup"
                value={formDataState.title}
                onChange={handleInputChange}
                className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="text-xs font-medium text-luma-text-muted">
                About the Event
              </label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Provide a detailed description of what attendees can expect..."
                value={formDataState.description}
                onChange={handleInputChange}
                className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue text-sm rounded-[12px] px-3.5 min-h-[90px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-luma-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-luma-blue" />
                <span>Schedule</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-luma-text-gray uppercase tracking-wider block font-semibold">Start</span>
                  <Input
                    type="datetime-local"
                    name="startDate"
                    value={formDataState.startDate}
                    onChange={handleInputChange}
                    className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-luma-text-gray uppercase tracking-wider block font-semibold">End (Optional)</span>
                  <Input
                    type="datetime-local"
                    name="endDate"
                    value={formDataState.endDate}
                    onChange={handleInputChange}
                    className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-luma-text-muted tracking-wide uppercase">Cover Banner Image</label>
              {bannerPreview ? (
                <div className="relative group rounded-[16px] overflow-hidden border border-white/[0.08] h-36 bg-white/[0.02]">
                  <img src={bannerPreview} alt="Event banner preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label htmlFor="banner-upload" className="px-3 py-1 bg-white text-black text-xs font-bold rounded-lg cursor-pointer">
                      Change
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview(null);
                      }}
                      className="px-3 py-1 bg-luma-red text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="banner-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-white/[0.08] hover:border-luma-blue/40 rounded-[16px] p-5 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group"
                >
                  <Upload className="w-6 h-6 text-luma-text-gray group-hover:text-luma-blue transition-colors mb-2" />
                  <span className="text-xs font-bold text-luma-text-primary">Upload Event Cover Banner</span>
                </label>
              )}
              <input id="banner-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-luma-text-muted block">Event Medium</label>
              <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormDataState((prev) => ({ ...prev, location: 'online' }))}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    formDataState.location === 'online' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-luma-text-muted hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-luma-blue" /> Online Link
                </button>
                <button
                  type="button"
                  onClick={() => setFormDataState((prev) => ({ ...prev, location: 'physical' }))}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    formDataState.location === 'physical' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-luma-text-muted hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-luma-yellow" /> Physical Venue
                </button>
              </div>
            </div>

            {formDataState.location === 'online' ? (
              <div className="space-y-1 animate-fade-in">
                <label htmlFor="meetingLink" className="text-xs font-medium text-luma-text-muted">
                  Virtual Meeting Link
                </label>
                <Input
                  id="meetingLink"
                  name="meetingLink"
                  placeholder="e.g. https://zoom.us/j/123456"
                  value={formDataState.meetingLink}
                  onChange={handleInputChange}
                  className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5"
                />
              </div>
            ) : (
              <div className="space-y-1 animate-fade-in">
                <label htmlFor="address" className="text-xs font-medium text-luma-text-muted">
                  Physical Venue Address
                </label>
                <LocationAutocomplete
                  id="address"
                  value={formDataState.address}
                  onChange={(val) => setFormDataState((prev) => ({ ...prev, address: val }))}
                  onSelect={handlePlaceSelect}
                  className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px]"
                />
                {formDataState.lat && (
                  <p className="text-[10px] text-luma-text-dimmed pl-1">📍 Coordinates captured for location-based Discover.</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="visibility" className="text-xs font-medium text-luma-text-muted">
                  Event Privacy
                </label>
                <Select id="visibility" name="visibility" value={formDataState.visibility} onChange={handleInputChange}>
                  <option value="Public">Public (Listed)</option>
                  <option value="Private">Private (Invite-Only)</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label htmlFor="calender" className="text-xs font-medium text-luma-text-muted">
                  Category
                </label>
                <Select id="calender" name="calender" value={formDataState.calender} onChange={handleInputChange}>
                  <option value="personal">Personal</option>
                  <option value="developer">Developer Meetup</option>
                  <option value="web3">Web3 & Tech</option>
                  <option value="social">Social Gathering</option>
                  <option value="business">Business</option>
                  <option value="health">Health & Wellness</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-luma-text-muted block">Tickets & Price</label>
              <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormDataState((prev) => ({ ...prev, ticketType: 'free', ticketPrice: '' }))}
                  className={`flex items-center justify-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    formDataState.ticketType === 'free' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-luma-text-muted hover:text-white'
                  }`}
                >
                  Free Entry
                </button>
                <button
                  type="button"
                  onClick={() => setFormDataState((prev) => ({ ...prev, ticketType: 'paid' }))}
                  className={`flex items-center justify-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    formDataState.ticketType === 'paid' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-luma-text-muted hover:text-white'
                  }`}
                >
                  Paid Ticket
                </button>
              </div>
              {formDataState.ticketType === 'paid' && (
                <div className="relative flex items-center animate-fade-in mt-1.5">
                  <div className="absolute left-3.5 text-luma-text-gray font-medium text-sm">$</div>
                  <Input
                    type="number"
                    name="ticketPrice"
                    min="0"
                    step="0.01"
                    placeholder="Ticket Price (USD)"
                    value={formDataState.ticketPrice}
                    onChange={handleInputChange}
                    className="pl-8 pr-3.5 w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px]"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-luma-text-muted block">Attendance Capacity</label>
              <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormDataState((prev) => ({ ...prev, capacityType: 'unlimited', capacity: '' }))}
                  className={`flex items-center justify-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    formDataState.capacityType === 'unlimited' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-luma-text-muted hover:text-white'
                  }`}
                >
                  Unlimited
                </button>
                <button
                  type="button"
                  onClick={() => setFormDataState((prev) => ({ ...prev, capacityType: 'limited' }))}
                  className={`flex items-center justify-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    formDataState.capacityType === 'limited' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-luma-text-muted hover:text-white'
                  }`}
                >
                  Limit Capacity
                </button>
              </div>
              {formDataState.capacityType === 'limited' && (
                <div className="relative flex items-center animate-fade-in mt-1.5">
                  <Users className="absolute left-3.5 h-4 w-4 text-luma-text-gray" />
                  <Input
                    type="number"
                    name="capacity"
                    min="1"
                    placeholder="Max Attendees Limit"
                    value={formDataState.capacity}
                    onChange={handleInputChange}
                    className="pl-10 pr-3.5 w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px]"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-[16px]">
              <div className="flex gap-2.5 items-start max-w-[80%]">
                <ShieldCheck className="w-5 h-5 text-luma-blue shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Host Approval Required</span>
                  <span className="text-[10px] text-luma-text-muted leading-relaxed block mt-0.5">
                    Require guests to request an invite before gaining access to event info.
                  </span>
                </div>
              </div>
              <Switch
                checked={formDataState.requireApproval}
                onCheckedChange={(checked) => setFormDataState((prev) => ({ ...prev, requireApproval: checked }))}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
              {onCancel && (
                <Button type="button" onClick={onCancel} variant="ghost" className="w-full sm:w-auto h-11 text-xs font-semibold rounded-[12px]">
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full sm:w-auto h-11 text-xs font-bold px-8 rounded-[12px] bg-white hover:bg-white/95 text-black flex items-center justify-center gap-2"
              >
                <span>{submitLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
