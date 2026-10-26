import { Injectable } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$: Observable<User | null>;
  private userSubject = new BehaviorSubject<User | null>(null);
  private auth: Auth;

  constructor() {
    const app = getApps().length ? getApp() : initializeApp(environment.firebase);
    this.auth = getAuth(app);
    this.user$ = this.userSubject.asObservable();
    
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  async login({ email, password }: any) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  async register({ email, password }: any) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  logout() {
    return signOut(this.auth);
  }
}
