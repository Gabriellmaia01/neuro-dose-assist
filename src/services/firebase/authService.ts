import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import type { AuthUser, IAuthService } from "../contracts/auth.types";

function mapFirebaseUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export class FirebaseAuthService implements IAuthService {
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const mapped = mapFirebaseUser(credential.user);
    if (!mapped) throw new Error("Falha ao mapear usuário após login.");
    return mapped;
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const mapped = mapFirebaseUser(credential.user);
    if (!mapped) throw new Error("Falha ao mapear usuário após cadastro.");
    return mapped;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const credential = await signInWithPopup(auth, googleProvider);
    const mapped = mapFirebaseUser(credential.user);
    if (!mapped) throw new Error("Falha ao mapear usuário após login com Google.");
    return mapped;
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("Usuário não autenticado");
    }
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  }

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      callback(mapFirebaseUser(user));
    });
  }

  getCurrentUser(): AuthUser | null {
    return mapFirebaseUser(auth.currentUser);
  }
}

export const authService = new FirebaseAuthService();

