import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../firebase'; // <-- your initialized Firestore instance

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
}