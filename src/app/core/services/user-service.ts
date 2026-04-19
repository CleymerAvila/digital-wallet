import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user-model';
import { FirestoreService } from './firestore-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private readonly COL = 'users';

  constructor(private db: FirestoreService) {}

  create(uid: string, data: Partial<UserProfile>): Promise<void> {

    return this.db.set<UserProfile>(this.COL, uid, {
      uid,
      role: 'user',
      photoURL: '',
      createAt: new Date(),
      updateAt: new Date(),
      ...data
    } as UserProfile);

  }

  async getById(uid: string): Promise<UserProfile | null> {
    return this.db.getById<UserProfile>(this.COL, uid)
  }

  listen$(uid: string): Observable<UserProfile | undefined> {
    return this.db.listen<UserProfile>(this.COL, uid);
  }

  update(uid: string, data: Partial<UserProfile>): Promise<void> {
    return this.db.update<UserProfile>(this.COL, uid, {
      ...data,
      updateAt: new Date()
    })
  }

  delete(uid: string): Promise<void> {
    return this.db.delete(this.COL, uid);
  }
}
