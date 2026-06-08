import { AppSlice } from './slices/appSlice';
import { TranslationSlice } from './slices/translationSlice';

// Combine all slice types
export type StoreState = AppSlice & TranslationSlice;
