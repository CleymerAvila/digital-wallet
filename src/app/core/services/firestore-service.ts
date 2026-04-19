import { Injectable } from '@angular/core';

import {
  Firestore, collection, doc, addDoc, setDoc, getDoc,getDocs,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  collectionData, docData, QueryConstraint, DocumentData,
  WithFieldValue,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class FirestoreService {


  constructor(private firestore: Firestore){}

  // crear documento automatico ID
  async add<T extends DocumentData>(
    collectionName: string, data: WithFieldValue<T>
  ): Promise<string>{
    const ref = collection(this.firestore, collectionName);
    const docRef = await addDoc(ref, data);
    return docRef.id;
  }

  // crear/editar con id especifico
  async set<T extends DocumentData>(
    collectionName: string,
    id: string,
    data: WithFieldValue<T>
  ): Promise<void>{
    const ref = doc(this.firestore, collectionName, id);
    await setDoc(ref, data);
  }

  // Obtener uno
  async getById<T>(
    collectionName: string,
    id: string
  ): Promise<T | null>{

    const ref = doc(this.firestore, collectionName, id);
    const snap = await getDoc(ref);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
  }

  // Obtener todos
  async getAll<T>(
    collectionName: string,
    ...constraints: QueryConstraint[]
  ): Promise<T[]>{
    const ref = collection(this.firestore, collectionName);
    const q = query(ref, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T))
  }

  // escuchar un documento en tiempo real
  listen<T>(collectionName: string, id: string): Observable<T | undefined> {
    const ref = doc(this.firestore, collectionName, id);
    return docData(ref, {idField : 'id' }) as Observable<T | undefined>;
  }

  // escuchar una collección en tiempo real
  listenAll<T>(
    collectionName: string,
    ...constraints: QueryConstraint[]
  ): Observable<T[]> {
    const ref = collection(this.firestore, collectionName);
    const q = query(ref, ...constraints);
    return collectionData(q, {idField : 'id' }) as Observable<T[]>;
  }

  // Actualizar
  async update<T extends DocumentData>(
    collectionName: string,
    id: string,
    data: Partial<WithFieldValue<T>>
  ): Promise<void>{
    const ref = doc(this.firestore, collectionName, id);
    return await updateDoc(ref, data as DocumentData);
  }

  // Eliminar
  async delete(collectionName: string, id: string): Promise<void>{
    const ref = doc(this.firestore, collectionName, id);
    return await deleteDoc(ref);
  }


  where = where;
  orderBy = orderBy;
  limit = limit;

}
