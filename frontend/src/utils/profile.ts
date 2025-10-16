// frontend/src/utils/profile.ts

export function normalizeProfile(raw: any) {
  return {
    first_name: raw.first_name || "",
    last_name: raw.last_name || "",
    bio: raw.bio || "",
    occupation: raw.occupation || "",
    // ✅ prepend backend base URL so <img> tags work in navbar
    profile_image: raw.profile_image
      ? `http://127.0.0.1:8000${raw.profile_image}`
      : "/default-avatar.png",
  };
}
