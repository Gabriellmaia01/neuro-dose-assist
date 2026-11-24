export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface IAuthService {
  signInWithEmail(email: string, password: string): Promise<AuthUser>;
  signUpWithEmail(email: string, password: string): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  getCurrentUser(): AuthUser | null;
}

