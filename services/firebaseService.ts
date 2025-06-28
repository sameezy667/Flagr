import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  UserCredential,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { User } from "../types";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByTrJYHTy75Ys3OlfG7v6bfJNG1FSdWCg",
  authDomain: "flagr-736e5.firebaseapp.com",
  projectId: "flagr-736e5",
  storageBucket: "flagr-736e5.firebasestorage.app",
  messagingSenderId: "314209547178",
  appId: "1:314209547178:web:ff388ededf467a5ed7b1d3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Convert Firebase user to app User
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  const email = firebaseUser.email || 'user@flagr.ai';
  const username = email.split('@')[0];
  
  return {
    id: firebaseUser.uid,
    username: username,
    email: email,
    avatarUrl: `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${username}`
  };
};

// Authentication functions
export const firebaseService = {
  // Sign up with email and password
  signUp: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return mapFirebaseUserToUser(userCredential.user);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up');
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return mapFirebaseUserToUser(userCredential.user);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  // Get current user
  getCurrentUser: (): Promise<User | null> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          resolve(mapFirebaseUserToUser(firebaseUser));
        } else {
          resolve(null);
        }
      });
    });
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void): () => void => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(mapFirebaseUserToUser(firebaseUser));
      } else {
        callback(null);
      }
    });
  }
}; 