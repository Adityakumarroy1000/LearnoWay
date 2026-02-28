import { BACKEND_BASE } from "@/api/config";

export function normalizeProfile(raw: any) {
  const firstName = raw.first_name ?? raw.firstName ?? "";
  const lastName = raw.last_name ?? raw.lastName ?? "";
  const bio = raw.bio ?? "";
  const occupation = raw.occupation ?? "";

  const rawProfileImage = raw.profile_image ?? raw.profileImage ?? "";
  let profileImage = "/default-profile.png";
  if (rawProfileImage) {
    if (String(rawProfileImage).startsWith("http")) {
      profileImage = String(rawProfileImage);
    } else if (String(rawProfileImage).startsWith("/")) {
      profileImage = `${BACKEND_BASE}${rawProfileImage}`;
    } else {
      profileImage = `${BACKEND_BASE}/${rawProfileImage}`;
    }
  }

  return {
    firstName,
    lastName,
    bio,
    occupation,
    profileImage,
    // Backward-compatible keys used in a few places.
    first_name: firstName,
    last_name: lastName,
    profile_image: profileImage,
  };
}
