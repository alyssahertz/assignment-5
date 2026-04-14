import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../firebase'; // <-- your initialized Firestore instance
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class FirestoreService {

  getCollection<T>(path: string): Observable<T[]> {
    return new Observable((observer) => {
      const ref = collection(db, path);

      const unsubscribe = onSnapshot(ref, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];

        observer.next(data);
      });

      return unsubscribe;
    });
  }

  addItem(path: string, data: any) {
    const ref = collection(db, path);
    return addDoc(ref, data);
  }

  updateItem(path: string, id: string, data: any) {
    const ref = doc(db, path, id);
    return updateDoc(ref, data);
  }

  deleteItem(path: string, id: string) {
    const ref = doc(db, path, id);
    return deleteDoc(ref);
  }

  async getUser(uid: string): Promise<User> {
    const ref = doc(db, 'users', uid);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      return { uid, ...snapshot.data() } as User;
    } else {
      throw new Error('User not found');
    }
  }

  async saveUser(user: User): Promise<void> {
    const ref = doc(db, 'users', user.uid);
    const { uid, ...data } = user;
    await setDoc(ref, data);
  }
}