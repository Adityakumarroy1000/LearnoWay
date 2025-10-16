import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Play, Clock, BookOpen } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  type: string;
  provider: string;
  duration: string;
  description: string;
  url: string;
  difficulty: string;
}

interface ResourceViewerProps {
  resource: Resource;
  allResources: Resource[];
  onClose: () => void;
  onResourceChange: (resource: Resource) => void;
}

const ResourceViewer = ({ resource, allResources, onClose, onResourceChange }: ResourceViewerProps) => {
  const [currentResource, setCurrentResource] = useState(resource);
  const [websiteContent, setWebsiteContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  const fetchWebsiteContent = async (url: string) => {
    setIsLoading(true);
    try {
      // Since we can't directly fetch from external websites due to CORS,
      // we'll simulate fetching comprehensive content sections
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulated comprehensive content based on the URL and resource type
      if (url.includes('w3schools.com') || currentResource.title.toLowerCase().includes('html')) {
        setWebsiteContent(`
          <div class="tutorial-content">
            <div class="tutorial-header">
              <h1>HTML Tutorial - Complete Guide</h1>
              <div class="tutorial-meta">
                <span class="difficulty-badge">Beginner</span>
                <span class="duration">Self-paced learning</span>
              </div>
            </div>
            
            <div class="tutorial-section">
              <h2>📚 Table of Contents</h2>
              <ul class="contents-list">
                <li><a href="#intro">Introduction to HTML</a></li>
                <li><a href="#elements">HTML Elements</a></li>
                <li><a href="#attributes">HTML Attributes</a></li>
                <li><a href="#forms">HTML Forms</a></li>
                <li><a href="#semantic">Semantic HTML</a></li>
                <li><a href="#best-practices">Best Practices</a></li>
              </ul>
            </div>

            <div class="tutorial-section" id="intro">
              <h2>🌟 What is HTML?</h2>
              <p><strong>HTML (HyperText Markup Language)</strong> is the standard markup language for creating web pages and web applications. It describes the structure and content of web pages using markup tags.</p>
              
              <div class="key-points">
                <h3>Key Features:</h3>
                <ul>
                  <li><strong>Structure:</strong> Defines the skeleton of web pages</li>
                  <li><strong>Semantic:</strong> Provides meaning to content</li>
                  <li><strong>Universal:</strong> Supported by all web browsers</li>
                  <li><strong>Standards-based:</strong> Maintained by W3C</li>
                </ul>
              </div>
            </div>

            <div class="tutorial-section" id="elements">
              <h2>🏗️ HTML Elements</h2>
              <p>HTML elements are the building blocks of web pages. They consist of start tags, content, and end tags.</p>
              
              <div class="code-example">
                <h4>Basic HTML Structure:</h4>
                <pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;My First Webpage&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;header&gt;
        &lt;h1&gt;Welcome to My Website&lt;/h1&gt;
        &lt;nav&gt;
            &lt;ul&gt;
                &lt;li&gt;&lt;a href="#home"&gt;Home&lt;/a&gt;&lt;/li&gt;
                &lt;li&gt;&lt;a href="#about"&gt;About&lt;/a&gt;&lt;/li&gt;
                &lt;li&gt;&lt;a href="#contact"&gt;Contact&lt;/a&gt;&lt;/li&gt;
            &lt;/ul&gt;
        &lt;/nav&gt;
    &lt;/header&gt;
    
    &lt;main&gt;
        &lt;section&gt;
            &lt;h2&gt;About HTML&lt;/h2&gt;
            &lt;p&gt;HTML is the foundation of web development.&lt;/p&gt;
        &lt;/section&gt;
    &lt;/main&gt;
    
    &lt;footer&gt;
        &lt;p&gt;&copy; 2024 My Website&lt;/p&gt;
    &lt;/footer&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
              </div>
            </div>

            <div class="tutorial-section" id="attributes">
              <h2>🔧 HTML Attributes</h2>
              <p>Attributes provide additional information about HTML elements and modify their behavior or appearance.</p>
              
              <div class="attribute-examples">
                <h4>Common Attributes:</h4>
                <ul>
                  <li><code>id</code> - Unique identifier for an element</li>
                  <li><code>class</code> - CSS class for styling</li>
                  <li><code>src</code> - Source URL for images, videos, etc.</li>
                  <li><code>href</code> - Link destination</li>
                  <li><code>alt</code> - Alternative text for images</li>
                </ul>
                
                <div class="code-example">
                  <h5>Example:</h5>
                  <pre><code>&lt;img src="image.jpg" alt="Description" class="responsive-image"&gt;
&lt;a href="https://example.com" target="_blank"&gt;Visit Example&lt;/a&gt;
&lt;div id="main-content" class="container"&gt;Content here&lt;/div&gt;</code></pre>
                </div>
              </div>
            </div>

            <div class="tutorial-section" id="forms">
              <h2>📝 HTML Forms</h2>
              <p>Forms allow users to input data and interact with web pages.</p>
              
              <div class="code-example">
                <h4>Contact Form Example:</h4>
                <pre><code>&lt;form action="/submit" method="POST"&gt;
    &lt;label for="name"&gt;Name:&lt;/label&gt;
    &lt;input type="text" id="name" name="name" required&gt;
    
    &lt;label for="email"&gt;Email:&lt;/label&gt;
    &lt;input type="email" id="email" name="email" required&gt;
    
    &lt;label for="message"&gt;Message:&lt;/label&gt;
    &lt;textarea id="message" name="message" rows="4"&gt;&lt;/textarea&gt;
    
    &lt;button type="submit"&gt;Send Message&lt;/button&gt;
&lt;/form&gt;</code></pre>
              </div>
            </div>

            <div class="tutorial-section" id="semantic">
              <h2>🎯 Semantic HTML</h2>
              <p>Semantic elements clearly describe their meaning in a human and machine readable way.</p>
              
              <div class="semantic-elements">
                <h4>Important Semantic Elements:</h4>
                <ul>
                  <li><code>&lt;header&gt;</code> - Page or section header</li>
                  <li><code>&lt;nav&gt;</code> - Navigation links</li>
                  <li><code>&lt;main&gt;</code> - Main content area</li>
                  <li><code>&lt;article&gt;</code> - Independent content</li>
                  <li><code>&lt;section&gt;</code> - Thematic grouping</li>
                  <li><code>&lt;aside&gt;</code> - Sidebar content</li>
                  <li><code>&lt;footer&gt;</code> - Page or section footer</li>
                </ul>
              </div>
            </div>

            <div class="tutorial-section" id="best-practices">
              <h2>✅ Best Practices</h2>
              <div class="best-practices">
                <ul>
                  <li><strong>Use semantic elements</strong> for better accessibility and SEO</li>
                  <li><strong>Always include DOCTYPE</strong> declaration</li>
                  <li><strong>Validate your HTML</strong> using W3C validator</li>
                  <li><strong>Use meaningful alt text</strong> for images</li>
                  <li><strong>Keep your code clean</strong> and well-indented</li>
                  <li><strong>Use lowercase</strong> for element and attribute names</li>
                  <li><strong>Quote attribute values</strong> properly</li>
                </ul>
              </div>
            </div>

            <div class="tutorial-section">
              <h2>🚀 Next Steps</h2>
              <p>Now that you understand HTML basics, consider learning:</p>
              <ul>
                <li>CSS for styling your HTML</li>
                <li>JavaScript for interactivity</li>
                <li>Responsive web design</li>
                <li>Web accessibility principles</li>
              </ul>
            </div>

            <div class="tutorial-footer">
              <p><em>This tutorial covers the fundamentals of HTML. Practice these concepts by building your own web pages!</em></p>
            </div>
          </div>
        `);
      } else {
        setWebsiteContent(`
          <div class="tutorial-content">
            <div class="tutorial-header">
              <h1>${currentResource.title}</h1>
              <div class="tutorial-meta">
                <span class="provider">By ${currentResource.provider}</span>
                <span class="difficulty-badge">${currentResource.difficulty}</span>
                <span class="duration">${currentResource.duration}</span>
              </div>
            </div>
            
            <div class="tutorial-section">
              <h2>📖 Course Overview</h2>
              <p>${currentResource.description}</p>
            </div>

            <div class="tutorial-section">
              <h2>📚 What You'll Learn</h2>
              <ul>
                <li>Core concepts and fundamentals</li>
                <li>Practical examples and exercises</li>
                <li>Real-world applications</li>
                <li>Best practices and industry standards</li>
                <li>Hands-on projects</li>
              </ul>
            </div>

            <div class="tutorial-section">
              <h2>🎯 Learning Objectives</h2>
              <div class="learning-objectives">
                <p>By the end of this course, you will be able to:</p>
                <ul>
                  <li>Understand the fundamental concepts</li>
                  <li>Apply knowledge to real projects</li>
                  <li>Solve common problems effectively</li>
                  <li>Follow industry best practices</li>
                </ul>
              </div>
            </div>

            <div class="tutorial-section">
              <h2>📋 Prerequisites</h2>
              <ul>
                <li>Basic computer literacy</li>
                <li>Interest in learning new skills</li>
                <li>Access to necessary tools and software</li>
              </ul>
            </div>

            <div class="tutorial-section">
              <h2>🔗 Additional Resources</h2>
              <p>Explore related materials and documentation to enhance your learning experience.</p>
            </div>
          </div>
        `);
      }
    } catch (error) {
      console.error('Error fetching website content:', error);
      setWebsiteContent('<p>Error loading content. Please try again.</p>');
    } finally {
      setIsLoading(false);
    }
  };

  const embedUrl = getEmbedUrl(currentResource.url);
  const isWebsite = currentResource.type === "Website";

  const handleResourceSelect = (selectedResource: Resource) => {
    setCurrentResource(selectedResource);
    onResourceChange(selectedResource);
    setWebsiteContent(null); // Reset content when changing resources
  };

  const handleReadClick = () => {
    if (isWebsite) {
      fetchWebsiteContent(currentResource.url);
    }
  };

  useEffect(() => {
    setCurrentResource(resource);
    setWebsiteContent(null);
  }, [resource]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">Learning Resources</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Content Viewer */}
          <div className="lg:col-span-2">
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {isWebsite ? <BookOpen className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <CardTitle className="text-lg dark:text-white">{currentResource.title}</CardTitle>
                  <Badge variant="outline">{currentResource.type}</Badge>
                  <Badge variant="secondary">{currentResource.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>By {currentResource.provider}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{currentResource.duration}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isWebsite && websiteContent ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:text-sm [&_h4]:font-medium [&_h4]:mt-3 [&_h4]:mb-2 [&_pre]:bg-gray-800 [&_pre]:text-gray-100 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:text-sm [&_code]:bg-gray-200 [&_code]:dark:bg-gray-600 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_.tutorial-header]:mb-6 [&_.tutorial-meta]:flex [&_.tutorial-meta]:gap-3 [&_.tutorial-meta]:mt-2 [&_.difficulty-badge]:bg-blue-100 [&_.difficulty-badge]:text-blue-800 [&_.difficulty-badge]:px-2 [&_.difficulty-badge]:py-1 [&_.difficulty-badge]:rounded [&_.difficulty-badge]:text-xs [&_.tutorial-section]:mb-6 [&_.key-points]:bg-blue-50 [&_.key-points]:dark:bg-blue-900/20 [&_.key-points]:p-4 [&_.key-points]:rounded [&_.key-points]:mt-3 [&_.code-example]:bg-gray-100 [&_.code-example]:dark:bg-gray-800 [&_.code-example]:p-4 [&_.code-example]:rounded [&_.code-example]:mt-3"
                      dangerouslySetInnerHTML={{ __html: websiteContent }}
                    />
                  </div>
                ) : embedUrl ? (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <iframe
                      src={embedUrl}
                      title={currentResource.title}
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
                          : "This resource opens in a new tab"
                        }
                      </p>
                      <div className="flex gap-2 justify-center">
                        {isWebsite ? (
                          <Button onClick={handleReadClick} disabled={isLoading}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            {isLoading ? 'Loading...' : 'Read'}
                          </Button>
                        ) : (
                          <Button asChild>
                            <a href={currentResource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open Resource
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-gray-700 dark:text-gray-300 mt-4">{currentResource.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Resource List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">All Resources</h3>
            <div className="space-y-3">
              {allResources.map((res) => (
                <Card 
                  key={res.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentResource.id === res.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleResourceSelect(res)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      {res.type === "Website" ? <BookOpen className="w-4 h-4 mt-1 flex-shrink-0" /> : <Play className="w-4 h-4 mt-1 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm dark:text-white truncate">{res.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{res.provider}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{res.type}</Badge>
                          <span className="text-xs text-gray-500">{res.duration}</span>
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
