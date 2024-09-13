'use client';

import { useHotkeys } from 'react-hotkeys-hook';
import { useSidebarStore } from './sidebar-store';
import { useRouter } from 'next/navigation';

export function Hotkeys() {
  const setIsCollapsed = useSidebarStore((state) => state.setIsCollapsed);
  const { push } = useRouter();

  useHotkeys('ctrl+m', () => setIsCollapsed());
  useHotkeys('shift+1', () => push('/strategy-charts'));
  useHotkeys('shift+2', () => push('/casino-411'));
  useHotkeys('shift+3', () => push('/pro-betting-software'));

  return null;
}
