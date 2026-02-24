import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Play, Clock, BookOpen } from "lucide-react";

interface Resource {
  id?: string;
  link_type?: string;
  link?: string;
  title?: string;
  provider?: string;
  duration?: string;
  description?: string;
}

interface ResourceViewerProps {
  resource: Resource;
  allResources: Resource[];
  onClose: () => void;
  onResourceChange: (resource: Resource) => void;
}

const ResourceViewer = ({
  resource,
  allResources,
  onClose,
  onResourceChange,
}: ResourceViewerProps) => {
  const [currentResource, setCurrentResource] = useState<Resource>(resource);
  const [websiteContent, setWebsiteContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  const fetchWebsiteContent = async (url?: string) => {
    if (!url) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setWebsiteContent(`
        <div class="tutorial-content">
          <div class="tutorial-header">
            <h1>${currentResource.title || currentResource.link_type}</h1>
            <div class="tutorial-meta">
              <span class="difficulty-badge">Dynamic Resource</span>
              <span class="duration">Interactive</span>
            </div>
          </div>
          <div class="tutorial-section">
            <h2>Overview</h2>
            <p>This is a dynamically loaded resource from your skill roadmap.</p>
            <p>It was fetched directly from your Django API and displayed using React.</p>
          </div>
          <div class="tutorial-section">
            <h2>Resource Link</h2>
            <p><a href="${url}" target="_blank">${url}</a></p>
          </div>
        </div>
      `);
    } catch (error) {
      console.error("Error fetching website content:", error);
      setWebsiteContent("<p>Error loading content. Please try again.</p>");
    } finally {
      setIsLoading(false);
    }
  };

  const embedUrl = getEmbedUrl(currentResource.link);
  const isWebsite = currentResource.link_type === "Web-Docs";

  const handleResourceSelect = (selectedResource: Resource) => {
    setCurrentResource(selectedResource);
    onResourceChange(selectedResource);
    setWebsiteContent(null);
  };

  const handleReadClick = () => {
    if (isWebsite) {
      fetchWebsiteContent(currentResource.link);
    }
  };

  useEffect(() => {
    setCurrentResource(resource);
    setWebsiteContent(null);
  }, [resource]);

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-0 sm:p-3">
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl w-screen h-screen sm:w-[95vw] sm:h-[92vh] max-w-6xl overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b dark:border-gray-700">
          <h2 className="text-base sm:text-xl font-bold dark:text-white truncate pr-2">
            Learning Resources
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* Left: Main Viewer */}
          <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto min-w-0">
            <Card className="mb-4">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start sm:items-center gap-2 mb-2 flex-wrap">
                  {isWebsite ? (
                    <BookOpen className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  <CardTitle className="text-base sm:text-lg dark:text-white break-words">
                    {currentResource.title || currentResource.link_type}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    {currentResource.link_type}
                  </Badge>
                </div>
                {currentResource.duration && (
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{currentResource.duration}</span>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {isWebsite && websiteContent ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 max-h-[45vh] sm:max-h-[55vh] overflow-y-auto">
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: websiteContent }}
                    />
                  </div>
                ) : embedUrl ? (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <iframe
                      src={embedUrl}
                      title={currentResource.title || currentResource.link_type}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center p-3">
                    <Button onClick={handleReadClick} disabled={isLoading} className="w-full sm:w-auto">
                      {isLoading ? "Loading..." : "Read"}
                    </Button>
                  </div>
                )}

                {currentResource.link && (
                  <div className="mt-3">
                    <Button variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm">
                      <a href={currentResource.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Original Link
                      </a>
                    </Button>
                  </div>
                )}

                {currentResource.description && (
                  <p className="text-gray-700 dark:text-gray-300 mt-4 text-sm sm:text-base break-words">
                    {currentResource.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Resource List */}
          <div className="w-full lg:w-80 p-3 sm:p-4 lg:p-6 overflow-auto border-t lg:border-t-0 lg:border-l dark:border-gray-700 max-h-[38vh] sm:max-h-[34vh] lg:max-h-none">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 dark:text-white">
              All Resources
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {allResources.map((res, idx) => (
                <Card
                  key={res.id || idx}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentResource.id === res.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleResourceSelect(res)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2">
                      {res.link_type === "Web-Docs" ? (
                        <BookOpen className="w-4 h-4 mt-1 flex-shrink-0" />
                      ) : (
                        <Play className="w-4 h-4 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm dark:text-white break-words">
                          {res.title || res.link_type}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {res.link}
                        </p>
                        <Badge variant="outline" className="text-[10px] sm:text-xs mt-1">
                          {res.link_type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceViewer;
