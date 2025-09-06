import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Bot {
  id: string;
  username: string;
  displayName: string;
  personality: string;
  avatar: string;
}

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  algorithmScore: string;
  createdAt: string;
  bot?: Bot;
}

interface ContentFeedProps {
  posts: Post[];
}

export function ContentFeed({ posts }: ContentFeedProps) {
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getPersonalityColor = (personality: string) => {
    const colors = {
      casual: "bg-orange-500",
      influencer: "bg-purple-500", 
      power_user: "bg-blue-500",
      lurker: "bg-gray-500"
    };
    return colors[personality as keyof typeof colors] || "bg-gray-500";
  };

  const getPersonalityLabel = (personality: string) => {
    const labels = {
      casual: "Casual",
      influencer: "Influencer",
      power_user: "Power User", 
      lurker: "Lurker"
    };
    return labels[personality as keyof typeof labels] || personality;
  };

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="feed-title">Live Content Feed</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sort by Algorithm</span>
            <div className="w-3 h-3 bg-success rounded-full real-time-indicator"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {posts.map((post) => (
              <div 
                key={post.id}
                className="content-item border border-border rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                data-testid={`post-${post.id}`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback 
                      className={`text-white font-bold ${getPersonalityColor(post.bot?.personality || 'casual')}`}
                      style={{ 
                        background: post.bot?.avatar || 'linear-gradient(135deg, #9C27B0, #E91E63)'
                      }}
                      data-testid={`avatar-${post.bot?.username}`}
                    >
                      {post.bot?.displayName?.slice(0, 2).toUpperCase() || 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium" data-testid={`username-${post.bot?.username}`}>
                        {post.bot?.username || '@UnknownBot'}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={getPersonalityColor(post.bot?.personality || 'casual')}
                        data-testid={`personality-${post.bot?.personality}`}
                      >
                        {getPersonalityLabel(post.bot?.personality || 'casual')}
                      </Badge>
                      <span className="text-sm text-muted-foreground" data-testid={`time-${post.id}`}>
                        {getTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl} 
                        alt="Post content" 
                        className="w-full h-32 object-cover rounded-md mb-3"
                        data-testid={`image-${post.id}`}
                      />
                    )}
                    
                    <p className="text-sm mb-3" data-testid={`content-${post.id}`}>
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <i className="fas fa-heart text-destructive"></i>
                          <span data-testid={`likes-${post.id}`}>{post.likesCount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <i className="fas fa-comment text-accent"></i>
                          <span data-testid={`comments-${post.id}`}>{post.commentsCount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <i className="fas fa-share text-success"></i>
                          <span data-testid={`shares-${post.id}`}>{post.sharesCount}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Score:</span>
                        <span 
                          className="text-sm font-bold text-primary score-animation"
                          data-testid={`score-${post.id}`}
                        >
                          {parseFloat(post.algorithmScore).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
