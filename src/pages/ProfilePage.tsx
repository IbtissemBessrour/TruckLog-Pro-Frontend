import { motion } from 'framer-motion';
import { UserCircle, Mail, Truck, Shield, Edit3 } from 'lucide-react';
import TopNav from '@/components/layout/TopNav';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8088/api/auth/profile/";

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', truck_id: '', carrier: '', cdl_number: '' });
  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) return;
    axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setProfile(res.data);
        setFormData(res.data);
      })
      .catch(err => console.error(err));
  }, [token]);

  const handleUpdate = async () => {
    if (!token) return;
    try {
      const res = await axios.put(API_URL, formData, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  if (!profile) return null;

  return (
    <div>
      <TopNav title="Profile" />
      <div className="p-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
              <UserCircle className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{profile.username}</h2>
              <p className="text-muted-foreground">Professional Driver</p>
            </div>
          </div>

          <div className="space-y-4">
            <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} editable={editMode} />
            <ProfileRow icon={<Truck className="w-4 h-4" />} label="Truck ID" value={formData.truck_id} onChange={v => setFormData({ ...formData, truck_id: v })} editable={editMode} />
            <ProfileRow icon={<Shield className="w-4 h-4" />} label="Carrier" value={formData.carrier} onChange={v => setFormData({ ...formData, carrier: v })} editable={editMode} />
            <ProfileRow icon={<UserCircle className="w-4 h-4" />} label="CDL Number" value={formData.cdl_number} onChange={v => setFormData({ ...formData, cdl_number: v })} editable={editMode} />
          </div>

          <button onClick={editMode ? handleUpdate : () => setEditMode(true)} className="mt-4 w-full h-10 bg-primary text-white rounded-lg flex items-center justify-center gap-2">
            <Edit3 className="w-4 h-4" /> {editMode ? 'Save Profile' : 'Edit Profile'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const ProfileRow = ({ icon, label, value, onChange, editable = false }: { icon: React.ReactNode; label: string; value: string; onChange?: (v: string) => void; editable?: boolean }) => (
  <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
    <span className="text-muted-foreground">{icon}</span>
    <div className="flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {editable ? (
        <input value={value} onChange={e => onChange?.(e.target.value)} className="w-full bg-transparent border-b border-border text-sm text-foreground outline-none" />
      ) : (
        <p className="text-sm font-medium text-foreground">{value || '-'}</p>
      )}
    </div>
  </div>
);

export default ProfilePage;