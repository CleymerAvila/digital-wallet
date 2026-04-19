

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  lastName: string;
  docType: string;
  docNumber: string;
  country: string;
  phoneNumber: string;
  photoURL: string;
  role: 'user' | 'admin';
  createAt: Date;
  updateAt: Date
}
