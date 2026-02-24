import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import authBg from '@/assets/auth-bg.jpg';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Min 6 characters';
    if (!isLogin && password !== confirmPassword) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={authBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">TruckLog Pro</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Electronic Logging Made Simple</h2>
            <p className="text-muted-foreground text-lg max-w-md">
              FMCSA-compliant ELD logs, route planning, and fleet management in one platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold">TruckLog Pro</span>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
              <p className="text-muted-foreground text-sm">
                {isLogin ? 'Sign in to manage your fleet' : 'Start your free account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <InputField icon={<User className="w-4 h-4" />} placeholder="Full Name" type="text" />
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                icon={<Mail className="w-4 h-4" />}
                placeholder="Email"
                type="email"
                value={email}
                onChange={setEmail}
                error={errors.email}
              />
              <InputField
                icon={<Lock className="w-4 h-4" />}
                placeholder="Password"
                type="password"
                value={password}
                onChange={setPassword}
                error={errors.password}
              />

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <InputField
                      icon={<Lock className="w-4 h-4" />}
                      placeholder="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      error={errors.confirm}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <span className="text-primary font-medium">{isLogin ? 'Sign Up' : 'Sign In'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const InputField = ({
  icon, placeholder, type, value, onChange, error,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type: string;
  value?: string;
  onChange?: (v: string) => void;
  error?: string;
}) => (
  <div>
    <div className={`flex items-center gap-3 rounded-lg border bg-secondary/50 px-4 h-12 input-glow transition-all ${error ? 'border-destructive' : 'border-border'}`}>
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
      />
    </div>
    {error && <p className="text-destructive text-xs mt-1 ml-1">{error}</p>}
  </div>
);

export default AuthPage;
