import { BACKEND_BASE } from "@/api/config";

export function normalizeProfile(raw: any) {
  return {
    first_name: raw.first_name || "",
    last_name: raw.last_name || "",
    bio: raw.bio || "",
    occupation: raw.occupation || "",
    profile_image: raw.profile_image
      ? `${BACKEND_BASE}${raw.profile_image}`
      : "/default-avatar.png",
  };
}
