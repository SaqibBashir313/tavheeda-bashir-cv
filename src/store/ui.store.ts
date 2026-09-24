import { createStore } from '@/store/createStore';

interface UiState {
  isMobileNavOpen: boolean;
  /** Set once the hero intro timeline has played, so it never replays on nav. */
  hasPlayedIntro: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;
  markIntroPlayed: () => void;
}

export const useUiStore = createStore<UiState>('ui', (set) => ({
  isMobileNavOpen: false,
  hasPlayedIntro: false,
  openMobileNav: () => set({ isMobileNavOpen: true }, false, 'ui/openMobileNav'),
  closeMobileNav: () => set({ isMobileNavOpen: false }, false, 'ui/closeMobileNav'),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }, false, 'ui/setMobileNavOpen'),
  markIntroPlayed: () => set({ hasPlayedIntro: true }, false, 'ui/markIntroPlayed'),
}));

/**
 * Atomic selectors, exported alongside the store.
 *
 * Components subscribe to the narrowest slice they need — `useUiStore(selectMobileNavOpen)`
 * re-renders only when that boolean flips, not on every unrelated store write.
 */
export const selectMobileNavOpen = (state: UiState) => state.isMobileNavOpen;
export const selectHasPlayedIntro = (state: UiState) => state.hasPlayedIntro;
