import { AppSlice } from './slices/appSlice';
import { SocketSlice } from './slices/socketSlice';
import { ToastSlice } from './slices/toastSlice';
import { TranslationSlice } from './slices/translationSlice';

// Combine all slice types
export type StoreState = AppSlice & TranslationSlice & ToastSlice & SocketSlice;
