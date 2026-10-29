import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../data/seedData';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isOwnerOrAdmin: boolean;
  isManagerOrAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Default to the student user Harsh Suryawanshi for instant testing
    const saved = localStorage.getItem('resourceloop_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USERS[0];
      }
    }
    return DEMO_USERS[0];
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync to local storage for persistent role switching during testing
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('resourceloop_active_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setCurrentUser(userSnap.data() as UserProfile);
          } else {
            // New user registration
            const isDefaultAdmin = fbUser.email === 'harshsuryawanshi1976@gmail.com';
            const newUser: UserProfile = {
              id: fbUser.uid,
              displayName: fbUser.displayName || 'Campus Researcher',
              email: fbUser.email || '',
              institutionId: 'inst_coep_tech',
              institutionName: 'COEP Technological University',
              role: isDefaultAdmin ? 'admin' : 'student',
              verificationStatus: 'verified',
              department: 'Engineering',
              completedTrainings: ['Basic Electronics Safety'],
              approvedQualifications: ['Active Student ID'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore, using current state:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      // Reset to default demo student
      setCurrentUser(DEMO_USERS[0]);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Instant role switcher for hackathon judges & presenters
  const switchDemoRole = (role: UserRole) => {
    const matched = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(matched);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), updated, { merge: true });
      } catch (e) {
        console.warn('Could not update Firestore profile:', e);
      }
    }
  };

  const isOwnerOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const isManagerOrAdmin = currentUser?.role === 'manager' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        loginWithGoogle,
        logout,
        switchDemoRole,
        updateProfile,
        isOwnerOrAdmin,
        isManagerOrAdmin,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
