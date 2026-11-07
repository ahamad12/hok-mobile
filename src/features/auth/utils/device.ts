export type DeviceKind = 'phone' | 'tablet' | 'desktop' | 'unknown';

/** Rough device class from a session's user agent / device name. */
export function getDeviceKind(
  userAgent?: string | null,
  deviceName?: string | null,
): DeviceKind {
  const s = `${userAgent ?? ''} ${deviceName ?? ''}`.toLowerCase();
  if (!s.trim()) return 'unknown';
  if (/ipad|tablet|tab\b/.test(s)) return 'tablet';
  if (/iphone|android|mobile|pixel|okhttp|expo|ios/.test(s)) return 'phone';
  if (/windows|macintosh|mac os|linux|x11|cros/.test(s)) return 'desktop';
  return 'unknown';
}

/** Lucide icon name per device class. */
export const deviceIcon: Record<DeviceKind, string> = {
  phone: 'Smartphone',
  tablet: 'Tablet',
  desktop: 'Monitor',
  unknown: 'MonitorSmartphone',
};
