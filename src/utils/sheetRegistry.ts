import { SheetName } from '@/constants/SheetConstants';

type SheetControls = {
  open: () => void;
  close: () => void;
};

const registry = new Map<SheetName, SheetControls>();
const backStack = new Map<SheetName, SheetName>();
const navigating = new Set<SheetName>();

export const sheetRegistry = {
  register(name: SheetName, controls: SheetControls) {
    registry.set(name, controls);
  },
  unregister(name: SheetName) {
    registry.delete(name);
  },
  open(name: SheetName) {
    registry.get(name)?.open();
  },
  close(name: SheetName) {
    registry.get(name)?.close();
  },
  navigate(from: SheetName, to: SheetName) {
    navigating.add(from);
    backStack.set(to, from);
    registry.get(from)?.close();
    navigating.delete(from);
    setTimeout(() => registry.get(to)?.open(), 80);
  },
  notifyDismissed(name: SheetName) {
    if (navigating.has(name)) return;
    const parent = backStack.get(name);
    if (parent) {
      backStack.delete(name);
      registry.get(parent)?.open();
    }
  },
};
