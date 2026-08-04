import React, { useEffect, useState, useCallback } from 'react';
import { Users, Search, Ban, Trash2, Shield } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Avatar } from '../../components/ui/Avatar';
import { AdminAPI } from '../../lib/queries';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.users({ search: search || undefined, role: roleFilter === 'all' ? undefined : roleFilter });
      setUsers(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(load, 350);
    return () => clearTimeout(timer);
  }, [load]);

  const handleRoleChange = async (id, role) => {
    await AdminAPI.updateRole(id, role);
    load();
  };

  const handleToggleActive = async (id) => {
    await AdminAPI.toggleActive(id);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this user?')) return;
    await AdminAPI.deleteUser(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-luma-red text-xs font-semibold uppercase tracking-widest mb-1.5">
        <Users className="w-4 h-4" />
        <span>Users</span>
      </div>
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">Manage platform users</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-luma-text-gray" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." className="pl-10 h-10 rounded-xl" />
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-40 h-10 rounded-xl">
          <option value="all">All roles</option>
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </Select>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" variant="primary" /></div>
      ) : users.length === 0 ? (
        <p className="text-xs text-luma-text-muted py-10 text-center">No users match.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u._id} className="bg-[#121315]/45 border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3 flex-wrap">
              <Avatar src={u.avatarUrl} fallback={u.name?.[0] || 'U'} className="h-9 w-9" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate flex items-center gap-2">
                  {u.name || 'Unnamed'}
                  {!u.isActive && <span className="text-[9px] font-bold text-luma-red bg-luma-red/10 border border-luma-red/20 px-1.5 py-0.5 rounded-full">DEACTIVATED</span>}
                </p>
                <p className="text-[11px] text-luma-text-muted truncate">{u.email}</p>
              </div>
              <Select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="w-32 h-9 rounded-lg text-xs">
                <option value="attendee">Attendee</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </Select>
              <Button size="xs" variant="ghost" onClick={() => handleToggleActive(u._id)} className="flex items-center gap-1">
                <Ban className="w-3.5 h-3.5" /> {u.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button size="xs" variant="ghost" onClick={() => handleDelete(u._id)} className="text-luma-red flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              {u.role === 'admin' && <Shield className="w-3.5 h-3.5 text-luma-red" />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
