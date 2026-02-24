import { motion } from 'framer-motion';
import { UserCircle, Mail, Truck, Shield } from 'lucide-react';
import TopNav from '@/components/layout/TopNav';

const ProfilePage = () => (
  <div>
    <TopNav title="Profile" />
    <div className="p-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-8"
      >
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">John E. Doe</h2>
            <p className="text-muted-foreground">Professional Driver</p>
          </div>
        </div>
        <div className="space-y-4">
          <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email" value="john.doe@trucking.com" />
          <ProfileRow icon={<Truck className="w-4 h-4" />} label="Truck ID" value="123" />
          <ProfileRow icon={<Shield className="w-4 h-4" />} label="Carrier" value="Doe's Transportation" />
          <ProfileRow icon={<UserCircle className="w-4 h-4" />} label="CDL Number" value="CDL-2024-XX-1234" />
        </div>
      </motion.div>
    </div>
  </div>
);

const ProfileRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
    <span className="text-muted-foreground">{icon}</span>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
