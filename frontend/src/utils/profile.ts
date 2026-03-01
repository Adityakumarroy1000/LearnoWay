import { BACKEND_BASE } from "@/api/config";

const isLikelyBrokenCloudinaryUrl = (url: string) =>
  url.includes("res.cloudinary.com") && url.includes("/media/profiles/");

export function normalizeProfile(raw: any) {
  const username = raw.username ?? "";
  const email = raw.email ?? raw.emailAddress ?? "";
  const firstName = raw.first_name ?? raw.firstName ?? "";
  const lastName = raw.last_name ?? raw.lastName ?? "";
  const bio = raw.bio ?? "";
  const occupation = raw.occupation ?? "";

  const rawProfileImage = raw.profile_image ?? raw.profileImage ?? "";
  let profileImage = "/default-profile.png";
  if (rawProfileImage) {
    if (String(rawProfileImage).startsWith("http")) {
      const absoluteUrl = String(rawProfileImage);
      profileImage = isLikelyBrokenCloudinaryUrl(absoluteUrl)
        ? "/default-profile.png"
        : absoluteUrl;
    } else if (String(rawProfileImage).startsWith("/")) {
      profileImage = `${BACKEND_BASE}${rawProfileImage}`;
    } else {
      profileImage = `${BACKEND_BASE}/${rawProfileImage}`;
    }
  }

  return {
    username,
    email,
    firstName,
    lastName,
    bio,
    occupation,
    profileImage,
    // Backward-compatible keys used in a few places.
    first_name: firstName,
    last_name: lastName,
    profile_image: profileImage,
    emailAddress: email,
  };
}
