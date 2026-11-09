import { clinicService } from "@/services/firebase/clinicService";

export type MemberRole = "owner" | "admin" | "member";

export interface ClinicMember {
  uid: string;
  email: string;
  name?: string;
  role: MemberRole;
  joinedAt: string;
}

export interface ClinicInvite {
  id?: string;
  email: string;
  clinicId: string;
  clinicName: string;
  role: MemberRole;
  status: "pending" | "accepted" | "rejected";
  invitedBy: string;
  invitedByName?: string;
  createdAt: string;
}

export interface ClinicMembership {
  clinicOwnerId: string;
  clinicName: string;
  role: MemberRole;
  joinedAt: string;
}

export interface Clinic {
  id?: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  members: ClinicMember[];
  memberUids?: Record<string, boolean>;
  createdAt?: string;
  updatedAt?: string;
}

export function createClinic(
  name: string,
  userId: string,
  userEmail: string
): Promise<string> {
  return clinicService.createClinic(name, userId, userEmail);
}

export function getUserClinic(userId: string): Promise<Clinic | null> {
  return clinicService.getUserClinic(userId);
}

export function getClinicMembership(userId: string): Promise<ClinicMembership | null> {
  return clinicService.getClinicMembership(userId);
}

export function getEffectiveUserId(userId: string): Promise<string> {
  return clinicService.getEffectiveUserId(userId);
}

export function updateClinic(
  clinicId: string,
  data: Partial<Clinic>
): Promise<void> {
  return clinicService.updateClinic(clinicId, data);
}

export function sendClinicInvite(
  clinicId: string,
  clinicName: string,
  email: string,
  role: MemberRole,
  invitedBy: string,
  invitedByName?: string
): Promise<{ inviteId: string; emailSent: boolean }> {
  return clinicService.sendClinicInvite(clinicId, clinicName, email, role, invitedBy, invitedByName);
}

export function getInviteById(
  clinicId: string,
  inviteId: string
): Promise<ClinicInvite | null> {
  return clinicService.getInviteById(clinicId, inviteId);
}

export function getPendingInvitesFromClinic(
  clinicId: string,
  email: string
): Promise<ClinicInvite[]> {
  return clinicService.getPendingInvitesFromClinic(clinicId, email);
}

export function acceptClinicInvite(
  inviteId: string,
  clinicId: string,
  userId: string,
  userEmail: string,
  userName?: string
): Promise<void> {
  return clinicService.acceptClinicInvite(inviteId, clinicId, userId, userEmail, userName);
}

export function addClinicMember(
  clinicOwnerId: string,
  memberEmail: string,
  memberName: string,
  role: MemberRole
): Promise<void> {
  return clinicService.addClinicMember(clinicOwnerId, memberEmail, memberName, role);
}

export function removeClinicMember(
  clinicOwnerId: string,
  memberUid: string
): Promise<void> {
  return clinicService.removeClinicMember(clinicOwnerId, memberUid);
}

export function getClinicMembers(clinicOwnerId: string): Promise<ClinicMember[]> {
  return clinicService.getClinicMembers(clinicOwnerId);
}
