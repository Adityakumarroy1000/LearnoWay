import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";
import { normalizeProfile } from "../utils/profile";
import CustomNav from "@/components/CustomNavbar";
const API_URL = "http://127.0.0.1:8000/api/profile/";

const ProfileSetup = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    occupation: "",
    profileImage: "", // for preview only
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfileData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            bio: data.bio || "",
            occupation: data.occupation || "",
            profileImage: data.profile_image || "",
          });
        } else if (res.status === 401) {
          console.error("Unauthorized: token may be expired or missing");
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // ✅ Keep real file in state, preview with URL.createObjectURL
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setProfileData({
        ...profileData,
        profileImage: URL.createObjectURL(file),
      });
    }
  };

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token. Redirecting to login.");
      navigate("/login");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("first_name", profileData.firstName);
      formData.append("last_name", profileData.lastName);
      formData.append("bio", profileData.bio);
      formData.append("occupation", profileData.occupation);

      if (profileImageFile) {
        formData.append("profile_image", profileImageFile);
      }

      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const normalized = normalizeProfile(data);
        localStorage.setItem("userProfile", JSON.stringify(normalized));
        localStorage.setItem("profileCompleted", "true");
        window.dispatchEvent(new Event("storage"));
        navigate("/dashboard");
      } else if (res.status === 401) {
        console.error("Unauthorized: token expired or invalid");
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        console.error("Profile update failed:", data);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CustomNav />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="text-3xl animate-bounce">🌱</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillSprout
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 animate-fade-in">
              Almost there! Let's set up your profile
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-gray-900 dark:text-white animate-scale-in">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 animate-fade-in">
                Tell us a bit about yourself to personalize your learning
                experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSetup} className="space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 ring-4 ring-blue-500/20 shadow-lg">
                      <AvatarImage src={profileData.profileImage} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Occupation */}
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={profileData.occupation}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Input
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Setting up profile..." : "Complete Setup"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProfileSetup;
