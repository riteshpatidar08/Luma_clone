import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Settings, Save } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Toast } from '../../components/ui/Toast';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../lib/utils';
import { UsersAPI } from '../../lib/queries';
import { updateProfile } from '../../redux/authSlice';

const DEFAULT_AVATARS = Array.from({ length: 9 }, (_, i) => `https://cdn.lu.ma/avatars-default/avatar_${i + 1}.png`);

export default function ProfileSettingsPage() {
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', bio: '', phone: '', avatarUrl: '', organizerProfile: { displayName: '', website: '', about: '' } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    UsersAPI.me()
      .then((res) => {
        const u = res.data.data;
        setForm({
          name: u.name || '',
          bio: u.bio || '',
          phone: u.phone || '',
          avatarUrl: u.avatarUrl || DEFAULT_AVATARS[8],
          organizerProfile: {
            displayName: u.organizerProfile?.displayName || '',
            website: u.organizerProfile?.website || '',
            about: u.organizerProfile?.about || '',
          },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await UsersAPI.updateMe(form);
      dispatch(updateProfile({ name: res.data.user.name, avatarUrl: res.data.user.avatarUrl }));
      setToast({ open: true, message: 'Profile updated', type: 'success' });
    } catch (error) {
      setToast({ open: true, message: error.response?.data?.error || 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-24 flex justify-center"><Spinner size="lg" variant="primary" /></div>;
  }

  return (
    <div className="max-w-xl">
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((t) => ({ ...t, open: false }))} />
      <div className="flex items-center gap-2 text-luma-blue text-xs font-semibold uppercase tracking-widest mb-1.5">
        <Settings className="w-4 h-4" />
        <span>Profile Settings</span>
      </div>
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">Your profile</h1>

      <Card className="bg-[#121315]/45 border border-white/[0.06] rounded-[24px] p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar src={form.avatarUrl} className="h-16 w-16 border-2 border-luma-blue/40" />
            <div className="grid grid-cols-5 gap-2 flex-1">
              {DEFAULT_AVATARS.map((url) => (
                <button
                  type="button"
                  key={url}
                  onClick={() => setForm((f) => ({ ...f, avatarUrl: url }))}
                  className={cn(
                    'h-8 w-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer',
                    form.avatarUrl === url ? 'border-luma-blue scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={url} alt="avatar option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-luma-text-muted">Full Name</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="h-11 rounded-xl bg-luma-black/30 border-white/[0.08]" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-luma-text-muted">Phone</label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="h-11 rounded-xl bg-luma-black/30 border-white/[0.08]" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-luma-text-muted">Bio</label>
            <Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} className="rounded-xl bg-luma-black/30 border-white/[0.08]" />
          </div>

          {role !== 'attendee' && (
            <div className="border-t border-white/[0.06] pt-5 space-y-4">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Organizer Profile</p>
              <div className="space-y-1">
                <label className="text-xs font-medium text-luma-text-muted">Public Display Name</label>
                <Input
                  value={form.organizerProfile.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, organizerProfile: { ...f.organizerProfile, displayName: e.target.value } }))}
                  className="h-11 rounded-xl bg-luma-black/30 border-white/[0.08]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-luma-text-muted">Website</label>
                <Input
                  value={form.organizerProfile.website}
                  onChange={(e) => setForm((f) => ({ ...f, organizerProfile: { ...f.organizerProfile, website: e.target.value } }))}
                  className="h-11 rounded-xl bg-luma-black/30 border-white/[0.08]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-luma-text-muted">About</label>
                <Textarea
                  value={form.organizerProfile.about}
                  onChange={(e) => setForm((f) => ({ ...f, organizerProfile: { ...f.organizerProfile, about: e.target.value } }))}
                  rows={3}
                  className="rounded-xl bg-luma-black/30 border-white/[0.08]"
                />
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" disabled={saving} className="rounded-xl px-5 flex items-center gap-2">
            {saving ? <Spinner size="xs" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
