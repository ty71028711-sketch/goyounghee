import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyA5uBZG3kHEhGfwjqclqB9mtStu5wZCpMo',
  authDomain:        'imjangmate-5847f.firebaseapp.com',
  projectId:         'imjangmate-5847f',
  storageBucket:     'imjangmate-5847f.firebasestorage.app',
  messagingSenderId: '185747962306',
  appId:             '1:185747962306:web:50fa2b53645df42e333e5b',
  measurementId:     'G-NKWXNJ94W0',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth            = getAuth(app);
export const db              = getFirestore(app);
export const googleProvider  = new GoogleAuthProvider();
export const FIREBASE_APP_ID = firebaseConfig.appId;
