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
  signInAnonymously,
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
import { saveUserLocally } from '../utils/userStore';

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
  resetAdminPassword: () => Promise<string>;
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

        // Cache in localStorage & registry
        saveUserLocally(profile);

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
    const cleanPassword = password.trim();

    // Check if user entered "admin" or "nitish"
    if (trimmed.toLowerCase() === 'admin' || trimmed.toLowerCase() === 'nitish') {
      emailToAuth = MASTER_ADMIN_EMAIL;
    }

    // If identifier is not an email (no '@'), treat as phone number lookup
    if (!emailToAuth.includes('@')) {
      const rawDigits = emailToAuth.replace(/[^0-9]/g, '');
      const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

      try {
        const usersRef = collection(db, 'users');
        // Check 10-digit, raw, and +91
        const q = query(usersRef, where('phone', 'in', [cleanPhone, `+91${cleanPhone}`, trimmed]));
        const querySnap = await getDocs(q);

        if (querySnap.empty) {
          throw new Error('No registered student account was found with this mobile phone number.');
        }
        const foundDoc = querySnap.docs[0].data();
        emailToAuth = foundDoc.email;
      } catch (err: any) {
        if (err.message && err.message.includes('No registered')) {
          throw err;
        }
        handleFirestoreError(err, OperationType.LIST, 'users');
        throw new Error('Could not verify mobile phone number with an existing account.');
      }
    }

    const isMasterEmail = isMasterAdminEmail(emailToAuth);
    const isMasterKey = cleanPassword === 'admin@nk';

    // SPECIAL MASTER ADMIN RECOVERY FLOW:
    // If the master admin forgot their Firebase password, but enters the Master Passcode (admin@nk)
    if (isMasterEmail && isMasterKey) {
      try {
        const cred = await signInWithEmailAndPassword(auth, emailToAuth, cleanPassword);
        const profile = await fetchUserProfile(cred.user.uid, cred.user.email);
        setUserProfile(profile);
        return;
      } catch (masterAuthErr: any) {
        // If account doesn't exist in Firebase Auth yet, auto-create it with admin@nk
        if (
          masterAuthErr.code === 'auth/user-not-found' ||
          masterAuthErr.message?.includes('user-not-found')
        ) {
          try {
            const cred = await createUserWithEmailAndPassword(auth, emailToAuth, 'admin@nk');
            const newAdminProfile: UserProfile = {
              uid: cred.user.uid,
              firstName: 'Er. Nitish',
              lastName: 'Khobragade',
              email: emailToAuth,
              phone: '8982324497',
              altPhone: '',
              dob: '1995-01-01',
              bio: 'Platform Creator & Master Administrator (NTechBay Library)',
              college: 'RGPV Bhopal',
              course: 'B.Tech',
              branch: 'CIVIL',
              photoBase64: '',
              role: 'admin',
              status: 'active',
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', cred.user.uid), newAdminProfile, { merge: true });
            setUserProfile(newAdminProfile);
            return;
          } catch (createErr) {
            console.warn('Auto-create master admin error:', createErr);
          }
        }

        // If the account already exists with a different (forgotten) password:
        // 1. Dispatch password reset link to admin's email so they can set a new permanent password
        try {
          await sendPasswordResetEmail(auth, emailToAuth);
        } catch {}

        // 2. Grant emergency administrator session in state & storage
        const emergencyAdminProfile: UserProfile = {
          uid: 'admin_' + emailToAuth.replace(/[^a-zA-Z0-9]/g, '_'),
          firstName: 'Er. Nitish',
          lastName: 'Khobragade',
          email: emailToAuth,
          phone: '8982324497',
          altPhone: '',
          dob: '1995-01-01',
          bio: 'Platform Creator & Master Administrator (NTechBay Library)',
          college: 'RGPV Bhopal',
          course: 'B.Tech',
          branch: 'CIVIL',
          photoBase64: '',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        // Try anonymous sign-in so Firebase Auth has an active session for Firestore rules
        try {
          await signInAnonymously(auth);
        } catch {}

        setUserProfile(emergencyAdminProfile);
        saveUserLocally(emergencyAdminProfile);
        try {
          sessionStorage.setItem('ntechbay_emergency_admin', 'true');
        } catch {}
        return;
      }
    }

    // Standard authentication with resolved email or Admin Master Password Override
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, emailToAuth, password);
    } catch (authErr: any) {
      // Check if user has an active master password override set by admin or using master admin key
      try {
        const usersRef = collection(db, 'users');
        const qEmail = query(usersRef, where('email', '==', emailToAuth.toLowerCase()));
        const snap = await getDocs(qEmail);

        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const localOverride =
            localStorage.getItem(`ntechbay_password_override_${emailToAuth.toLowerCase()}`) ||
            localStorage.getItem(`ntechbay_password_override_${snap.docs[0].id}`);
          const matchesOverride = Boolean(
            (docData.passwordOverride && docData.passwordOverride === cleanPassword) ||
            (localOverride && localOverride === cleanPassword)
          );
          const isMasterKey = cleanPassword === 'admin@nk';

          if (matchesOverride || isMasterKey) {
            // Provide anonymous or fallback authentication session
            try {
              await signInAnonymously(auth);
            } catch {}

            const profile: UserProfile = {
              uid: snap.docs[0].id,
              firstName: docData.firstName || '',
              lastName: docData.lastName || '',
              email: docData.email || emailToAuth,
              phone: docData.phone || '',
              altPhone: docData.altPhone || '',
              dob: docData.dob || '',
              bio: docData.bio || '',
              college: docData.college || '',
              course: docData.course || 'B.Tech',
              branch: docData.branch || '',
              photoBase64: docData.photoBase64 || '',
              role: (docData.role as UserRole) || 'student',
              status: (docData.status as UserStatus) || 'active',
              createdAt: docData.createdAt || new Date().toISOString(),
            };

            if (profile.status === 'suspended') {
              throw new Error('Your student account has been suspended by the administrator. Please contact support.');
            }

            saveUserLocally(profile);
            setUserProfile(profile);
            return;
          }
        }
      } catch (overrideErr: any) {
        if (overrideErr.message?.includes('suspended')) {
          throw overrideErr;
        }
      }

      // Re-throw standard authentication error if override did not match
      if (authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
        throw new Error('Incorrect password. Please verify your credentials or contact administrator.');
      } else if (authErr.code === 'auth/user-not-found') {
        throw new Error('No registered account found with this email/phone.');
      }
      throw authErr;
    }

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

  /**
   * Register User with Strict Primary Key Uniqueness on BOTH Email and Mobile Phone
   * Neither duplicate email nor duplicate phone can ever be registered.
   */
  const registerUser = async (data: RegisterData): Promise<void> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const rawDigits = data.phone.trim().replace(/[^0-9]/g, '');
    const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

    if (!cleanPhone || cleanPhone.length < 10) {
      throw new Error('Please provide a valid 10-digit mobile phone number.');
    }

    // 1. PRIMARY KEY CHECK: Verify Email Uniqueness in Firestore
    try {
      const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        throw new Error(`The Email ID "${cleanEmail}" is already registered. Each account requires a unique email address.`);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already registered')) {
        throw err;
      }
    }

    // 2. PRIMARY KEY CHECK: Verify Mobile Phone Uniqueness in Firestore (checking standard, +91, and raw)
    try {
      const phoneVariations = [cleanPhone, `+91${cleanPhone}`, `0${cleanPhone}`];
      const phoneQuery = query(collection(db, 'users'), where('phone', 'in', phoneVariations));
      const phoneSnap = await getDocs(phoneQuery);
      if (!phoneSnap.empty) {
        throw new Error(`The Mobile Phone Number "${cleanPhone}" is already registered with an existing student account. Each student must have a unique mobile number.`);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already registered')) {
        throw err;
      }
    }

    // 3. Create Firebase Auth user (enforces unique email natively in Firebase Auth)
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-in-use') {
        throw new Error(`The Email ID "${cleanEmail}" is already registered in Firebase. Please sign in instead.`);
      }
      throw authErr;
    }

    const uid = cred.user.uid;

    // 4. POST-AUTH PRIMARY KEY DOUBLE-CHECK FOR PHONE (runs with authenticated credentials)
    try {
      const postPhoneQuery = query(collection(db, 'users'), where('phone', 'in', [cleanPhone, `+91${cleanPhone}`]));
      const postPhoneSnap = await getDocs(postPhoneQuery);
      const duplicate = postPhoneSnap.docs.find((d) => d.id !== uid);

      if (duplicate) {
        // Rollback: immediately delete the newly created Firebase Auth account
        await cred.user.delete();
        throw new Error(`The Mobile Phone Number "${cleanPhone}" is already registered with another account. Registration rolled back.`);
      }
    } catch (verErr: any) {
      if (verErr.message && verErr.message.includes('already registered')) {
        throw verErr;
      }
    }

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

    // 5. Save record in Firestore users/${uid} and local persistent registry
    saveUserLocally(newProfile);
    setUserProfile(newProfile);

    try {
      await setDoc(doc(db, 'users', uid), newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
      // Even if firestore throws permission error, local registration is preserved
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!auth.currentUser && !userProfile) throw new Error('Not authenticated');
    const uid = auth.currentUser ? auth.currentUser.uid : userProfile!.uid;
    const nextProfile = userProfile ? ({ ...userProfile, ...updates } as UserProfile) : ({ uid, ...updates } as UserProfile);

    setUserProfile(nextProfile);
    saveUserLocally(nextProfile);

    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, updates, { merge: true });
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
   * Send Official Password Reset Link to Master Admin Email
   */
  const resetAdminPassword = async (): Promise<string> => {
    await sendPasswordResetEmail(auth, MASTER_ADMIN_EMAIL);
    return MASTER_ADMIN_EMAIL;
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
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut warning:', err);
    }
    setUser(null);
    setUserProfile(null);
    try {
      sessionStorage.removeItem('ntechbay_emergency_admin');
      sessionStorage.removeItem('ntechbay_admin_auth');
      sessionStorage.removeItem('ntechbay_unlocked');
      localStorage.removeItem('ntechbay_unlocked');
    } catch {}
  };

  const isAdmin = Boolean(
    userProfile?.role === 'admin' ||
    isMasterAdminEmail(user?.email) ||
    (userProfile?.email && isMasterAdminEmail(userProfile.email)) ||
    (typeof window !== 'undefined' && sessionStorage.getItem('ntechbay_admin_auth') === 'true') ||
    (typeof window !== 'undefined' && sessionStorage.getItem('ntechbay_emergency_admin') === 'true')
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
        resetAdminPassword,
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

