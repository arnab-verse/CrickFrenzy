import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with custom database ID (Mandatory for AI Studio provisioned instance)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Enum and Error Handler as required by Firebase skill
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
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Interfaces for Player Records & Stats
export interface UserPlayerStats {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt?: any;
  updatedAt?: any;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  totalRunsScored: number;
  totalWicketsTaken: number;
  totalFours: number;
  totalSixes: number;
  highestScore: number;
  bestBowling: string;
  totalBallsFaced: number;
}

export interface FirestoreMatchRecord {
  id: string;
  userId: string;
  mode: 'QUICK_MATCH' | 'WORLD_CUP' | 'IPL' | 'PRACTICE';
  teamSelected: string;
  opponentTeam: string;
  userRuns: number;
  userWickets: number;
  userOvers: number;
  target: number;
  opponentRuns: number;
  opponentWickets: number;
  opponentOvers: number;
  result: 'WON' | 'LOST' | 'TIED';
  resultText: string;
  createdAt: any;
}

export interface FirestoreTournamentRecord {
  id: string;
  userId: string;
  type: 'WORLD_CUP' | 'IPL';
  team: string;
  status: 'ONGOING' | 'WON' | 'RUNNER_UP' | 'ELIMINATED';
  matchesPlayed: number;
  wins: number;
  losses: number;
  savedStateJson: string;
  updatedAt: any;
}

// --- HELPER UTILITIES ---
export function isAppInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function openAppInNewTab(): void {
  try {
    const url = window.location.href;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = url;
    }
  } catch (e) {
    console.warn('Could not open new window:', e);
  }
}

// --- AUTH FUNCTIONS ---
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (err: any) {
    const errorCode = err?.code || '';
    if (errorCode === 'auth/network-request-failed') {
      console.warn(
        'Firebase Google Sign-In network request failed. ' +
        'This frequently occurs inside sandboxed iframes or due to third-party cookie restrictions.',
        err?.message
      );
    } else {
      console.warn('Google Sign In failed:', err?.message || err);
    }
    throw err;
  }
}

export async function signInWithGooglePlay() {
  // Google Play sign-in on web utilizes Google Auth Provider with Play Games branding prompt
  return signInWithGoogle();
}

export async function signInWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    await syncUserProfile(result.user);
  }
  return result.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    await syncUserProfile(result.user);
  }
  return result.user;
}

export async function logoutFirebase() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign out error:', err);
  }
}

// --- FIRESTORE DATABASE SYNC & RECORDS HELPERS ---

/**
 * Ensures user document exists in Firestore and updates basic profile fields
 */
export async function syncUserProfile(user: FirebaseUser): Promise<UserPlayerStats> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const initialStats: UserPlayerStats = {
        uid: user.uid,
        displayName: user.displayName || 'Cricket Star',
        email: user.email || '',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        totalRunsScored: 0,
        totalWicketsTaken: 0,
        totalFours: 0,
        totalSixes: 0,
        highestScore: 0,
        bestBowling: '0/0',
        totalBallsFaced: 0,
      };
      await setDoc(userRef, initialStats);
      return initialStats;
    } else {
      const data = snap.data() as UserPlayerStats;
      // Update display name or photo if changed
      await updateDoc(userRef, {
        displayName: user.displayName || data.displayName || 'Cricket Star',
        photoURL: user.photoURL || data.photoURL || '',
        updatedAt: new Date().toISOString(),
      });
      return { ...data, displayName: user.displayName || data.displayName };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    throw error;
  }
}

/**
 * Gets the player stats summary for current user
 */
export async function getPlayerStats(userId: string): Promise<UserPlayerStats | null> {
  const userRef = doc(db, 'users', userId);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserPlayerStats;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    return null;
  }
}

/**
 * Records a completed match in Firestore and updates cumulative stats
 */
export async function recordCompletedMatchInFirestore(
  userId: string,
  matchData: Omit<FirestoreMatchRecord, 'id' | 'userId' | 'createdAt'>
) {
  try {
    const matchId = `match_${Date.now()}`;
    const matchRef = doc(db, 'users', userId, 'matches', matchId);
    
    const fullMatchRecord: FirestoreMatchRecord = {
      ...matchData,
      id: matchId,
      userId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(matchRef, fullMatchRecord);

    // Update cumulative stats on user document
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentStats = userSnap.data() as UserPlayerStats;
      const isWin = matchData.result === 'WON';
      const isLoss = matchData.result === 'LOST';

      const updatedStats: Partial<UserPlayerStats> = {
        matchesPlayed: (currentStats.matchesPlayed || 0) + 1,
        matchesWon: (currentStats.matchesWon || 0) + (isWin ? 1 : 0),
        matchesLost: (currentStats.matchesLost || 0) + (isLoss ? 1 : 0),
        totalRunsScored: (currentStats.totalRunsScored || 0) + (matchData.userRuns || 0),
        totalWicketsTaken: (currentStats.totalWicketsTaken || 0) + (matchData.userWickets || 0),
        highestScore: Math.max(currentStats.highestScore || 0, matchData.userRuns || 0),
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userRef, updatedStats);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/matches`);
  }
}

/**
 * Fetches recent match history records for a user
 */
export async function getUserMatchHistory(userId: string): Promise<FirestoreMatchRecord[]> {
  try {
    const matchesRef = collection(db, 'users', userId, 'matches');
    const q = query(matchesRef, orderBy('createdAt', 'desc'), limit(30));
    const querySnapshot = await getDocs(q);
    
    const records: FirestoreMatchRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      records.push(docSnap.data() as FirestoreMatchRecord);
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/matches`);
    return [];
  }
}

/**
 * Saves/updates ongoing tournament state to Firestore
 */
export async function syncTournamentToFirestore(
  userId: string,
  tournamentData: Omit<FirestoreTournamentRecord, 'userId' | 'updatedAt'>
) {
  try {
    const tourneyRef = doc(db, 'users', userId, 'tournaments', tournamentData.id);
    const fullRecord: FirestoreTournamentRecord = {
      ...tournamentData,
      userId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(tourneyRef, fullRecord);

    // If tournament completed and won, increment tournamentsWon count
    if (tournamentData.status === 'WON') {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const stats = userSnap.data() as UserPlayerStats;
        await updateDoc(userRef, {
          tournamentsWon: (stats.tournamentsWon || 0) + 1,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/tournaments`);
  }
}

/**
 * Fetches all saved tournament states for a user
 */
export async function getUserTournaments(userId: string): Promise<FirestoreTournamentRecord[]> {
  try {
    const tourneysRef = collection(db, 'users', userId, 'tournaments');
    const q = query(tourneysRef, orderBy('updatedAt', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);

    const records: FirestoreTournamentRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      records.push(docSnap.data() as FirestoreTournamentRecord);
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/tournaments`);
    return [];
  }
}
