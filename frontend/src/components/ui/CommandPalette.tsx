'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { buildCommands, filterCommands, type Command } from '@/lib/commands';
import Portal from './Portal';

const commandGroups: Command['group'][] = ['Navigate', 'Actions', 'Preferences'];

export default function CommandPalette() {
  const router = useRouter();
  const { logout } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commands = useMemo(() => buildCommands(), []);
  const filteredCommands = useMemo(() => {
    const ranked = filterCommands(commands, query);
    return commandGroups.flatMap((group) => ranked.filter((command) => command.group === group));
  }, [commands, query]);

  const openPalette = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    setIsOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setIsOpen(false);
  }, []);

  const runCommand = useCallback((command: Command) => {
    command.run({
      router,
      logout,
      toggleTheme: () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      },
    });
    closePalette();
  }, [closePalette, logout, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isOpen) {
          closePalette();
        } else {
          openPalette();
        }
        return;
      }

      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closePalette();
      } else if (event.key === 'ArrowDown' && filteredCommands.length > 0) {
        event.preventDefault();
        setSelectedIndex((index) => (index + 1) % filteredCommands.length);
      } else if (event.key === 'ArrowUp' && filteredCommands.length > 0) {
        event.preventDefault();
        setSelectedIndex((index) => (index - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
        event.preventDefault();
        runCommand(filteredCommands[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closePalette, filteredCommands, isOpen, openPalette, runCommand, selectedIndex]);

  useEffect(() => {
    const handleOpen = () => openPalette();
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, [openPalette]);

  useEffect(() => {
    if (!isOpen) return;
    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(focusFrame);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePalette}
            />
            <motion.div
              className="fixed inset-0 flex items-start justify-center p-4 pt-[15vh] z-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePalette}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
                className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--glass-border-prominent)] bg-[rgba(var(--glass-rgb),var(--glass-alpha-high))] shadow-2xl backdrop-blur-2xl"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center gap-3 border-b border-[var(--border-1)] px-4">
                  <Search size={20} className="flex-shrink-0 text-[var(--text-2)]" aria-hidden="true" />
                  <input
                    ref={inputRef}
                    role="combobox"
                    aria-label="Search commands"
                    aria-controls="command-palette-results"
                    aria-expanded="true"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Type a command or search pages…"
                    className="h-14 min-w-0 flex-1 bg-transparent text-[var(--text-1)] outline-none placeholder:text-[var(--text-2)]"
                  />
                </div>

                <div id="command-palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
                  {filteredCommands.length === 0 ? (
                    <p className="px-3 py-10 text-center text-sm text-[var(--text-2)]">
                      No results for “{query}”
                    </p>
                  ) : (
                    commandGroups.map((group) => {
                      const groupCommands = filteredCommands.filter((command) => command.group === group);
                      if (groupCommands.length === 0) return null;

                      return (
                        <div key={group}>
                          <h2 className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-2)]">
                            {group}
                          </h2>
                          {groupCommands.map((command) => {
                            const commandIndex = filteredCommands.indexOf(command);
                            const Icon = command.icon;
                            return (
                              <button
                                key={command.id}
                                type="button"
                                role="option"
                                aria-selected={commandIndex === selectedIndex}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                  commandIndex === selectedIndex
                                    ? 'bg-[rgba(var(--primary-blue),0.25)] text-[var(--text-1)] ring-1 ring-[rgba(var(--primary-blue),0.4)]'
                                    : 'text-[var(--text-2)] hover:bg-[rgba(var(--glass-rgb),0.2)] hover:text-[var(--text-1)]'
                                }`}
                                onMouseEnter={() => setSelectedIndex(commandIndex)}
                                onClick={() => runCommand(command)}
                              >
                                <Icon size={18} className="flex-shrink-0" aria-hidden="true" />
                                <span className="min-w-0 flex-1 truncate">{command.label}</span>
                                {command.shortcut && (
                                  <kbd className="rounded border border-[var(--border-1)] px-1.5 py-0.5 text-xs text-[var(--text-2)]">
                                    {command.shortcut}
                                  </kbd>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-[var(--border-1)] px-4 py-2 text-xs text-[var(--text-2)]">
                  ↑↓ navigate · ↵ select · esc close
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}
