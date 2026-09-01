// Mock commercial portal session.
// A shop "signs in" by picking their account and entering the prototype
// passcode. Swap this module for Supabase auth (session + shop membership
// lookup) later — components only use `usePortalSession` and the actions.

import { useSyncExternalStore } from "react";

const KEY = "pbp:portal-shop";
/** Prototype passcode only. Replaced by real shop logins with the backend. */
export const PORTAL_PASSCODE = "shop";

let shopId: string | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    shopId = window.sessionStorage.getItem(KEY);
  } catch {
    shopId = null;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function signIn(id: string) {
  shopId = id;
  try {
    window.sessionStorage.setItem(KEY, id);
  } catch {
    // Session storage unavailable — stay in memory for this page load.
  }
  emit();
}

export function signOut() {
  shopId = null;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Ignore — nothing to clear.
  }
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const snapshot = () => shopId;

export function usePortalSession() {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}
