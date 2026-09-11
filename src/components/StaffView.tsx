import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { UserCheck, Phone, Mail, MapPin, IdCard, Calendar, Award, User, ShieldCheck, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseSAIDNumber } from '../utils/helpers';

export const StaffView: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    role: 'Assessor',
    phone: '',
    email: '',
    location: '',
    idNumber: '',
    nationality: 'South Africa',
    eeStatus: '',
    license: ''
  });

  const fetchStaff = () => {
    setLoading(true);
    fetch('/rosco/api/staff')
      .then(res => res.json())
      .then(data => {
        const enrichedStaff = (data.staff || []).map((person: Staff) => {
          const details = parseSAIDNumber(person.idNumber);
          if (details.dob !== 'Unknown') {
            return {
              ...person,
              age: details.age,
              dateOfBirth: details.dob
            };
          }
          return person;
        });
        setStaff(enrichedStaff);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch staff', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenModal = (person?: Staff) => {
    if (person) {
      setEditingStaff(person);
      setFormData(person);
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        role: 'Assessor',
        phone: '',
        email: '',
        location: '',
        idNumber: '',
        nationality: 'South Africa',
        dateOfBirth: '',
        age: 0,
        eeStatus: '',
        license: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleIdNumberChange = (val: string) => {
    const updated = { ...formData, idNumber: val };
    if (val.length === 13) {
      const details = parseSAIDNumber(val);
      if (details.dob !== 'Unknown') {
        updated.dateOfBirth = details.dob;
        updated.age = details.age;
      }
    }
    setFormData(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingStaff ? 'PUT' : 'POST';
    const url = editingStaff ? `/rosco/api/staff/${editingStaff.id}` : '/rosco/api/staff';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        fetchStaff();
        handleCloseModal();
      })
      .catch(err => console.error('Failed to save staff', err));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      fetch(`/rosco/api/staff/${id}`, { method: 'DELETE' })
        .then(() => fetchStaff())
        .catch(err => console.error('Failed to delete staff', err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-400" />
            Staff & Personnel
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Authorized Assessors and Moderators for Rosco Consultants
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Personnel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staff.map((person, idx) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden group hover:border-indigo-500/50 transition-all shadow-xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{person.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          person.role === 'Assessor' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {person.role}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">ID: {person.idNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(person)}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(person.id)}
                      className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                    <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-sm font-mono">{person.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-sm">{person.email}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-300 bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{person.location}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Age & DOB
                    </span>
                    <p className="text-sm text-white font-medium">{person.age} yrs ({person.dateOfBirth})</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> EE Status
                    </span>
                    <p className="text-sm text-white font-medium">{person.eeStatus}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                      <Award className="w-3 h-3" /> License
                    </span>
                    <p className="text-sm text-white font-medium">{person.license}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                      <IdCard className="w-3 h-3" /> Nationality
                    </span>
                    <p className="text-sm text-white font-medium">{person.nationality}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Staff Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {editingStaff ? <Edit2 className="w-5 h-5 text-indigo-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
                  {editingStaff ? 'Edit Personnel' : 'Add New Personnel'}
                </h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="Assessor">Assessor</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">ID Number</label>
                    <input
                      required
                      type="text"
                      value={formData.idNumber}
                      onChange={e => handleIdNumberChange(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                      placeholder="13-digit ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                    <input
                      required
                      type="text"
                      value={formData.dateOfBirth}
                      onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                    <input
                      required
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                      placeholder="012 345 6789"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="South Africa"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Location / Address</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Full residential or office address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">EE Status</label>
                    <input
                      type="text"
                      value={formData.eeStatus}
                      onChange={e => setFormData({ ...formData, eeStatus: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="e.g. African Male"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">License / Transport</label>
                    <input
                      type="text"
                      value={formData.license}
                      onChange={e => setFormData({ ...formData, license: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="e.g. Code 08"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25"
                  >
                    <Save className="w-4 h-4" />
                    {editingStaff ? 'Update Personnel' : 'Save Personnel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
