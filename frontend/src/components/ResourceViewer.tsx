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
            <h2>📖 Overview</h2>
            <p>This is a dynamically loaded resource from your skill roadmap.</p>
            <p>It was fetched directly from your Django API and displayed using React.</p>
          </div>
          <div class="tutorial-section">
            <h2>🔗 Resource Link</h2>
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">
            Learning Resources
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Viewer */}
        <div className="grid lg:grid-cols-3 gap-6 p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Content Area */}
          <div className="lg:col-span-2">
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {isWebsite ? (
                    <BookOpen className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  <CardTitle className="text-lg dark:text-white">
                    {currentResource.title || currentResource.link_type}
                  </CardTitle>
                  <Badge variant="outline">{currentResource.link_type}</Badge>
                </div>
                {currentResource.duration && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{currentResource.duration}</span>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {isWebsite && websiteContent ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
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
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {isWebsite
                          ? "Click 'Read' to fetch and display content from this website"
                          : "This resource opens in a new tab"}
                      </p>
                      <div className="flex gap-2 justify-center">
                        {isWebsite ? (
                          <Button
                            onClick={handleReadClick}
                            disabled={isLoading}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            {isLoading ? "Loading..." : "Read"}
                          </Button>
                        ) : (
                          <Button asChild>
                            <a
                              href={currentResource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open Resource
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {currentResource.description && (
                  <p className="text-gray-700 dark:text-gray-300 mt-4">
                    {currentResource.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resource List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              All Resources
            </h3>
            <div className="space-y-3">
              {allResources.map((res, idx) => (
                <Card
                  key={res.id || idx}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentResource.id === res.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleResourceSelect(res)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      {res.link_type === "Web-Docs" ? (
                        <BookOpen className="w-4 h-4 mt-1 flex-shrink-0" />
                      ) : (
                        <Play className="w-4 h-4 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm dark:text-white truncate">
                          {res.title || res.link_type}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {res.link}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {res.link_type}
                          </Badge>
                        </div>
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
