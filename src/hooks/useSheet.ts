import { useCallback } from 'react';

import { SheetName } from '@/constants/SheetConstants';
import { sheetRegistry } from '@/utils/sheetRegistry';

export const useSheet = () => {
  const open = useCallback((name: SheetName) => sheetRegistry.open(name), []);
  const close = useCallback((name: SheetName) => sheetRegistry.close(name), []);
  return { open, close };
};