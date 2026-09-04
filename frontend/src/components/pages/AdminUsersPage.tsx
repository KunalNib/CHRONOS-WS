import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Lock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { userService } from '../../services/userService';
import { User, UserRole } from '../../types/auth';
import { RoleGuard } from '../auth/RoleGuard';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('SOC_ANALYST');

  useEffect(() => {
    userService.getUsers().then(setUsers);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const created = await userService.createUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'ACTIVE',
      lastLogin: 'Never'
    });
    setUsers((prev) => [...prev, created]);
    setShowCreateModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleToggleStatus = async (user: User) => {
    const updated = await userService.toggleUserStatus(user.id);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    const updated = await userService.updateUserRole(user.id, newRole);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
  };

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
            Admin — User & Operator Access Management
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Role-Based Access Control (RBAC) user provisioning and access revocation
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-lg flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>CREATE OPERATOR</span>
        </button>
      </div>

      {/* User Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
            <tr>
              <th className="p-4">Operator Name & Email</th>
              <th className="p-4">Active Role</th>
              <th className="p-4">Account Status</th>
              <th className="p-4">Last Login</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4">
                  <div className="font-extrabold text-white">{u.name}</div>
                  <div className="text-[10px] text-slate-500">{u.email}</div>
                </td>
                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-orange-400 font-bold focus:outline-none"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SOC_ANALYST">SOC_ANALYST</option>
                    <option value="SECURITY_ENGINEER">SECURITY_ENGINEER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    u.status === 'ACTIVE' ? 'badge-green' : 'badge-red'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{u.lastLogin || 'Never'}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      u.status === 'ACTIVE'
                        ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {u.status === 'ACTIVE' ? 'DISABLE' : 'ENABLE'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white uppercase text-sm">Provision New Operator</span>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Operator Name"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Operator Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="operator@defence.local"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Assigned Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none font-bold text-orange-400"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SOC_ANALYST">SOC_ANALYST</option>
                  <option value="SECURITY_ENGINEER">SECURITY_ENGINEER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-lg"
              >
                PROVISION OPERATOR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
