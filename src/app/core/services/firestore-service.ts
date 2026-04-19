import { Injectable } from '@angular/core';

import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Firestore
} from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class FirestoreService {


  constructor(private firestore: Firestore){

  }
    // crear documento automatico ID
  async add(collectionName: string, data: any){
    const ref = collection(this.firestore, collectionName);
    return await addDoc(ref, data);
  }

  // crear/editar con id especifico
  async set(collectionName: string, id: string, data: any){
    const ref = doc(this.firestore, collectionName, id);
    return await setDoc(ref, data);
  }

  // Obtener todos
  async getAll(collectionName: string){
    const ref = collection(this.firestore, collectionName);
    const snapshot = await getDocs(ref);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  // Actualizar
  async update(collectionName: string, id: string, data: any){
    const ref = doc(this.firestore, collectionName, id);
    return await updateDoc(ref, data);
  }

  // Eliminar
  async delete(collectionName: string, id: string){
    const ref = doc(this.firestore, collectionName, id);
    return await deleteDoc(ref);
  }

}
