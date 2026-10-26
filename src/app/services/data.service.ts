import { Injectable } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, updateDoc, Firestore } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserData {
  uid: string;
  email: string;
  plan: 'free' | 'pro';
  credits: number;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private firestore: Firestore;

  constructor() {
    const app = getApps().length ? getApp() : initializeApp(environment.firebase);
    this.firestore = getFirestore(app);
  }

  getUserData(uid: string): Observable<UserData> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return new Observable(observer => {
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          observer.next(docSnap.data() as UserData);
        }
      }, (error) => observer.error(error));
      
      return () => unsubscribe();
    });
  }

  async upgradeUserPlan(uid: string) {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return updateDoc(userDocRef, {
      plan: 'pro',
      credits: 100 // Upgrade gives 100 credits
    });
  }
}
