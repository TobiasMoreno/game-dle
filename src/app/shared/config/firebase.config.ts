import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDL-ofJeMYeESQovVBIhBxgJXkQNE-EY9Y',
  authDomain: 'game-dle.firebaseapp.com',
  projectId: 'game-dle',
  storageBucket: 'game-dle.firebasestorage.app',
  messagingSenderId: '931003483104',
  appId: '1:931003483104:web:bc3b1f279d661aa67a2185',
  measurementId: 'G-NJFYNQTEEG',
  databaseURL: 'https://game-dle-default-rtdb.firebaseio.com',
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);

export function getFirebaseDatabase() {
  assertFirebaseConfigured();
  return getDatabase(firebaseApp, firebaseConfig.databaseURL);
}

export function assertFirebaseConfigured(): void {
  const missingValues = Object.entries(firebaseConfig)
    .filter(([, value]) => value.startsWith('REEMPLAZAR_'))
    .map(([key]) => key);

  if (missingValues.length) {
    throw new Error(
      `Falta configurar Firebase: ${missingValues.join(', ')}. ` +
      'Completa src/app/shared/config/firebase.config.ts.'
    );
  }
}
