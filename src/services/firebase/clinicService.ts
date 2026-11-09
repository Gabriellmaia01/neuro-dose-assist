import { ref, push, set, get, remove, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { sendInviteEmail, generateInviteLink } from "@/lib/email";
import type {
  Clinic,
  ClinicMember,
  ClinicInvite,
  ClinicMembership,
  MemberRole,
} from "@/lib/clinics";
import type { IClinicService } from "../contracts/domain.types";

function removeUndefinedFields(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

export class FirebaseClinicService implements IClinicService {
  async createClinic(name: string, userId: string, userEmail: string): Promise<string> {
    try {
      const clinicRef = ref(realtimeDb, `users/${userId}/clinic`);
      const clinicData: Omit<Clinic, "id"> = {
        name,
        ownerId: userId,
        ownerEmail: userEmail,
        members: [
          {
            uid: userId,
            email: userEmail,
            role: "owner",
            joinedAt: new Date().toISOString(),
          },
        ],
        memberUids: {
          [userId]: true,
        },
        createdAt: new Date().toISOString(),
      };

      await set(clinicRef, clinicData);
      return userId;
    } catch (error) {
      console.error("Error creating clinic:", error);
      throw error;
    }
  }

  async getUserClinic(userId: string): Promise<Clinic | null> {
    try {
      const clinicRef = ref(realtimeDb, `users/${userId}/clinic`);
      const clinicSnapshot = await get(clinicRef);

      if (clinicSnapshot.exists()) {
        return {
          id: userId,
          ...clinicSnapshot.val(),
        };
      }

      const membership = await this.getClinicMembership(userId);
      if (membership) {
        const ownerClinicRef = ref(realtimeDb, `users/${membership.clinicOwnerId}/clinic`);
        const ownerSnapshot = await get(ownerClinicRef);
        if (ownerSnapshot.exists()) {
          return {
            id: membership.clinicOwnerId,
            ...ownerSnapshot.val(),
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting user clinic:", error);
      return null;
    }
  }

  async getClinicMembership(userId: string): Promise<ClinicMembership | null> {
    try {
      const membershipRef = ref(realtimeDb, `users/${userId}/clinicMembership`);
      const snapshot = await get(membershipRef);

      if (snapshot.exists()) {
        return snapshot.val() as ClinicMembership;
      }
      return null;
    } catch (error) {
      console.error("Error getting clinic membership:", error);
      return null;
    }
  }

  async getEffectiveUserId(userId: string): Promise<string> {
    try {
      const clinicRef = ref(realtimeDb, `users/${userId}/clinic`);
      const clinicSnapshot = await get(clinicRef);
      if (clinicSnapshot.exists()) {
        return userId;
      }

      const membership = await this.getClinicMembership(userId);
      if (membership) {
        return membership.clinicOwnerId;
      }

      return userId;
    } catch (error) {
      console.error("Error getting effective user ID:", error);
      return userId;
    }
  }

  async updateClinic(clinicId: string, data: Partial<Clinic>): Promise<void> {
    try {
      const clinicRef = ref(realtimeDb, `users/${clinicId}/clinic`);
      const updateData = removeUndefinedFields({
        ...data,
        id: undefined,
        updatedAt: new Date().toISOString(),
      });
      await update(clinicRef, updateData);
    } catch (error) {
      console.error("Error updating clinic:", error);
      throw error;
    }
  }

  async sendClinicInvite(
    clinicId: string,
    clinicName: string,
    email: string,
    role: MemberRole,
    invitedBy: string,
    invitedByName?: string
  ): Promise<{ inviteId: string; emailSent: boolean }> {
    try {
      const invitesRef = ref(realtimeDb, `users/${clinicId}/clinicInvites`);
      const newInviteRef = push(invitesRef);
      const inviteId = newInviteRef.key!;

      const inviteData: Omit<ClinicInvite, "id"> = {
        email: email.toLowerCase(),
        clinicId,
        clinicName,
        role,
        status: "pending",
        invitedBy,
        invitedByName,
        createdAt: new Date().toISOString(),
      };

      await set(newInviteRef, inviteData);

      const inviteLink = generateInviteLink(inviteId, clinicId);
      const emailSent = await sendInviteEmail({
        toEmail: email.toLowerCase(),
        clinicName,
        senderName: invitedByName || "Um usuário",
        role,
        inviteLink,
      });

      return { inviteId, emailSent };
    } catch (error) {
      console.error("Error sending clinic invite:", error);
      throw error;
    }
  }

  async getInviteById(clinicId: string, inviteId: string): Promise<ClinicInvite | null> {
    try {
      const inviteRef = ref(realtimeDb, `users/${clinicId}/clinicInvites/${inviteId}`);
      const snapshot = await get(inviteRef);

      if (snapshot.exists()) {
        return {
          id: inviteId,
          ...snapshot.val(),
        } as ClinicInvite;
      }
      return null;
    } catch (error) {
      console.error("Error getting invite:", error);
      return null;
    }
  }

  async getPendingInvitesFromClinic(clinicId: string, email: string): Promise<ClinicInvite[]> {
    try {
      const invitesRef = ref(realtimeDb, `users/${clinicId}/clinicInvites`);
      const snapshot = await get(invitesRef);

      if (!snapshot.exists()) return [];

      const invitesData = snapshot.val();
      const invites: ClinicInvite[] = [];

      Object.entries(invitesData).forEach(([key, value]) => {
        const invite = value as Omit<ClinicInvite, "id">;
        if (invite.email === email.toLowerCase() && invite.status === "pending") {
          invites.push({ id: key, ...invite });
        }
      });

      return invites;
    } catch (error) {
      console.error("Error getting pending invites:", error);
      return [];
    }
  }

  async acceptClinicInvite(
    inviteId: string,
    clinicId: string,
    userId: string,
    userEmail: string,
    userName?: string
  ): Promise<void> {
    try {
      const inviteRef = ref(realtimeDb, `users/${clinicId}/clinicInvites/${inviteId}`);
      const inviteSnapshot = await get(inviteRef);

      if (!inviteSnapshot.exists()) {
        throw new Error("Convite não encontrado");
      }

      const invite = inviteSnapshot.val() as ClinicInvite;
      if (invite.status !== "pending") {
        throw new Error("Este convite já foi utilizado");
      }

      const clinicRef = ref(realtimeDb, `users/${clinicId}/clinic`);
      const clinicSnapshot = await get(clinicRef);

      if (!clinicSnapshot.exists()) {
        throw new Error("Clínica não encontrada");
      }

      const clinic = clinicSnapshot.val() as Clinic;

      const newMember: ClinicMember = {
        uid: userId,
        email: userEmail.toLowerCase(),
        name: userName || userEmail.split("@")[0],
        role: invite.role,
        joinedAt: new Date().toISOString(),
      };

      const updatedMembers = [...(clinic.members || []), newMember];
      const updatedMemberUids = {
        ...(clinic.memberUids || {}),
        [userId]: true,
      };

      await update(clinicRef, {
        members: updatedMembers,
        memberUids: updatedMemberUids,
        updatedAt: new Date().toISOString(),
      });

      const membershipRef = ref(realtimeDb, `users/${userId}/clinicMembership`);
      const membershipData: ClinicMembership = {
        clinicOwnerId: clinicId,
        clinicName: clinic.name,
        role: invite.role,
        joinedAt: new Date().toISOString(),
      };
      await set(membershipRef, membershipData);
      await update(inviteRef, { status: "accepted" });
    } catch (error) {
      console.error("Error accepting clinic invite:", error);
      throw error;
    }
  }

  async addClinicMember(
    clinicOwnerId: string,
    memberEmail: string,
    memberName: string,
    role: MemberRole
  ): Promise<void> {
    try {
      const clinicRef = ref(realtimeDb, `users/${clinicOwnerId}/clinic`);
      const clinicSnapshot = await get(clinicRef);

      if (!clinicSnapshot.exists()) {
        throw new Error("Clinic not found");
      }

      const clinic = clinicSnapshot.val() as Clinic;
      const newMember: ClinicMember = {
        uid: `member_${Date.now()}`,
        email: memberEmail.toLowerCase(),
        name: memberName,
        role,
        joinedAt: new Date().toISOString(),
      };

      const updatedMembers = [...(clinic.members || []), newMember];
      await update(clinicRef, { members: updatedMembers });
    } catch (error) {
      console.error("Error adding clinic member:", error);
      throw error;
    }
  }

  async removeClinicMember(clinicOwnerId: string, memberUid: string): Promise<void> {
    try {
      const clinicRef = ref(realtimeDb, `users/${clinicOwnerId}/clinic`);
      const clinicSnapshot = await get(clinicRef);

      if (!clinicSnapshot.exists()) {
        throw new Error("Clinic not found");
      }

      const clinic = clinicSnapshot.val() as Clinic;
      const updatedMembers = clinic.members.filter((m) => m.uid !== memberUid);

      const updatedMemberUids = { ...(clinic.memberUids || {}) };
      delete updatedMemberUids[memberUid];

      await update(clinicRef, {
        members: updatedMembers,
        memberUids: updatedMemberUids,
      });

      const membershipRef = ref(realtimeDb, `users/${memberUid}/clinicMembership`);
      await remove(membershipRef);
    } catch (error) {
      console.error("Error removing clinic member:", error);
      throw error;
    }
  }

  async getClinicMembers(clinicOwnerId: string): Promise<ClinicMember[]> {
    try {
      const clinicRef = ref(realtimeDb, `users/${clinicOwnerId}/clinic`);
      const snapshot = await get(clinicRef);

      if (!snapshot.exists()) {
        return [];
      }

      const clinic = snapshot.val() as Clinic;
      return clinic.members || [];
    } catch (error) {
      console.error("Error getting clinic members:", error);
      return [];
    }
  }
}

export const clinicService = new FirebaseClinicService();
