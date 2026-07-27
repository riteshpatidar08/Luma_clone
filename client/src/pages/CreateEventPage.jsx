import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  ChevronLeft
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Switch } from '../components/ui/Switch';
import { Toast } from '../components/ui/Toast';
import { Spinner } from '../components/ui/Spinner';

function CreateEventPage() {
  const navigate = useNavigate();
  const [formDataState, setFormDataState] = useState({
    title: '',
    description: '',
    visibility: 'Public',
    calender: 'personal',
    startDate: '',
    endDate: '',
    location: 'online', // 'online' or 'physical'
    address: '',
    meetingLink: '',
    ticketType: 'free', // 'free' or 'paid'
    ticketPrice: '',
    capacityType: 'unlimited', // 'unlimited' or 'limited'
    capacity: '',
    requireApproval: false,
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toast notifications
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const triggerToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formDataState.title.trim()) {
      triggerToast('Event name is required.', 'warning');
      return;
    }
    if (!formDataState.description.trim()) {
      triggerToast('Description is required.', 'warning');
      return;
    }
    if (!formDataState.startDate) {
      triggerToast('Start date is required.', 'warning');
      return;
    }
    if (formDataState.location === 'online' && !formDataState.meetingLink.trim()) {
      triggerToast('Meeting link is required for online events.', 'warning');
      return;
    }
    if (formDataState.location === 'physical' && !formDataState.address.trim()) {
      triggerToast('Physical address is required for in-person events.', 'warning');
      return;
    }
    if (formDataState.ticketType === 'paid' && (!formDataState.ticketPrice || Number(formDataState.ticketPrice) <= 0)) {
      triggerToast('Ticket price must be greater than 0.', 'warning');
      return;
    }
    if (formDataState.capacityType === 'limited' && (!formDataState.capacity || Number(formDataState.capacity) <= 0)) {
      triggerToast('Capacity limit must be at least 1.', 'warning');
      return;
    }
    if (!bannerFile) {
      triggerToast('Please upload an event banner cover image.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const formData = new FormData();
      formData.append('title', formDataState.title);
      formData.append('description', formDataState.description);
      formData.append('visibility', formDataState.visibility);
      formData.append('calender', formDataState.calender);
      formData.append('startDate', formDataState.startDate);
      if (formDataState.endDate) {
        formData.append('endDate', formDataState.endDate);
      }
      formData.append('location', formDataState.location);
      if (formDataState.location === 'online') {
        formData.append('meetingLink', formDataState.meetingLink);
      } else {
        formData.append('address', formDataState.address);
      }

      // options
      const optionsObj = {
        ticketPrice: formDataState.ticketType === 'paid' ? Number(formDataState.ticketPrice) : 0,
        requireApproval: formDataState.requireApproval,
        capacity: formDataState.capacityType === 'limited' ? Number(formDataState.capacity) : undefined
      };
      formData.append('options', JSON.stringify(optionsObj));
      formData.append('bannerUrl', bannerFile);

      const res = await axios.post(`${apiUrl}/events`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.status === 201) {
        triggerToast('Event created successfully!', 'success');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        triggerToast('Failed to create event.', 'error');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'An error occurred';
      triggerToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper date parsing for live preview card date badge
  const previewStartDate = formDataState.startDate ? new Date(formDataState.startDate) : null;
  const previewMonth = previewStartDate 
    ? previewStartDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() 
    : '';
  const previewDay = previewStartDate ? previewStartDate.getDate() : '';
  const previewWeekday = previewStartDate 
    ? previewStartDate.toLocaleString('en-US', { weekday: 'short' }) 
    : '';

  const formatPreviewTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const previewTimeRange = previewStartDate
    ? `${previewWeekday}, ${previewStartDate.toLocaleString('en-US', { month: 'short' })} ${previewDay} • ${formatPreviewTime(previewStartDate)}${
        formDataState.endDate ? ` - ${formatPreviewTime(new Date(formDataState.endDate))}` : ''
      }`
    : 'No Date Scheduled';

  return (
    <div className="min-h-screen bg-luma-bg text-luma-text-primary selection:bg-luma-blue/30 selection:text-luma-white font-sans py-12 px-4 sm:px-6 lg:px-8 relative flex flex-col justify-between">
      {/* Toast Notification Feed */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      {/* Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[380px] h-[380px] rounded-full bg-luma-blue/10 blur-[120px] animate-float-1" />
        <div className="absolute bottom-[15%] right-[10%] w-[420px] h-[420px] rounded-full bg-luma-indigo/15 blur-[130px] animate-float-2" />
        <div className="absolute top-[45%] right-[25%] w-[320px] h-[320px] rounded-full bg-luma-yellow/5 blur-[100px] animate-float-3" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Back Link */}
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Live Card Preview (Left Side, Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-[100px] space-y-4">
            <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest px-1">
              <Sparkles className="w-4 h-4" />
              <span>Live Card Preview</span>
            </div>

            <Card className="group flex flex-col h-full bg-[#121315]/45 border border-white/[0.06] rounded-[24px] overflow-hidden hover:border-white/[0.12] hover:bg-[#121315]/65 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 relative">
              {/* Banner Area */}
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-luma-blue/10 via-luma-indigo/5 to-luma-yellow/5 shrink-0">
                {bannerPreview ? (
                  <img 
                    src={bannerPreview} 
                    alt={formDataState.title || "Banner Preview"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative p-4 text-center">
                    <div className="absolute inset-0 bg-grid-white/[0.02]" />
                    <Calendar className="w-10 h-10 text-luma-blue/60 mb-2" />
                    <span className="text-xs text-luma-text-muted font-medium uppercase tracking-widest">
                      {formDataState.calender || 'personal'} calendar
                    </span>
                  </div>
                )}

                {/* Date Badge Overlay */}
                {previewStartDate && (
                  <div className="absolute top-4 left-4 bg-luma-bg/90 backdrop-blur-md border border-white/[0.08] rounded-2xl p-2 flex flex-col items-center justify-center min-w-[54px] min-h-[58px] shadow-[0_4px_20px_rgba(0,0,0,0.4)] animate-fade-in">
                    <span className="text-[10px] font-bold tracking-wider text-luma-blue leading-none mb-0.5">{previewMonth}</span>
                    <span className="text-xl font-extrabold text-white leading-none">{previewDay}</span>
                  </div>
                )}

                {/* Location Badge Overlay */}
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="flex items-center gap-1 bg-[#121315]/80 backdrop-blur-md border border-white/[0.06] rounded-full px-2.5 py-1 text-[10px] font-semibold text-luma-text-light-gray shadow-md">
                    {formDataState.location === 'online' ? (
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
                  {/* Calendar Category & Visibility */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold text-luma-blue uppercase tracking-widest truncate max-w-[150px]">
                      {formDataState.calender} calendar
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-luma-text-muted bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.04]">
                      {formDataState.visibility === 'Private' ? (
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

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">
                    {formDataState.title || 'Untitled Event'}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-luma-text-muted mt-2 line-clamp-2 leading-relaxed">
                    {formDataState.description || 'Your event description will appear here as you fill in the details...'}
                  </p>

                  {/* Schedule / Time Row */}
                  <div className="mt-4 space-y-2 border-t border-white/[0.04] pt-4">
                    <div className="flex items-center gap-2 text-xs text-luma-text-muted">
                      <Clock className="w-3.5 h-3.5 text-luma-blue shrink-0" />
                      <span className="truncate">{previewTimeRange}</span>
                    </div>

                    {/* Location Address / Link Row */}
                    <div className="flex items-center gap-2 text-xs text-luma-text-muted">
                      {formDataState.location === 'online' ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-luma-blue shrink-0" />
                          <span className="truncate text-luma-blue/80">
                            {formDataState.meetingLink || 'Meeting link will go here'}
                          </span>
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

                {/* Footer Badges */}
                <div className="mt-5 border-t border-white/[0.04] pt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {/* Ticket Price */}
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      formDataState.ticketType === 'free' || !formDataState.ticketPrice || Number(formDataState.ticketPrice) <= 0
                        ? 'bg-luma-green-bg/25 border-luma-green/20 text-luma-yellow'
                        : 'bg-luma-blue/10 border-luma-blue/20 text-luma-blue'
                    }`}>
                      {formDataState.ticketType === 'paid' && Number(formDataState.ticketPrice) > 0 
                        ? `$${formDataState.ticketPrice}` 
                        : 'Free'}
                    </span>

                    {/* Require Approval */}
                    {formDataState.requireApproval && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/[0.02] border border-white/[0.06] text-luma-text-muted px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-luma-yellow" />
                        <span>Approval Required</span>
                      </span>
                    )}

                    {/* Capacity */}
                    {formDataState.capacityType === 'limited' && formDataState.capacity && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/[0.02] border border-white/[0.06] text-luma-text-muted px-2 py-0.5 rounded-full">
                        <Users className="w-3 h-3" />
                        <span>Cap: {formDataState.capacity}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 2: Event Form (Right Side) */}
          <div className="lg:col-span-7">
            <Card className="bg-[#121315]/65 border border-white/[0.08] rounded-[28px] p-6 sm:p-8 shadow-[0_24px_80px_-15px_rgba(0,0,0,0.8)] backdrop-blur-[24px] relative overflow-hidden transition-all duration-500 hover:border-white/[0.15]">
              {/* Subtle colorful top-highlight border */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-luma-blue via-luma-indigo to-luma-yellow opacity-80" />

              {/* Glassmorphic Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-[#121315]/80 backdrop-blur-[8px] z-50 flex items-center justify-center rounded-[28px] animate-fade-in">
                  <Spinner size="lg" variant="primary" label="Creating your community event..." />
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Configure Event</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Event Details
                </h1>
                <p className="text-luma-text-muted mt-0.5 text-xs">
                  Fill out the parameters below. Look at the left preview card to see how it looks.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Event Title */}
                <div className="space-y-1">
                  <label htmlFor="title" className="text-xs font-medium text-luma-text-muted">
                    Event Name
                  </label>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="e.g. Nexus Developer Meetup"
                    value={formDataState.title}
                    onChange={handleInputChange}
                    className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5 placeholder:text-luma-text-gray"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label htmlFor="description" className="text-xs font-medium text-luma-text-muted">
                    About the Event
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    placeholder="Provide a detailed description of what attendees can expect..."
                    value={formDataState.description}
                    onChange={handleInputChange}
                    className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue text-sm rounded-[12px] px-3.5 placeholder:text-luma-text-gray min-h-[90px]"
                  />
                </div>

                {/* Dates */}
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
                        required
                        value={formDataState.startDate}
                        onChange={handleInputChange}
                        className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5 text-luma-text-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-luma-text-gray uppercase tracking-wider block font-semibold">End (Optional)</span>
                      <Input
                        type="datetime-local"
                        name="endDate"
                        value={formDataState.endDate}
                        onChange={handleInputChange}
                        className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5 text-luma-text-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-luma-text-muted tracking-wide uppercase">
                    Cover Banner Image
                  </label>
                  {bannerPreview ? (
                    <div className="relative group rounded-[16px] overflow-hidden border border-white/[0.08] h-36 bg-white/[0.02]">
                      <img
                        src={bannerPreview}
                        alt="Event banner preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label
                          htmlFor="banner-upload"
                          className="px-3 py-1 bg-white text-black text-xs font-bold rounded-lg cursor-pointer hover:bg-white/95 transition-all shadow-md"
                        >
                          Change
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setBannerFile(null);
                            setBannerPreview(null);
                          }}
                          className="px-3 py-1 bg-luma-red text-white text-xs font-bold rounded-lg hover:bg-luma-red-hover transition-all shadow-md"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="banner-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-white/[0.08] hover:border-luma-blue/40 rounded-[16px] p-5 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group animate-fade-in"
                    >
                      <Upload className="w-6 h-6 text-luma-text-gray group-hover:text-luma-blue transition-colors mb-2" />
                      <span className="text-xs font-bold text-luma-text-primary">
                        Upload Event Cover Banner
                      </span>
                      <span className="text-[9px] text-luma-text-gray mt-0.5 text-center">
                        Drag & drop or click to upload.
                      </span>
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Location Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-luma-text-muted block">
                    Event Medium
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormDataState(prev => ({ ...prev, location: 'online' }))}
                      className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        formDataState.location === 'online'
                          ? 'bg-white/[0.08] text-white shadow-sm'
                          : 'text-luma-text-muted hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-luma-blue" />
                      Online Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDataState(prev => ({ ...prev, location: 'physical' }))}
                      className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        formDataState.location === 'physical'
                          ? 'bg-white/[0.08] text-white shadow-sm'
                          : 'text-luma-text-muted hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-luma-yellow" />
                      Physical Venue
                    </button>
                  </div>
                </div>

                {/* Location Inputs (Conditional) */}
                {formDataState.location === 'online' ? (
                  <div className="space-y-1 animate-fade-in">
                    <label htmlFor="meetingLink" className="text-xs font-medium text-luma-text-muted">
                      Virtual Meeting Link
                    </label>
                    <Input
                      id="meetingLink"
                      name="meetingLink"
                      required
                      placeholder="e.g. https://zoom.us/j/123456"
                      value={formDataState.meetingLink}
                      onChange={handleInputChange}
                      className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5 placeholder:text-luma-text-gray"
                    />
                  </div>
                ) : (
                  <div className="space-y-1 animate-fade-in">
                    <label htmlFor="address" className="text-xs font-medium text-luma-text-muted">
                      Physical Venue Address
                    </label>
                    <Input
                      id="address"
                      name="address"
                      required
                      placeholder="e.g. 101 Innovation Hub, San Francisco, CA"
                      value={formDataState.address}
                      onChange={handleInputChange}
                      className="w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] px-3.5 placeholder:text-luma-text-gray"
                    />
                  </div>
                )}

                {/* Visibility & Calendar selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="visibility" className="text-xs font-medium text-luma-text-muted">
                      Event Privacy
                    </label>
                    <Select
                      id="visibility"
                      name="visibility"
                      value={formDataState.visibility}
                      onChange={handleInputChange}
                    >
                      <option value="Public">Public (Listed)</option>
                      <option value="Private">Private (Invite-Only)</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="calender" className="text-xs font-medium text-luma-text-muted">
                      Calendar Category
                    </label>
                    <Select
                      id="calender"
                      name="calender"
                      value={formDataState.calender}
                      onChange={handleInputChange}
                    >
                      <option value="personal">Personal</option>
                      <option value="developer">Developer Meetup</option>
                      <option value="web3">Web3 & Tech</option>
                      <option value="social">Social Gathering</option>
                    </Select>
                  </div>
                </div>

                {/* Tickets Pricing */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-luma-text-muted block">
                    Tickets & Price
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormDataState(prev => ({ ...prev, ticketType: 'free', ticketPrice: '' }))}
                      className={`flex items-center justify-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        formDataState.ticketType === 'free'
                          ? 'bg-white/[0.08] text-white shadow-sm'
                          : 'text-luma-text-muted hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      Free Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDataState(prev => ({ ...prev, ticketType: 'paid' }))}
                      className={`flex items-center justify-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        formDataState.ticketType === 'paid'
                          ? 'bg-white/[0.08] text-white shadow-sm'
                          : 'text-luma-text-muted hover:text-white hover:bg-white/[0.02]'
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
                        required
                        placeholder="Ticket Price (USD)"
                        value={formDataState.ticketPrice}
                        onChange={handleInputChange}
                        className="pl-8 pr-3.5 w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] placeholder:text-luma-text-gray"
                      />
                    </div>
                  )}
                </div>

                {/* Capacity Limits */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-luma-text-muted block">
                    Attendance Capacity
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormDataState(prev => ({ ...prev, capacityType: 'unlimited', capacity: '' }))}
                      className={`flex items-center justify-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        formDataState.capacityType === 'unlimited'
                          ? 'bg-white/[0.08] text-white shadow-sm'
                          : 'text-luma-text-muted hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      Unlimited
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDataState(prev => ({ ...prev, capacityType: 'limited' }))}
                      className={`flex items-center justify-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        formDataState.capacityType === 'limited'
                          ? 'bg-white/[0.08] text-white shadow-sm'
                          : 'text-luma-text-muted hover:text-white hover:bg-white/[0.02]'
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
                        required
                        placeholder="Max Attendees Limit"
                        value={formDataState.capacity}
                        onChange={handleInputChange}
                        className="pl-10 pr-3.5 w-full bg-luma-black/30 border-white/[0.08] focus:border-luma-blue h-11 text-sm rounded-[12px] placeholder:text-luma-text-gray"
                      />
                    </div>
                  )}
                </div>

                {/* Require Approval Switch */}
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
                    onCheckedChange={(checked) => setFormDataState(prev => ({ ...prev, requireApproval: checked }))}
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                  <Button
                    type="button"
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="w-full sm:w-auto h-11 text-xs font-semibold rounded-[12px] hover:bg-white/[0.04] text-luma-text-muted hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full sm:w-auto h-11 text-xs font-bold px-8 rounded-[12px] bg-white hover:bg-white/95 text-black hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_4px_18px_rgba(255,255,255,0.12)] flex items-center justify-center gap-2"
                  >
                    <span>Create Event</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateEventPage;
