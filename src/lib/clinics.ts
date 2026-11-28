import { clinicService } from "@/services/firebase/clinicService";
import { springClinicService } from "@/services/spring/domainServices";
import { isSpringApiEnabled } from "@/services/provider";

const activeService = () => (isSpringApiEnabled() ? springClinicService : clinicService);

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
  return activeService().createClinic(name, userId, userEmail);
}

export function getUserClinic(userId: string): Promise<Clinic | null> {
  return activeService().getUserClinic(userId);
}

export function getClinicMembership(userId: string): Promise<ClinicMembership | null> {
  return activeService().getClinicMembership(userId);
}

export function getEffectiveUserId(userId: string): Promise<string> {
  return activeService().getEffectiveUserId(userId);
}

export function updateClinic(
  clinicId: string,
  data: Partial<Clinic>
): Promise<void> {
  return activeService().updateClinic(clinicId, data);
}

export function sendClinicInvite(
  clinicId: string,
  clinicName: string,
  email: string,
  role: MemberRole,
  invitedBy: string,
  invitedByName?: string
): Promise<{ inviteId: string; emailSent: boolean }> {
  return activeService().sendClinicInvite(clinicId, clinicName, email, role, invitedBy, invitedByName);
}

export function getInviteById(
  clinicId: string,
  inviteId: string
): Promise<ClinicInvite | null> {
  return activeService().getInviteById(clinicId, inviteId);
}

export function getPendingInvitesFromClinic(
  clinicId: string,
  email: string
): Promise<ClinicInvite[]> {
  return activeService().getPendingInvitesFromClinic(clinicId, email);
}

export function getClinicPendingInvites(clinicId: string): Promise<ClinicInvite[]> {
  const service = activeService();
  return service.getClinicPendingInvites ? service.getClinicPendingInvites(clinicId) : Promise.resolve([]);
}

export function getMyPendingInvites(email: string): Promise<ClinicInvite[]> {
  const service = activeService();
  return service.getMyPendingInvites ? service.getMyPendingInvites(email) : Promise.resolve([]);
}

export function acceptClinicInvite(
  inviteId: string,
  clinicId: string,
  userId: string,
  userEmail: string,
  userName?: string
): Promise<void> {
  return activeService().acceptClinicInvite(inviteId, clinicId, userId, userEmail, userName);
}

export function addClinicMember(
  clinicOwnerId: string,
  memberEmail: string,
  memberName: string,
  role: MemberRole
): Promise<void> {
  return activeService().addClinicMember(clinicOwnerId, memberEmail, memberName, role);
}

export function removeClinicMember(
  clinicOwnerId: string,
  memberUid: string
): Promise<void> {
  return activeService().removeClinicMember(clinicOwnerId, memberUid);
}

export function getClinicMembers(clinicOwnerId: string): Promise<ClinicMember[]> {
  return activeService().getClinicMembers(clinicOwnerId);
}
