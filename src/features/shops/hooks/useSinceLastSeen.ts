import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const GAP_MS = 30 * 60 * 1000;

/** Label for when the user last looked, if it was 30+ minutes ago. */
export function sinceLabel(
  lastSeen: number | null,
  now: number,
): string | null {
  if (lastSeen === null || now - lastSeen < GAP_MS) return null;
  const d = new Date(lastSeen);
  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  const sameDay = new Date(now).toDateString() === d.toDateString();
  return sameDay
    ? `Since ${time}`
    : `Since ${d.toLocaleDateString(undefined, { weekday: 'short' })} ${time}`;
}

/**
 * "Since 6:10 PM" on Today: when this user last saw this shop's Today,
 * kept on the device. Hidden unless they were away 30 minutes or more.
 * Updated when Today opens and when the app goes to the background.
 */
export function useSinceLastSeen(key: string): string | null {
  const [label, setLabel] = useState<string | null>(null);
  const storageKey = `today:lastSeen:${key}`;

  useEffect(() => {
    if (!key) return undefined;
    const stamp = () =>
      AsyncStorage.setItem(storageKey, String(Date.now())).catch(() => {});

    AsyncStorage.getItem(storageKey)
      .then((v) => setLabel(sinceLabel(v ? Number(v) : null, Date.now())))
      .catch(() => {})
      .finally(stamp);

    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') stamp();
    });
    return () => sub.remove();
  }, [key, storageKey]);

  return label;
}
