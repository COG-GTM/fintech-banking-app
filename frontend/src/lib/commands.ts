import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Bitcoin,
  Building2,
  CreditCard,
  FileText,
  Landmark,
  LineChart,
  LockKeyhole,
  MessageSquare,
  Receipt,
  RefreshCcw,
  Send,
  Settings,
  Shield,
  Target,
  TrendingUp,
  User,
  Users,
  Wallet,
} from 'lucide-react';

export interface CommandContext {
  router: { push: (href: string) => void };
  logout: () => Promise<void>;
  toggleTheme: () => void;
}

export interface Command {
  id: string;
  label: string;
  keywords?: string[];
  group: 'Navigate' | 'Actions' | 'Preferences';
  icon: LucideIcon;
  shortcut?: string;
  run: (ctx: CommandContext) => void;
}

interface NavigationCommand {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  keywords: string[];
}

const navigationCommands: NavigationCommand[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: BarChart3, keywords: ['home', 'overview'] },
  { id: 'accounts', label: 'Accounts', href: '/accounts', icon: Wallet, keywords: ['bank', 'balances'] },
  { id: 'transactions', label: 'Transactions', href: '/transactions', icon: Receipt, keywords: ['activity', 'history', 'spending'] },
  { id: 'transfer', label: 'Transfer', href: '/transfer', icon: ArrowLeftRight, keywords: ['send', 'move money', 'wire'] },
  { id: 'p2p', label: 'P2P', href: '/p2p', icon: Users, keywords: ['pay someone', 'peer', 'person'] },
  { id: 'cards', label: 'Cards', href: '/cards', icon: CreditCard, keywords: ['debit', 'virtual'] },
  { id: 'credit-cards', label: 'Credit Cards', href: '/credit-cards', icon: CreditCard, keywords: ['credit', 'card'] },
  { id: 'budget', label: 'Budget', href: '/budget', icon: Target, keywords: ['plan', 'spending limits'] },
  { id: 'goals', label: 'Goals', href: '/goals', icon: Target, keywords: ['savings', 'save', 'targets'] },
  { id: 'investments', label: 'Investments', href: '/investments', icon: TrendingUp, keywords: ['portfolio', 'stocks', 'trading'] },
  { id: 'crypto', label: 'Crypto', href: '/crypto', icon: Bitcoin, keywords: ['bitcoin', 'digital assets'] },
  { id: 'loans', label: 'Loans', href: '/loans', icon: Landmark, keywords: ['borrow', 'lending'] },
  { id: 'insurance', label: 'Insurance', href: '/insurance', icon: Shield, keywords: ['coverage', 'policy'] },
  { id: 'subscriptions', label: 'Subscriptions', href: '/subscriptions', icon: RefreshCcw, keywords: ['recurring', 'bills'] },
  { id: 'business', label: 'Business', href: '/business', icon: Building2, keywords: ['company', 'work'] },
  { id: 'invoices', label: 'Invoices', href: '/invoices', icon: FileText, keywords: ['billing', 'receivables'] },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: LineChart, keywords: ['reports', 'insights', 'metrics'] },
  { id: 'contacts', label: 'Contacts', href: '/contacts', icon: User, keywords: ['people', 'recipients'] },
  { id: 'messages', label: 'Messages', href: '/messages', icon: MessageSquare, keywords: ['inbox', 'chat'] },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell, keywords: ['alerts', 'updates'] },
  { id: 'currency-converter', label: 'Currency Converter', href: '/currency-converter', icon: RefreshCcw, keywords: ['exchange', 'forex', 'convert'] },
  { id: 'security', label: 'Security', href: '/security', icon: LockKeyhole, keywords: ['privacy', 'protection', 'mfa'] },
  { id: 'profile', label: 'Profile', href: '/profile', icon: User, keywords: ['account', 'personal details'] },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings, keywords: ['preferences', 'configuration'] },
];

function fuzzyMatches(label: string, query: string): boolean {
  let queryIndex = 0;
  const normalizedLabel = label.toLowerCase();

  for (const character of normalizedLabel) {
    if (character === query[queryIndex]) {
      queryIndex += 1;
      if (queryIndex === query.length) return true;
    }
  }

  return false;
}

export function buildCommands(): Command[] {
  const navigate = navigationCommands.map(({ id, label, href, icon, keywords }) => ({
    id: `navigate-${id}`,
    label,
    keywords,
    group: 'Navigate' as const,
    icon,
    run: (ctx: CommandContext) => ctx.router.push(href),
  }));

  const actions: Command[] = [
    {
      id: 'action-send-money',
      label: 'Send money',
      keywords: ['transfer', 'wire', 'move money'],
      group: 'Actions',
      icon: Send,
      run: (ctx) => ctx.router.push('/transfer'),
    },
    {
      id: 'action-pay-someone',
      label: 'Pay someone (P2P)',
      keywords: ['send', 'person', 'peer'],
      group: 'Actions',
      icon: Users,
      run: (ctx) => ctx.router.push('/p2p'),
    },
    {
      id: 'action-add-transaction',
      label: 'Add transaction',
      keywords: ['new', 'expense', 'income'],
      group: 'Actions',
      icon: Receipt,
      run: (ctx) => ctx.router.push('/transactions?action=add'),
    },
    {
      id: 'action-create-savings-goal',
      label: 'Create savings goal',
      keywords: ['new', 'save', 'target'],
      group: 'Actions',
      icon: Target,
      run: (ctx) => ctx.router.push('/goals?action=new'),
    },
  ];

  const preferences: Command[] = [
    {
      id: 'preference-toggle-theme',
      label: 'Toggle dark/light theme',
      keywords: ['appearance', 'mode', 'color'],
      group: 'Preferences',
      icon: Settings,
      run: (ctx) => ctx.toggleTheme(),
    },
    {
      id: 'preference-sign-out',
      label: 'Sign out',
      keywords: ['logout', 'log out'],
      group: 'Preferences',
      icon: User,
      run: (ctx) => {
        void ctx.logout();
      },
    },
  ];

  return [...navigate, ...actions, ...preferences];
}

export function filterCommands(commands: Command[], query: string): Command[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return commands;

  return commands
    .map((command, index) => {
      const label = command.label.toLowerCase();
      const keywords = command.keywords ?? [];
      const hasKeywordMatch = keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));
      let rank: number | null = null;

      if (label.startsWith(normalizedQuery)) {
        rank = 0;
      } else if (label.includes(normalizedQuery)) {
        rank = 1;
      } else if (hasKeywordMatch) {
        rank = 2;
      } else if (fuzzyMatches(label, normalizedQuery)) {
        rank = 3;
      }

      return rank === null ? null : { command, index, rank };
    })
    .filter((entry): entry is { command: Command; index: number; rank: number } => entry !== null)
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map(({ command }) => command);
}
