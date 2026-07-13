'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  X,
  Home,
  Wallet,
  Receipt,
  Target,
  CreditCard,
  TrendingUp,
  Building2,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  RefreshCcw,
  Send,
  CalendarDays,
  PiggyBank
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AnimatedLogo from '../ui/AnimatedLogo';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import { useAuth } from '@/contexts/AuthContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, pathname]);

  const mainNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { href: '/accounts', label: 'Accounts', icon: <Wallet size={20} /> },
    { href: '/transactions', label: 'Transactions', icon: <Receipt size={20} />, badge: 3 },
    { href: '/budget', label: 'Budget', icon: <Target size={20} /> },
    { href: '/cards', label: 'Cards', icon: <CreditCard size={20} /> },
    { href: '/goals', label: 'Goals', icon: <TrendingUp size={20} /> },
    { href: '/mis-finanzas', label: 'Mis Finanzas', icon: <PiggyBank size={20} /> },
  ];

  const secondaryNavItems: NavItem[] = [
    { href: '/transfer', label: 'Transfer Money', icon: <RefreshCcw size={20} /> },
    { href: '/p2p', label: 'Send to Friend', icon: <Send size={20} /> },
    { href: '/business', label: 'Business', icon: <Building2 size={20} /> },
    { href: '/subscriptions', label: 'Subscriptions', icon: <CalendarDays size={20} /> },
    { href: '/security', label: 'Security', icon: <Shield size={20} /> },
  ];

  const handleNavClick = (_href: string, _label: string) => {
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close drawer when swiped left
    if (info.offset.x < -100) {
      onClose();
    }
  };

  const drawerVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-40 lg:hidden"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-[rgba(var(--glass-rgb),0.98)] backdrop-blur-2xl border-r border-[var(--glass-border-prominent)] z-50 lg:hidden"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.2 }}
            onDrag={handleDrag}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-[var(--border-1)]">
                <div className="flex items-center justify-between mb-4">
                  <AnimatedLogo size="sm" showText />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="rounded-full p-1"
                    aria-label="Close drawer"
                  >
                    <X size={20} />
                  </Button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-blue)] to-[var(--primary-indigo)] flex items-center justify-center text-white font-medium">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-1)]">
                      {user?.first_name || user?.username || 'User'}
                    </p>
                    <p className="text-sm text-[var(--text-2)]">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto">
                {/* Main Navigation */}
                <nav className="p-2">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => handleNavClick(item.href, item.label)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                        ${pathname === item.href
                          ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]'
                          : 'text-[var(--text-1)] hover:bg-[rgba(var(--glass-rgb),0.3)]'
                        }
                      `}
                    >
                      {item.icon}
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary-red)] text-white">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={16} className="opacity-40" />
                    </Link>
                  ))}
                </nav>

                {/* Divider */}
                <div className="mx-4 my-2 border-t border-[var(--border-1)]" />

                {/* Secondary Navigation */}
                <nav className="p-2">
                  {secondaryNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => handleNavClick(item.href, item.label)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                        ${pathname === item.href
                          ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]'
                          : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[rgba(var(--glass-rgb),0.3)]'
                        }
                      `}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight size={16} className="opacity-40" />
                    </Link>
                  ))}
                </nav>

                {/* Quick Settings */}
                <div className="p-4 space-y-4">
                  <div className="p-3 rounded-lg bg-[rgba(var(--glass-rgb),0.2)] border border-[var(--border-1)]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-[var(--text-1)]">
                        Theme
                      </span>
                      <div className="flex items-center gap-2">
                        <Sun size={16} className={theme === 'light' ? 'text-[var(--primary-amber)]' : 'text-[var(--text-2)]'} />
                        <Switch
                          checked={theme === 'dark'}
                          onCheckedChange={(checked) => {
                            setTheme(checked ? 'dark' : 'light');
                          }}
                        />
                        <Moon size={16} className={theme === 'dark' ? 'text-[var(--primary-indigo)]' : 'text-[var(--text-2)]'} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--text-1)]">
                        Notifications
                      </span>
                      <Switch
                        checked={notificationsEnabled}
                        onCheckedChange={(checked) => {
                          setNotificationsEnabled(checked);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--border-1)] space-y-2">
                <Link
                  href="/settings"
                  onClick={() => handleNavClick('/settings', 'Settings')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[rgba(var(--glass-rgb),0.3)] transition-all"
                >
                  <Settings size={20} />
                  <span className="flex-1">Settings</span>
                  <ChevronRight size={16} className="opacity-40" />
                </Link>
                <Link
                  href="/help"
                  onClick={() => handleNavClick('/help', 'Help')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[rgba(var(--glass-rgb),0.3)] transition-all"
                >
                  <HelpCircle size={20} />
                  <span className="flex-1">Help & Support</span>
                  <ChevronRight size={16} className="opacity-40" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--primary-red)] hover:bg-[var(--primary-red)]/10 transition-all"
                >
                  <LogOut size={20} />
                  <span className="flex-1 text-left">Log Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
