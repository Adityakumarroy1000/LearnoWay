
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, Star, ExternalLink, Play, BookOpen, Globe, List, Zap, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import SkillPathSelector from "@/components/SkillPathSelector";
import ResourceViewer from "@/components/ResourceViewer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SkillDetail = () => {
  const { id } = useParams();
  const [completedResources, setCompletedResources] = useState<string[]>([]);
  const [completedResourceGroups, setCompletedResourceGroups] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [selectedStageResources, setSelectedStageResources] = useState<any[]>([]);
  const [expandedResourceGroups, setExpandedResourceGroups] = useState<string[]>([]);

  // Mock data - in real app this would come from an API
  const getSkillData = (skillId: string) => {
    const skills: Record<string, any> = {
      "1": {
        id: 1,
        title: "Web Development",
        description: "Master the art of building modern, responsive websites and web applications",
        icon: "💻",
        category: "Programming",
        level: "Beginner",
        students: "12.5k",
        duration: "3-6 months",
        rating: 4.8,
        color: "from-blue-500 to-purple-600",
        overview: "This comprehensive web development roadmap will take you from complete beginner to job-ready developer. You'll learn HTML, CSS, JavaScript, and modern frameworks while building real projects.",
        careerOpportunities: [
          "Frontend Developer ($50k-$120k)",
          "Full-Stack Developer ($60k-$140k)",
          "Web Designer ($40k-$90k)",
          "UI/UX Developer ($55k-$130k)"
        ],
        toolsNeeded: ["Code Editor (VS Code)", "Browser (Chrome/Firefox)", "Git", "Node.js"],
        paths: [
          {
            id: "frontend",
            title: "Frontend Development",
            description: "Focus on user interfaces and client-side development",
            duration: "3-4 months",
            difficulty: "Beginner",
            icon: "🎨"
          },
          {
            id: "backend",
            title: "Backend Development",
            description: "Learn server-side programming and databases",
            duration: "4-5 months",
            difficulty: "Intermediate",
            icon: "⚙️"
          },
          {
            id: "fullstack",
            title: "Full-Stack Development",
            description: "Master both frontend and backend development",
            duration: "6-8 months",
            difficulty: "Advanced",
            icon: "🚀"
          }
        ]
      },
      "4": {
        id: 4,
        title: "Guitar Playing",
        description: "Learn to play guitar from beginner to advanced level",
        icon: "🎸",
        category: "Music",
        level: "Beginner",
        students: "4.2k",
        duration: "6-12 months",
        rating: 4.6,
        color: "from-amber-500 to-orange-600",
        overview: "Master the guitar with structured lessons covering everything from basic chords to advanced techniques. Perfect for both acoustic and electric guitar enthusiasts.",
        careerOpportunities: [
          "Session Musician ($30k-$80k)",
          "Music Teacher ($25k-$60k)",
          "Band Member ($20k-$100k+)",
          "Solo Artist (Variable)"
        ],
        toolsNeeded: ["Guitar (Acoustic/Electric)", "Pick", "Tuner", "Amplifier (for electric)"],
        paths: [
          {
            id: "acoustic",
            title: "Acoustic Guitar",
            description: "Learn fingerpicking, strumming, and acoustic techniques",
            duration: "4-6 months",
            difficulty: "Beginner",
            icon: "🎼"
          },
          {
            id: "electric",
            title: "Electric Guitar",
            description: "Master riffs, solos, and electric guitar effects",
            duration: "6-8 months",
            difficulty: "Intermediate",
            icon: "⚡"
          },
          {
            id: "classical",
            title: "Classical Guitar",
            description: "Learn classical techniques and repertoire",
            duration: "8-12 months",
            difficulty: "Advanced",
            icon: "🏛️"
          }
        ]
      },
      "5": {
        id: 5,
        title: "Singing",
        description: "Develop your vocal skills and performance abilities",
        icon: "🎤",
        category: "Music",
        level: "Beginner",
        students: "3.8k",
        duration: "4-8 months",
        rating: 4.7,
        color: "from-pink-500 to-rose-600",
        overview: "Improve your singing voice with professional techniques covering breath control, pitch accuracy, and stage presence.",
        careerOpportunities: [
          "Professional Singer ($25k-$200k+)",
          "Vocal Coach ($30k-$70k)",
          "Choir Director ($35k-$65k)",
          "Voice Actor ($40k-$90k)"
        ],
        toolsNeeded: ["Microphone", "Audio Interface", "Recording Software", "Practice Space"],
        paths: [
          {
            id: "pop",
            title: "Pop/Contemporary",
            description: "Learn modern singing techniques for popular music",
            duration: "3-5 months",
            difficulty: "Beginner",
            icon: "🎵"
          },
          {
            id: "classical",
            title: "Classical/Opera",
            description: "Master classical vocal techniques and repertoire",
            duration: "6-12 months",
            difficulty: "Advanced",
            icon: "🎭"
          },
          {
            id: "jazz",
            title: "Jazz/Blues",
            description: "Learn improvisation and jazz vocal styling",
            duration: "5-8 months",
            difficulty: "Intermediate",
            icon: "🎷"
          }
        ]
      }
    };

    return skills[skillId] || skills["1"]; // Default to web development
  };

  const skill = getSkillData(id || "1");

  const getRoadmapStages = (skillId: string, pathId: string, language: string) => {
    // Web Development roadmaps
    if (skillId === "1") {
      if (pathId === "frontend") {
        return [
          {
            id: "stage1",
            title: "HTML & CSS Fundamentals",
            description: "Learn the foundation of web development",
            duration: "3-4 weeks",
            resourceGroups: [
              {
                id: "html-group",
                title: "HTML Mastery",
                description: "Master HTML with various learning formats",
                resources: [
                  {
                    id: "html-basics-video",
                    title: "HTML Full Course",
                    type: "Video Course",
                    provider: language === "bangla" ? "Programming Hero BD" : language === "hindi" ? "CodeWithHarry" : "FreeCodeCamp",
                    duration: language === "bangla" ? "5 hours" : language === "hindi" ? "6 hours" : "4.5 hours",
                    description: language === "bangla" ? "সম্পূর্ণ HTML টিউটোরিয়াল বাংলায়" : language === "hindi" ? "हिंदी में HTML कोर्स" : "Complete HTML tutorial covering all elements and semantic markup",
                    url: language === "bangla" ? "https://www.youtube.com/watch?v=MdlDb_uJlYs" : language === "hindi" ? "https://www.youtube.com/watch?v=BsDoLVMnmZs" : "https://www.youtube.com/watch?v=pQN-pnXPaVg",
                    difficulty: "Beginner"
                  },
                  {
                    id: "html-basics-playlist",
                    title: "HTML Learning Playlist",
                    type: "Playlist",
                    provider: language === "bangla" ? "Anisul Islam" : language === "hindi" ? "Thapa Technical" : "Traversy Media",
                    duration: language === "bangla" ? "8 videos" : language === "hindi" ? "12 videos" : "10 videos",
                    description: language === "bangla" ? "HTML শেখার জন্য সম্পূর্ণ প্লেলিস্ট" : language === "hindi" ? "HTML सीखने के लिए प्लेलिस्ट" : "Comprehensive HTML playlist for beginners",
                    url: language === "bangla" ? "https://www.youtube.com/playlist?list=PLgH5QX0i9K3qzryglMjcyEktz4q7ySunX" : language === "hindi" ? "https://www.youtube.com/playlist?list=PLwGdqUZWnOp00IbeN0OtL9dmnasipZ9x8" : "https://www.youtube.com/playlist?list=PLillGF-RfqbZTASqIqdvm1R5mLrQq79CU",
                    difficulty: "Beginner"
                  },
                  {
                    id: "html-basics-website",
                    title: "Interactive HTML Tutorial",
                    type: "Website",
                    provider: language === "bangla" ? "W3Schools Bangla" : language === "hindi" ? "TutorialsPoint Hindi" : "W3Schools",
                    duration: "Self-paced",
                    description: language === "bangla" ? "ইন্টারেক্টিভ HTML টিউটোরিয়াল" : language === "hindi" ? "इंटरैक्टिव HTML ट्यूटोरियल" : "Interactive HTML learning with examples",
                    url: "https://www.w3schools.com/html/",
                    difficulty: "Beginner"
                  },
                  {
                    id: "html-oneshot",
                    title: "HTML One-Shot Tutorial",
                    type: "One-Shot",
                    provider: language === "bangla" ? "Stack Learner" : language === "hindi" ? "Code With Harry" : "Web Dev Simplified",
                    duration: language === "bangla" ? "3 hours" : language === "hindi" ? "2.5 hours" : "2 hours",
                    description: language === "bangla" ? "এক ভিডিওতে HTML শিখুন" : language === "hindi" ? "एक वीडियो में HTML सीखें" : "Learn HTML in one comprehensive video",
                    url: language === "bangla" ? "https://www.youtube.com/watch?v=VKb_x83hZfE" : language === "hindi" ? "https://www.youtube.com/watch?v=BsDoLVMnmZs" : "https://www.youtube.com/watch?v=UB1O30fR-EE",
                    difficulty: "Beginner"
                  }
                ]
              },
              {
                id: "css-group",
                title: "CSS Mastery",
                description: "Master CSS styling and layouts",
                resources: [
                  {
                    id: "css-basics-video",
                    title: "CSS Complete Course",
                    type: "Video Course",
                    provider: language === "bangla" ? "Programming Hero BD" : language === "hindi" ? "CodeWithHarry" : "FreeCodeCamp",
                    duration: language === "bangla" ? "8 hours" : language === "hindi" ? "9 hours" : "11 hours",
                    description: language === "bangla" ? "CSS এর সম্পূর্ণ কোর্স বাংলায়" : language === "hindi" ? "हिंदी में CSS कोर्स" : "Master CSS styling, layouts, and responsive design",
                    url: language === "bangla" ? "https://www.youtube.com/watch?v=OXGznpKZ_sA" : language === "hindi" ? "https://www.youtube.com/watch?v=u5-K_ua9sOw" : "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
                    difficulty: "Beginner"
                  },
                  {
                    id: "css-playlist",
                    title: "CSS Learning Playlist",
                    type: "Playlist",
                    provider: language === "bangla" ? "Anisul Islam" : language === "hindi" ? "Thapa Technical" : "Kevin Powell",
                    duration: language === "bangla" ? "15 videos" : language === "hindi" ? "20 videos" : "25 videos",
                    description: language === "bangla" ? "CSS শেখার সম্পূর্ণ প্লেলিস্ট" : language === "hindi" ? "CSS सीखने की प्लेलिस्ट" : "Advanced CSS techniques and best practices",
                    url: language === "bangla" ? "https://www.youtube.com/playlist?list=PLgH5QX0i9K3qjCBXjTmv7Xeh8MDUUVJDO" : language === "hindi" ? "https://www.youtube.com/playlist?list=PLwGdqUZWnOp1j_ynK6N-eXJzWXJfRr0FI" : "https://www.youtube.com/playlist?list=PL4-IK0AVhVjP27yZLwW-gkPggRps0CCnP",
                    difficulty: "Intermediate"
                  },
                  {
                    id: "css-website",
                    title: "CSS Reference Guide",
                    type: "Website",
                    provider: "MDN Web Docs",
                    duration: "Self-paced",
                    description: language === "bangla" ? "CSS রেফারেন্স গাইড" : language === "hindi" ? "CSS रेफरेंस गाइड" : "Complete CSS reference and tutorials",
                    url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
                    difficulty: "All Levels"
                  }
                ]
              }
            ]
          },
          {
            id: "stage2",
            title: "JavaScript Fundamentals",
            description: "Master JavaScript programming basics",
            duration: "4-5 weeks",
            resourceGroups: [
              {
                id: "js-group",
                title: "JavaScript Mastery",
                description: "Learn JavaScript from basics to advanced",
                resources: [
                  {
                    id: "js-basics-video",
                    title: "JavaScript Full Course",
                    type: "Video Course",
                    provider: language === "bangla" ? "Programming Hero BD" : language === "hindi" ? "CodeWithHarry" : "FreeCodeCamp",
                    duration: language === "bangla" ? "10 hours" : language === "hindi" ? "12 hours" : "8 hours",
                    description: language === "bangla" ? "জাভাস্ক্রিপ্ট এর সম্পূর্ণ কোর্স" : language === "hindi" ? "JavaScript का पूरा कोर्स" : "Complete JavaScript course from basics to advanced concepts",
                    url: language === "bangla" ? "https://www.youtube.com/watch?v=rePN-VFo1Eo" : language === "hindi" ? "https://www.youtube.com/watch?v=hKB-YGF14SY" : "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                    difficulty: "Beginner"
                  },
                  {
                    id: "js-playlist",
                    title: "JavaScript Mastery Playlist",
                    type: "Playlist",
                    provider: language === "bangla" ? "Learn with Sumit" : language === "hindi" ? "Chai aur Code" : "JavaScript Mastery",
                    duration: language === "bangla" ? "30 videos" : language === "hindi" ? "35 videos" : "40 videos",
                    description: language === "bangla" ? "জাভাস্ক্রিপ্ট মাস্টারি প্লেলিস্ট" : language === "hindi" ? "JavaScript मास्टरी प्लेलिस्ट" : "Complete JavaScript mastery playlist",
                    url: language === "bangla" ? "https://www.youtube.com/playlist?list=PLHiZ4m8vCp9OkrURufHpGUUTBjBNb-co-" : language === "hindi" ? "https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37" : "https://www.youtube.com/playlist?list=PL0Zuz27SZ-6N3bG4YZhkrCL3ZmDcLTuGd",
                    difficulty: "Intermediate"
                  },
                  {
                    id: "js-website",
                    title: "JavaScript MDN Docs",
                    type: "Website",
                    provider: "Mozilla Developer Network",
                    duration: "Self-paced",
                    description: language === "bangla" ? "জাভাস্ক্রিপ্ট ডকুমেন্টেশন" : language === "hindi" ? "JavaScript डॉक्यूमेंटेशन" : "Official JavaScript documentation and guides",
                    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                    difficulty: "All Levels"
                  },
                  {
                    id: "js-oneshot",
                    title: "JavaScript in One Video",
                    type: "One-Shot",
                    provider: language === "bangla" ? "Stack Learner" : language === "hindi" ? "Chai aur Code" : "Programming with Mosh",
                    duration: language === "bangla" ? "4 hours" : language === "hindi" ? "3.5 hours" : "3 hours",
                    description: language === "bangla" ? "এক ভিডিওতে জাভাস্ক্রিপ্ট" : language === "hindi" ? "एक वीडियो में JavaScript" : "Learn JavaScript fundamentals in one video",
                    url: language === "bangla" ? "https://www.youtube.com/watch?v=rePN-VFo1Eo" : language === "hindi" ? "https://www.youtube.com/watch?v=chx9Rs41W6g" : "https://www.youtube.com/watch?v=hdI2bqOjy3c",
                    difficulty: "Beginner"
                  }
                ]
              }
            ]
          },
          {
            id: "stage3",
            title: "React Development",
            description: "Build dynamic user interfaces with React",
            duration: "6-8 weeks",
            resourceGroups: [
              {
                id: "react-group",
                title: "React Mastery",
                description: "Master React development",
                resources: [
                  {
                    id: "react-basics-video",
                    title: "React Full Course",
                    type: "Video Course",
                    provider: language === "bangla" ? "Programming Hero BD" : language === "hindi" ? "CodeWithHarry" : "FreeCodeCamp",
                    duration: language === "bangla" ? "15 hours" : language === "hindi" ? "14 hours" : "12 hours",
                    description: language === "bangla" ? "React এর সম্পূর্ণ কোর্স বাংলায়" : language === "hindi" ? "React का पूरा कोर्स हिंदी में" : "Complete React tutorial covering components, hooks, and state management",
                    url: language === "bangla" ? "https://www.youtube.com/watch?v=6RhOzQciVwI" : language === "hindi" ? "https://www.youtube.com/watch?v=RGKi6LSPDLU" : "https://www.youtube.com/watch?v=bMknfKXIFA8",
                    difficulty: "Intermediate"
                  },
                  {
                    id: "react-playlist",
                    title: "React Masterclass Playlist",
                    type: "Playlist",
                    provider: language === "bangla" ? "Learn with Sumit" : language === "hindi" ? "Thapa Technical" : "Codevolution",
                    duration: language === "bangla" ? "25 videos" : language === "hindi" ? "30 videos" : "35 videos",
                    description: language === "bangla" ? "React মাস্টারক্লাস প্লেলিস্ট" : language === "hindi" ? "React मास्टारক्लाস प্লেলিস্ট" : "Comprehensive React learning playlist",
                    url: language === "bangla" ? "https://www.youtube.com/playlist?list=PLHiZ4m8vCp9M6HVQv7a36cp8LKzyHIePr" : language === "hindi" ? "https://www.youtube.com/playlist?list=PLwGdqUZWnOp3aROg4wypcRhZqJG3ajZWJ" : "https://www.youtube.com/playlist?list=PLC3y8-rFHvwgg3vaYJgHGnModB54rxOk3",
                    difficulty: "Intermediate"
                  },
                  {
                    id: "react-website",
                    title: "Official React Documentation",
                    type: "Website",
                    provider: "React Team",
                    duration: "Self-paced",
                    description: language === "bangla" ? "অফিসিয়াল React ডকুমেন্টেশন" : language === "hindi" ? "आधिकारिक React डॉक्यूमेंटेशन" : "Official React documentation with interactive examples",
                    url: "https://react.dev/",
                    difficulty: "All Levels"
                  }
                ]
              }
            ]
          }
        ];
      }
      
      if (pathId === "backend") {
        return [
          {
            id: "stage1",
            title: "Node.js Fundamentals",
            description: "Learn server-side JavaScript development",
            duration: "3-4 weeks",
            resourceGroups: [
              {
                id: "nodejs-group",
                title: "Node.js Mastery",
                description: "Master server-side JavaScript",
                resources: [
                  {
                    id: "nodejs-basics",
                    title: "Node.js Full Course",
                    type: "Video Course",
                    provider: "FreeCodeCamp",
                    duration: "8.5 hours",
                    description: "Complete Node.js tutorial covering servers, APIs, and modules",
                    url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
                    difficulty: "Beginner"
                  },
                  {
                    id: "nodejs-crash",
                    title: "Node.js Crash Course",
                    type: "Video Tutorial",
                    provider: "Traversy Media",
                    duration: "1 hour",
                    description: "Quick introduction to Node.js development",
                    url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
                    difficulty: "Beginner"
                  },
                  {
                    id: "express-tutorial",
                    title: "Express.js Tutorial",
                    type: "Video Course",
                    provider: "Programming with Mosh",
                    duration: "1 hour",
                    description: "Learn Express.js framework for building web applications",
                    url: "https://www.youtube.com/watch?v=pKd0Rpw7O48",
                    difficulty: "Beginner"
                  }
                ]
              }
            ]
          },
          {
            id: "stage2",
            title: "Database & APIs",
            description: "Work with databases and create RESTful APIs",
            duration: "4-5 weeks",
            resourceGroups: [
              {
                id: "database-group",
                title: "Database Mastery",
                description: "Learn database operations and API development",
                resources: [
                  {
                    id: "mongodb-tutorial",
                    title: "MongoDB Complete Course",
                    type: "Video Course",
                    provider: "FreeCodeCamp",
                    duration: "7 hours",
                    description: "Learn MongoDB database operations and integration",
                    url: "https://www.youtube.com/watch?v=c2M-rlkkT5o",
                    difficulty: "Intermediate"
                  },
                  {
                    id: "rest-api",
                    title: "REST API Tutorial",
                    type: "Video Course",
                    provider: "Web Dev Simplified",
                    duration: "2.5 hours",
                    description: "Build RESTful APIs with Node.js and Express",
                    url: "https://www.youtube.com/watch?v=fgTGADljAeg",
                    difficulty: "Intermediate"
                  }
                ]
              }
            ]
          }
        ];
      }
    }
    
    // Guitar roadmaps
    if (skillId === "4") {
      if (pathId === "acoustic") {
        return [
          {
            id: "stage1",
            title: "Guitar Basics",
            description: "Learn fundamental guitar techniques",
            duration: "4-6 weeks",
            resourceGroups: [
              {
                id: "guitar-basics-group",
                title: "Guitar Fundamentals",
                description: "Master basic guitar skills",
                resources: [
                  {
                    id: "guitar-setup",
                    title: "Guitar Setup & Tuning",
                    type: "Video Tutorial",
                    provider: "JustinGuitar",
                    duration: "30 mins",
                    description: "Learn proper guitar setup, tuning, and basic maintenance",
                    url: "https://www.youtube.com/watch?v=BnMqAhWNyyM",
                    difficulty: "Beginner"
                  },
                  {
                    id: "first-chords",
                    title: "Your First Guitar Chords",
                    type: "Video Course",
                    provider: "JustinGuitar",
                    duration: "2 hours",
                    description: "Learn essential beginner chords: A, D, E, G, C",
                    url: "https://www.youtube.com/watch?v=NGXSoJPBFJo",
                    difficulty: "Beginner"
                  }
                ]
              }
            ]
          },
          {
            id: "stage2",
            title: "Strumming & Rhythm",
            description: "Master basic strumming patterns and rhythm",
            duration: "3-4 weeks",
            resourceGroups: [
              {
                id: "strumming-group",
                title: "Strumming Mastery",
                description: "Learn essential strumming techniques",
                resources: [
                  {
                    id: "strumming-patterns",
                    title: "Basic Strumming Patterns",
                    type: "Video Tutorial",
                    provider: "GuitarLessons365",
                    duration: "45 mins",
                    description: "Learn essential strumming patterns for popular songs",
                    url: "https://www.youtube.com/watch?v=oXerhAA_5Lk",
                    difficulty: "Beginner"
                  },
                  {
                    id: "rhythm-guitar",
                    title: "Rhythm Guitar Fundamentals",
                    type: "Video Course",
                    provider: "Marty Music",
                    duration: "1.5 hours",
                    description: "Develop timing and rhythm skills for acoustic guitar",
                    url: "https://www.youtube.com/watch?v=v0_PLs4xdwc",
                    difficulty: "Beginner"
                  }
                ]
              }
            ]
          },
          {
            id: "stage3",
            title: "Fingerpicking & Advanced Techniques",
            description: "Learn fingerpicking and advanced acoustic techniques",
            duration: "6-8 weeks",
            resourceGroups: [
              {
                id: "fingerpicking-group",
                title: "Fingerpicking Mastery",
                description: "Master advanced fingerpicking techniques",
                resources: [
                  {
                    id: "fingerpicking-basics",
                    title: "Fingerpicking for Beginners",
                    type: "Video Course",
                    provider: "Steve Stine Guitar",
                    duration: "3 hours",
                    description: "Master fingerpicking technique and patterns",
                    url: "https://www.youtube.com/watch?v=NZWMrm8lDmA",
                    difficulty: "Intermediate"
                  }
                ]
              }
            ]
          }
        ];
      }
    }

    // Singing roadmaps
    if (skillId === "5") {
      if (pathId === "pop") {
        return [
          {
            id: "stage1",
            title: "Vocal Fundamentals",
            description: "Learn proper breathing and vocal technique",
            duration: "3-4 weeks",
            resourceGroups: [
              {
                id: "vocal-basics-group",
                title: "Vocal Fundamentals",
                description: "Master basic vocal techniques",
                resources: [
                  {
                    id: "breathing-technique",
                    title: "Proper Breathing for Singers",
                    type: "Video Tutorial",
                    provider: "Superior Singing Method",
                    duration: "1 hour",
                    description: "Master diaphragmatic breathing and breath support",
                    url: "https://www.youtube.com/watch?v=F6Noi7qzl3E",
                    difficulty: "Beginner"
                  },
                  {
                    id: "vocal-warmups",
                    title: "Daily Vocal Warm-ups",
                    type: "Video Tutorial",
                    provider: "Vocal Coach",
                    duration: "30 mins",
                    description: "Essential warm-up exercises to protect your voice",
                    url: "https://www.youtube.com/watch?v=9c6SzwB0tgg",
                    difficulty: "Beginner"
                  }
                ]
              }
            ]
          },
          {
            id: "stage2",
            title: "Pitch & Tone Development",
            description: "Improve pitch accuracy and vocal tone",
            duration: "4-5 weeks",
            resourceGroups: [
              {
                id: "pitch-group",
                title: "Pitch & Tone Mastery",
                description: "Develop perfect pitch and vocal tone",
                resources: [
                  {
                    id: "pitch-training",
                    title: "Pitch Training Exercises",
                    type: "Video Course",
                    provider: "New York Vocal Coaching",
                    duration: "2 hours",
                    description: "Develop perfect pitch and interval recognition",
                    url: "https://www.youtube.com/watch?v=m-l7TO01-Sg",
                    difficulty: "Intermediate"
                  },
                  {
                    id: "vocal-tone",
                    title: "Finding Your Voice",
                    type: "Video Tutorial",
                    provider: "Cheryl Porter Vocal Coach",
                    duration: "45 mins",
                    description: "Discover and develop your unique vocal tone",
                    url: "https://www.youtube.com/watch?v=R8OOWcsFj0A",
                    difficulty: "Intermediate"
                  }
                ]
              }
            ]
          }
        ];
      }
    }

    // Default empty roadmap
    return [];
  };

  const roadmapStages = selectedPath ? getRoadmapStages(id || "1", selectedPath, selectedLanguage) : [];

  const toggleResourceCompletion = (resourceId: string) => {
    setCompletedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const toggleResourceGroupCompletion = (groupId: string) => {
    setCompletedResourceGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isResourceGroupCompleted = (groupId: string, resources: any[]) => {
    return completedResourceGroups.includes(groupId) || 
           resources.some(resource => completedResources.includes(resource.id));
  };

  const downloadRoadmapPDF = () => {
    // Create PDF download functionality
    const roadmapContent = generateRoadmapContent();
    const blob = new Blob([roadmapContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.title.replace(/\s+/g, '_')}_Roadmap.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateRoadmapContent = () => {
    let content = `${skill.title} Learning Roadmap\n`;
    content += `${'='.repeat(skill.title.length + 17)}\n\n`;
    content += `Description: ${skill.description}\n`;
    content += `Level: ${skill.level}\n`;
    content += `Duration: ${skill.duration}\n`;
    content += `Rating: ${skill.rating}/5\n\n`;

    roadmapStages.forEach((stage, index) => {
      content += `Stage ${index + 1}: ${stage.title}\n`;
      content += `${'-'.repeat(stage.title.length + 10)}\n`;
      content += `Description: ${stage.description}\n`;
      content += `Duration: ${stage.duration}\n\n`;

      if (stage.resourceGroups) {
        stage.resourceGroups.forEach((group: any) => {
          content += `  ${group.title}:\n`;
          content += `  ${group.description}\n\n`;
          group.resources.forEach((resource: any) => {
            content += `    • ${resource.title}\n`;
            content += `      Type: ${resource.type}\n`;
            content += `      Provider: ${resource.provider}\n`;
            content += `      Duration: ${resource.duration}\n`;
            content += `      URL: ${resource.url}\n\n`;
          });
        });
      }
      content += '\n';
    });

    return content;
  };

  const toggleResourceGroup = (groupId: string) => {
    setExpandedResourceGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const openResourceViewer = (resource: any, stageResources: any[]) => {
    setSelectedResource(resource);
    setSelectedStageResources(stageResources);
  };

  const closeResourceViewer = () => {
    setSelectedResource(null);
    setSelectedStageResources([]);
  };

  const getAllResources = () => {
    return roadmapStages.reduce((allResources, stage) => {
      const stageResources = stage.resourceGroups?.reduce((groupResources: any[], group: any) => {
        return [...groupResources, ...group.resources];
      }, []) || [];
      return [...allResources, ...stageResources];
    }, []);
  };

  const totalResources = getAllResources().length;
  const completedCount = completedResources.length;
  const progressPercentage = totalResources > 0 ? (completedCount / totalResources) * 100 : 0;

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "Video Course": return <Play className="w-4 h-4 text-red-500" />;
      case "Playlist": return <List className="w-4 h-4 text-blue-500" />;
      case "Website": return <Globe className="w-4 h-4 text-green-500" />;
      case "One-Shot": return <Zap className="w-4 h-4 text-purple-500" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const handlePathSelect = (pathId: string, language: string) => {
    setSelectedPath(pathId);
    setSelectedLanguage(language);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
  };

  const getLanguageDisplay = (lang: string) => {
    switch (lang) {
      case 'bangla': return 'বাংলা';
      case 'hindi': return 'हिंदी';
      case 'english': return 'English';
      default: return 'English';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl">🌱</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">SkillSprout</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/skills">
                <Button variant="ghost">Browse Skills</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <ThemeToggle />
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Skill Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{skill.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{skill.title}</h1>
                <Badge variant="secondary">{skill.level}</Badge>
                {selectedPath && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {getLanguageDisplay(selectedLanguage)}
                  </Badge>
                )}
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{skill.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Users className="w-5 h-5" />
                  <span>{skill.students} students</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="w-5 h-5" />
                  <span>{skill.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span>{skill.rating} rating</span>
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{skill.category}</span>
                </div>
              </div>
              
              {selectedPath && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <span>Progress</span>
                      <span>{completedCount} / {totalResources} completed</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  <Button size="lg" onClick={downloadRoadmapPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Roadmap
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {!selectedPath ? (
          <SkillPathSelector
            skillTitle={skill.title}
            paths={skill.paths}
            onPathSelect={handlePathSelect}
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Roadmap */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Roadmap</h2>
                <Button variant="outline" onClick={() => setSelectedPath(null)}>
                  Change Path
                </Button>
                
                {/* Language Selector */}
                <div className="flex items-center gap-2 ml-auto">
                  <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="bangla">বাংলা</SelectItem>
                      <SelectItem value="hindi">हिंदी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {roadmapStages.map((stage, stageIndex) => (
                <Card key={stage.id} className="overflow-hidden dark:bg-gray-800">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {stageIndex + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl dark:text-white">{stage.title}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          {stage.description} • {stage.duration}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {stage.resourceGroups?.map((group: any) => (
                        <div key={group.id} className="border dark:border-gray-700 rounded-lg">
                          <button
                            onClick={() => toggleResourceGroup(group.id)}
                            className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleResourceGroupCompletion(group.id);
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isResourceGroupCompleted(group.id, group.resources)
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'border-gray-300 hover:border-green-400'
                                  }`}
                                >
                                  {isResourceGroupCompleted(group.id, group.resources) && (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </button>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{group.title}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{group.description}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {group.resources.length} resources available
                                  </p>
                                </div>
                              </div>
                              <div className={`transform transition-transform ${
                                expandedResourceGroups.includes(group.id) ? 'rotate-180' : ''
                              }`}>
                                ▼
                              </div>
                            </div>
                          </button>
                          
                          {expandedResourceGroups.includes(group.id) && (
                            <div className="border-t dark:border-gray-700 p-4 space-y-3">
                              {group.resources.map((resource: any) => (
                                <div key={resource.id} className="border dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getResourceIcon(resource.type)}
                                        <h5 className="font-semibold text-gray-900 dark:text-white">{resource.title}</h5>
                                        <Badge variant="outline" className="text-xs">
                                          {resource.type}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {resource.difficulty}
                                        </Badge>
                                      </div>
                                      <p className="text-gray-600 dark:text-gray-300 mb-2">{resource.description}</p>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                          <span>By {resource.provider}</span>
                                          <span>{resource.duration}</span>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button 
                                            variant="default" 
                                            size="sm"
                                            onClick={() => openResourceViewer(resource, group.resources)}
                                          >
                                            <Play className="w-4 h-4 mr-1" />
                                            Watch
                                          </Button>
                                          <Button variant="outline" size="sm" asChild>
                                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                              <ExternalLink className="w-4 h-4 mr-1" />
                                              External
                                            </a>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Overview */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">About This Skill</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{skill.overview}</p>
                </CardContent>
              </Card>

              {/* Career Opportunities */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Career Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skill.careerOpportunities.map((career: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{career}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tools Needed */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Tools You'll Need</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skill.toolsNeeded.map((tool: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{tool}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <ResourceViewer
          resource={selectedResource}
          allResources={selectedStageResources}
          onClose={closeResourceViewer}
          onResourceChange={setSelectedResource}
        />
      )}
    </div>
  );
};

export default SkillDetail;
