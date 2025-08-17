
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Camera, User } from "lucide-react";

const ProfileSetup = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    occupation: "",
    profileImage: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData({
          ...profileData,
          profileImage: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate profile setup - store in localStorage
    setTimeout(() => {
      localStorage.setItem("userProfile", JSON.stringify(profileData));
      localStorage.setItem("profileCompleted", "true");
      setIsLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="text-3xl animate-bounce">🌱</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
              SkillSprout
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Almost there! Let's set up your profile
          </p>
        </div>
        
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm animate-fade-in hover:shadow-2xl transition-all duration-500" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-900 dark:text-white animate-scale-in">Complete Your Profile</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Tell us a bit about yourself to personalize your learning experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSetup} className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="relative group">
                  <Avatar className="w-24 h-24 ring-4 ring-blue-500/20 shadow-lg group-hover:ring-blue-500/40 transition-all duration-300 group-hover:scale-110">
                    <AvatarImage src={profileData.profileImage} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-2 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95">
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
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  Click the camera icon to upload your profile picture
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                  <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    required
                    className="bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                  <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    required
                    className="bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.9s' }}>
                <Label htmlFor="occupation" className="text-gray-700 dark:text-gray-300">Occupation</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  type="text"
                  placeholder="e.g. Student, Developer, Designer"
                  value={profileData.occupation}
                  onChange={handleInputChange}
                  className="bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 focus:scale-[1.02]"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: '1.0s' }}>
                <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Bio (Optional)</Label>
                <Input
                  id="bio"
                  name="bio"
                  type="text"
                  placeholder="Tell us a bit about yourself"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  className="bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 focus:scale-[1.02]"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 animate-fade-in" 
                disabled={isLoading}
                style={{ animationDelay: '1.1s' }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Setting up profile...
                  </span>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
