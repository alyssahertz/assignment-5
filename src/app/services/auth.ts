import { Injectable, inject, signal } from '@angular/core';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';
import { User } from '../models/user';
import { FirestoreService } from './firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = auth;
  private firestoreService = inject(FirestoreService);

  currentUser = signal<User | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.firestoreService.getUser(firebaseUser.uid);
        this.currentUser.set(user);
      } else {
        this.currentUser.set(null);
      }
    });
  }

  async register(email: string, password: string, name: string): Promise<void> {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    const user: User = {
      uid: result.user.uid,
      email,
      name,
      budgetGoals: { monthly: 0, yearly: 0 }
    };
    await this.firestoreService.saveUser(user);
    await signOut(this.auth);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
    // Wait for onAuthStateChanged to fetch and set the user
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}