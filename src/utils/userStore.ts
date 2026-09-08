import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

export const USER_REGISTRY_KEY = 'ntechbay_all_users';

/**
 * Scans localStorage for all saved profiles (including individual ntechbay_profile_* keys and registry)
 */
export function getLocallyStoredUsers(): UserProfile[] {
  const map = new Map<string, UserProfile>();

  // 1. Check ntechbay_all_users
  try {
    const raw = localStorage.getItem(USER_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((u: UserProfile) => {
          if (u && (u.email || u.uid)) {
            const key = (u.email || u.uid).toLowerCase();
            map.set(key, u);
          }
        });
      }
    }
  } catch {}

  // 2. Scan all localStorage keys for ntechbay_profile_
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('ntechbay_profile_')) {
        try {
          const val = localStorage.getItem(k);
          if (val) {
            const u = JSON.parse(val) as UserProfile;
            if (u && (u.email || u.uid) && (u.firstName || u.phone || u.role)) {
              const dedupeKey = (u.email || u.uid).toLowerCase();
              const existing = map.get(dedupeKey);
              if (!existing) {
                map.set(dedupeKey, u);
              } else {
                map.set(dedupeKey, { ...existing, ...u });
              }
            }
          }
        } catch {}
      }
    }
  } catch {}

  return Array.from(map.values());
}

/**
 * Saves or updates a user profile in local registry and individual cache keys
 */
export function saveUserLocally(user: UserProfile): void {
  try {
    localStorage.setItem(`ntechbay_profile_${user.uid}`, JSON.stringify(user));
    if (user.email) {
      localStorage.setItem(`ntechbay_profile_${user.email.toLowerCase()}`, JSON.stringify(user));
    }
    const current = getLocallyStoredUsers();
    const filtered = current.filter(
      (u) => u.uid !== user.uid && u.email?.toLowerCase() !== user.email?.toLowerCase()
    );
    filtered.push(user);
    localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(filtered));
  } catch {}
}

/**
 * Fetches all users by combining Firestore with local storage cache, guaranteeing users are never 0
 * if they were registered in this browser or in Firestore.
 */
export async function fetchAllRegisteredUsers(): Promise<UserProfile[]> {
  const localList = getLocallyStoredUsers();
  const map = new Map<string, UserProfile>();

  // Populate local users first so they are immediately available
  localList.forEach((u) => {
    const key = (u.email || u.uid).toLowerCase();
    map.set(key, u);
  });

  // Query Firestore
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      snap.docs.forEach((d) => {
        const data = d.data() as Omit<UserProfile, 'uid'>;
        const profile: UserProfile = {
          uid: d.id,
          ...data,
        };
        const key = (profile.email || profile.uid).toLowerCase();
        const existing = map.get(key);
        map.set(key, existing ? { ...existing, ...profile } : profile);
      });
    }
  } catch (err) {
    console.warn('Firestore fetch users note (using local cache):', err);
  }

  const combined = Array.from(map.values());

  // Cache back to local registry
  if (combined.length > 0) {
    try {
      localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(combined));
    } catch {}

    // Background sync any local-only user records up to Firestore if missing
    syncMissingUsersToFirestore(combined).catch(() => {});
  }

  return combined;
}

/**
 * Ensures any users that were saved locally are synced to Firestore
 */
export async function syncMissingUsersToFirestore(users: UserProfile[]): Promise<void> {
  for (const user of users) {
    if (!user.uid) continue;
    try {
      await setDoc(doc(db, 'users', user.uid), user, { merge: true });
    } catch {
      // Ignore if offline or permissions pending
    }
  }
}
