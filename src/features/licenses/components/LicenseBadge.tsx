import React from 'react';

import { Badge } from '@/components/Badge';

import { License } from '../api/licenses.types';

/** Expired / N days left / Valid, from the server's computed flags. */
export function LicenseBadge({ license: l }: { license: License }) {
  if (!l.isActive) return <Badge label='Inactive' />;
  if (l.isExpired) return <Badge label='Expired' tone='error' />;
  if (l.isExpiringSoon)
    return <Badge label={`${l.daysRemaining} days left`} tone='warning' />;
  if (l.daysRemaining === null) return <Badge label='No dates' />;
  return <Badge label='Valid' tone='success' />;
}
