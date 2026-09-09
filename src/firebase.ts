/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import rawFirebaseConfig from '../firebase-applet-config.json';

export const defaultFirebaseConfig = {
  apiKey: "AIzaSyA9PCZTQSPeStjVIA_5WJeYNyBoUalMOvY",
  authDomain: "ntechbay-library.firebaseapp.com",
  databaseURL: "https://ntechbay-library-default-rtdb.firebaseio.com",
  projectId: "ntechbay-library",
  storageBucket: "ntechbay-library.firebasestorage.app",
  messagingSenderId: "300453746922",
  appId: "1:300453746922:web:7a3b26f585d4579f955f93",
  measurementId: "G-CFCBJ62WD3",
};

const activeConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawFirebaseConfig.apiKey || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawFirebaseConfig.authDomain || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawFirebaseConfig.projectId || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawFirebaseConfig.storageBucket || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawFirebaseConfig.messagingSenderId || defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawFirebaseConfig.appId || defaultFirebaseConfig.appId,
  databaseURL: (rawFirebaseConfig as Record<string, string | undefined>).databaseURL || defaultFirebaseConfig.databaseURL,
};

const app = initializeApp(activeConfig);

// Resilient Firestore initialization:
// - experimentalForceLongPolling: true guarantees connection through preview iframes and corporate proxies
// - persistentLocalCache with multi-tab manager enables seamless offline caching and instant reads
const customDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || rawFirebaseConfig.firestoreDatabaseId;

export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  },
  customDbId && customDbId !== '(default)' ? customDbId : undefined
);

export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);

  const isPermissionError =
    errMessage.includes('Missing or insufficient permissions') ||
    errMessage.includes('permission-denied') ||
    (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'permission-denied');

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };

  if (isPermissionError) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    return new Error(JSON.stringify(errInfo));
  } else {
    console.warn(`Firestore ${operationType} notice on ${path || 'unknown'}:`, errMessage);
    return error instanceof Error ? error : new Error(errMessage);
  }
}

