import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole, UserStatus } from '../types';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone?: string;
  dob: string;
  bio?: string;
  college?: string;
  course?: string;
  branch?: string;
  password: string;
  photoBase64?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmailOrPhone: (identifier: string, password: string) => Promise<void>;
  registerUser: (data: RegisterData) => Promise<void>;
  sendPasswordReset: (identifier: string) => Promise<string>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email designations
export const MASTER_ADMIN_EMAILS = [
  'djnitish97@gmail.com',
  'nitishkhobragade89@gmail.com',
];

export const MASTER_ADMIN_EMAIL = MASTER_ADMIN_EMAILS[0];

export const isMasterAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return MASTER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Configure browserLocalPersistence for persistent session across tabs/restarts
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Failed to enable browser local persistence:', err);
    });
  }, []);

  const fetchUserProfile = async (uid: string, fallbackEmail?: string | null): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const email = data.email || fallbackEmail || '';
        const role: UserRole =
          isMasterAdminEmail(email)
            ? 'admin'
            : (data.role as UserRole) || 'student';

        const profile: UserProfile = {
          uid,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email,
          phone: data.phone || '',
          altPhone: data.altPhone || '',
          dob: data.dob || '',
          bio: data.bio || '',
          college: data.college || '',
          course: data.course || '',
          branch: data.branch || '',
          photoBase64: data.photoBase64 || '',
          role,
          status: (data.status as UserStatus) || 'active',
          createdAt: data.createdAt || new Date().toISOString(),
        };

        // Cache in localStorage
        try {
          localStorage.setItem(`ntechbay_profile_${uid}`, JSON.stringify(profile));
          if (email) localStorage.setItem(`ntechbay_profile_${email.toLowerCase()}`, JSON.stringify(profile));
        } catch {}

        // If role needs elevation to admin for master email, update in background
        if (isMasterAdminEmail(email) && data.role !== 'admin') {
          updateDoc(userRef, { role: 'admin' }).catch(() => {});
        }

        return profile;
      }

      // If document not found by UID, lookup by email (e.g. account created previously or migration)
      if (fallbackEmail) {
        const cleanEmail = fallbackEmail.trim().toLowerCase();
        try {
          const qEmail = query(collection(db, 'users'), where('email', '==', cleanEmail));
          const snapEmail = await getDocs(qEmail);
          if (!snapEmail.empty) {
            const data = snapEmail.docs[0].data();
            const role: UserRole = isMasterAdminEmail(cleanEmail)
              ? 'admin'
              : (data.role as UserRole) || 'student';

            const profile: UserProfile = {
              uid,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: cleanEmail,
              phone: data.phone || '',
              altPhone: data.altPhone || '',
              dob: data.dob || '',
              bio: data.bio || '',
              college: data.college || '',
              course: data.course || '',
              branch: data.branch || '',
              photoBase64: data.photoBase64 || '',
              role,
              status: (data.status as UserStatus) || 'active',
              createdAt: data.createdAt || new Date().toISOString(),
            };

            // Link to uid in Firestore
            await setDoc(userRef, profile, { merge: true });
            try {
              localStorage.setItem(`ntechbay_profile_${uid}`, JSON.stringify(profile));
            } catch {}
            return profile;
          }
        } catch (queryErr) {
          console.warn('Email lookup query error:', queryErr);
        }

        // Check local cache
        try {
          const cached = localStorage.getItem(`ntechbay_profile_${uid}`) || localStorage.getItem(`ntechbay_profile_${cleanEmail}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            const restoredProfile: UserProfile = { ...parsed, uid };
            await setDoc(userRef, restoredProfile, { merge: true }).catch(() => {});
            return restoredProfile;
          }
        } catch {}

        // Minimal clean profile without mock/placeholder data
        const minimalProfile: UserProfile = {
          uid,
          firstName: '',
          lastName: '',
          email: cleanEmail,
          phone: '',
          altPhone: '',
          dob: '',
          bio: '',
          college: '',
          course: 'B.Tech',
          branch: '',
          photoBase64: '',
          role: isMasterAdminEmail(cleanEmail) ? 'admin' : 'student',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        // Persist to Firestore so record is always present in users collection
        await setDoc(userRef, minimalProfile, { merge: true }).catch(() => {});
        try {
          localStorage.setItem(`ntechbay_profile_${uid}`, JSON.stringify(minimalProfile));
          if (cleanEmail) localStorage.setItem(`ntechbay_profile_${cleanEmail}`, JSON.stringify(minimalProfile));
        } catch {}
        return minimalProfile;
      }

      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const profile = await fetchUserProfile(auth.currentUser.uid, auth.currentUser.email);
      setUserProfile(profile);
    }
  };

  // Real-time listener for Auth State AND User Profile Document in Firestore
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);

        // First attempt immediate local cache / fetch to avoid UI flicker
        try {
          const cached = localStorage.getItem(`ntechbay_profile_${currentUser.uid}`);
          if (cached) {
            setUserProfile(JSON.parse(cached));
          }
        } catch {}

        // Attach real-time snapshot listener on users/${uid}
        unsubscribeSnapshot = onSnapshot(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const email = data.email || currentUser.email || '';
              const role: UserRole =
                isMasterAdminEmail(email)
                  ? 'admin'
                  : (data.role as UserRole) || 'student';

              const profile: UserProfile = {
                uid: currentUser.uid,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email,
                phone: data.phone || '',
                altPhone: data.altPhone || '',
                dob: data.dob || '',
                bio: data.bio || '',
                college: data.college || '',
                course: data.course || '',
                branch: data.branch || '',
                photoBase64: data.photoBase64 || '',
                role,
                status: (data.status as UserStatus) || 'active',
                createdAt: data.createdAt || new Date().toISOString(),
              };

              try {
                localStorage.setItem(`ntechbay_profile_${currentUser.uid}`, JSON.stringify(profile));
              } catch {}

              setUserProfile(profile);
            } else {
              // Document does not exist yet in Firestore, auto-initialize and fetch
              fetchUserProfile(currentUser.uid, currentUser.email).then((p) => {
                if (p) setUserProfile(p);
              });
            }
            setLoading(false);
          },
          (err) => {
            console.warn('Real-time profile listener error:', err);
            // Fallback to fetchUserProfile
            fetchUserProfile(currentUser.uid, currentUser.email).then((p) => {
              setUserProfile(p);
              setLoading(false);
            });
          }
        );
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const loginWithEmailOrPhone = async (identifier: string, password: string): Promise<void> => {
    const trimmed = identifier.trim();
    let emailToAuth = trimmed;

    // If identifier is not an email (no '@'), treat as phone number lookup
    if (!trimmed.includes('@')) {
      const cleanPhone = trimmed.replace(/[^0-9+]/g, '');
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', cleanPhone));
        const querySnap = await getDocs(q);

        if (querySnap.empty) {
          const qRaw = query(usersRef, where('phone', '==', trimmed));
          const querySnapRaw = await getDocs(qRaw);

          if (querySnapRaw.empty) {
            throw new Error('No registered account found with this phone number.');
          }
          const foundDoc = querySnapRaw.docs[0].data();
          emailToAuth = foundDoc.email;
        } else {
          const foundDoc = querySnap.docs[0].data();
          emailToAuth = foundDoc.email;
        }
      } catch (err: any) {
        if (err.message && err.message.includes('No registered account')) {
          throw err;
        }
        handleFirestoreError(err, OperationType.LIST, 'users');
        throw new Error('Could not resolve phone number to an account.');
      }
    }

    // Authenticate with resolved email
    const cred = await signInWithEmailAndPassword(auth, emailToAuth, password);

    // Check account status
    const profile = await fetchUserProfile(cred.user.uid, cred.user.email);
    if (profile && profile.status === 'suspended') {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      throw new Error('Your student account has been suspended by the administrator. Please contact support.');
    }
    setUserProfile(profile);
  };

  const registerUser = async (data: RegisterData): Promise<void> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim().replace(/[^0-9+]/g, '');

    // 1. Uniqueness check for email in Firestore (if user signed in or via client lookup)
    try {
      const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        throw new Error('This Email address is already registered. Please sign in or use another email.');
      }

      // 2. Uniqueness check for phone in Firestore
      const phoneQuery = query(collection(db, 'users'), where('phone', '==', cleanPhone));
      const phoneSnap = await getDocs(phoneQuery);
      if (!phoneSnap.empty) {
        throw new Error('This Mobile Phone number is already registered with an existing account.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already registered')) {
        throw err;
      }
      // Silently continue if unauthenticated list permission prevents pre-query
    }

    // 3. Create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
    const uid = cred.user.uid;

    const role: UserRole =
      cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student';

    const newProfile: UserProfile = {
      uid,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      altPhone: data.altPhone ? data.altPhone.trim() : '',
      dob: data.dob ? data.dob.trim() : '',
      bio: data.bio ? data.bio.trim() : '',
      college: data.college ? data.college.trim() : '',
      course: data.course || 'B.Tech',
      branch: data.branch ? data.branch.trim() : '',
      photoBase64: data.photoBase64 || '',
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // 4. Save record in Firestore users/${uid}
    try {
      await setDoc(doc(db, 'users', uid), newProfile);
      try {
        localStorage.setItem(`ntechbay_profile_${uid}`, JSON.stringify(newProfile));
        localStorage.setItem(`ntechbay_profile_${cleanEmail}`, JSON.stringify(newProfile));
      } catch {}
      setUserProfile(newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
      throw new Error('Failed to create user database profile.');
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const uid = auth.currentUser.uid;
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, updates, { merge: true });
      setUserProfile((prev) => {
        const next = prev ? { ...prev, ...updates } : ({ uid, ...updates } as UserProfile);
        if (next) {
          try {
            localStorage.setItem(`ntechbay_profile_${uid}`, JSON.stringify(next));
            if (next.email) {
              localStorage.setItem(`ntechbay_profile_${next.email.toLowerCase()}`, JSON.stringify(next));
            }
          } catch {}
        }
        return next;
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      throw new Error('Failed to update profile.');
    }
  };

  /**
   * Directly change password of authenticated user without creating or mutating any database documents
   */
  const changePassword = async (newPassword: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('You must be signed in to change your password.');
    }
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }
    await updatePassword(auth.currentUser, newPassword);
  };

  /**
   * Password reset: sends official reset email to user, NEVER adds or creates documents in the database
   */
  const sendPasswordReset = async (identifier: string): Promise<string> => {
    const trimmed = identifier.trim();
    let emailToReset = trimmed;

    // If identifier is not an email, lookup user by phone number
    if (!trimmed.includes('@')) {
      const cleanPhone = trimmed.replace(/[^0-9+]/g, '');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', cleanPhone));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        const qRaw = query(usersRef, where('phone', '==', trimmed));
        const querySnapRaw = await getDocs(qRaw);
        if (querySnapRaw.empty) {
          throw new Error('No registered account found with this phone number.');
        }
        emailToReset = querySnapRaw.docs[0].data().email;
      } else {
        emailToReset = querySnap.docs[0].data().email;
      }
    }

    await sendPasswordResetEmail(auth, emailToReset);
    return emailToReset;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const isAdmin = Boolean(
    userProfile?.role === 'admin' ||
    isMasterAdminEmail(user?.email)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        loginWithEmailOrPhone,
        registerUser,
        sendPasswordReset,
        changePassword,
        logout,
        refreshProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

