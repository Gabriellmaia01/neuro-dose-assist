export * from "./contracts";
export {
  FirebaseAuthService,
  patientService,
  medicationService,
  doseService,
  appointmentService,
  noteService,
  clinicService,
  activityLogService,
  userSettingsService,
} from "./firebase";

import type { IAuthService } from "./contracts";
import { authService as firebaseAuthService } from "./firebase/authService";
import { sandboxAuthService } from "./sandbox/sandboxAuthService";

const isSandboxMode =
  String(import.meta.env.VITE_SANDBOX_MODE || "").trim().toLowerCase() === "true";

export const authService: IAuthService = isSandboxMode
  ? sandboxAuthService
  : firebaseAuthService;
