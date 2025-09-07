import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

interface Bot {
  id: string;
  username: string;
  displayName: string;
  personality: string;
  avatar: string;
  followersCount: number;
  isActive: number;
  postingFrequency: string;
  engagementRate: string;
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  algorithmScore: string;
  createdAt: string;
}

interface BotDetailsModalProps {
  bot: Bot | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BotDetailsModal({ bot, isOpen, onClose }: BotDetailsModalProps) {
  const { data: allPosts = [] } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    enabled: isOpen && !!bot,
  });

  if (!bot) return null;

  const botPosts = allPosts.filter(post => (post as any).bot?.id === bot.id);
  const totalEngagements = botPosts.reduce((sum, post) => 
    sum + post.likesCount + post.commentsCount + post.sharesCount, 0);
  const avgScore = botPosts.length > 0 
    ? (botPosts.reduce((sum, post) => sum + parseFloat(post.algorithmScore || "0"), 0) / botPosts.length).toFixed(1)
    : "0";

  const getPersonalityColor = (personality: string) => {
    const colors = {
      casual: "#FF9800",
      influencer: "#9C27B0", 
      power_user: "#2196F3",
      lurker: "#607D8B"
    };
    return colors[personality as keyof typeof colors] || "#607D8B";
  };

  const getPersonalityLabel = (personality: string) => {
    const labels = {
      casual: "Casual User",
      influencer: "Influencer",
      power_user: "Power User", 
      lurker: "Lurker"
    };
    return labels[personality as keyof typeof labels] || personality;
  };

  const getPersonalityDescription = (personality: string) => {
    const descriptions = {
      casual: "Posts about everyday life, food, and personal experiences. Moderate engagement with content.",
      influencer: "Creates aspirational content about lifestyle, tech, and success. High engagement and followers.",
      power_user: "Shares educational content, fitness tips, and productivity advice. Very active and engaged.",
      lurker: "Rarely posts but occasionally shares thoughtful observations. Low posting frequency."
    };
    return descriptions[personality as keyof typeof descriptions] || "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback 
                className="text-white font-bold text-lg"
                style={{ background: bot.avatar }}
              >
                {bot.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl">{bot.displayName}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {bot.username}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: getPersonalityColor(bot.personality) }}
                  className="text-white"
                >
                  {getPersonalityLabel(bot.personality)}
                </Badge>
                <Badge variant={bot.isActive === 1 ? "default" : "secondary"}>
                  {bot.isActive === 1 ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            {getPersonalityDescription(bot.personality)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bot Statistics */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bot Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {bot.followersCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <div className="text-lg font-bold text-accent">
                      {botPosts.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <div className="text-lg font-bold text-success">
                      {totalEngagements.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Engagements</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <div className="text-lg font-bold text-warning">
                      {avgScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Posting Frequency</span>
                      <span>{bot.postingFrequency}/10</span>
                    </div>
                    <Progress value={parseInt(bot.postingFrequency || "5") * 10} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engagement Rate</span>
                      <span>{Math.round(parseFloat(bot.engagementRate || "0.5") * 10)}/10</span>
                    </div>
                    <Progress value={parseFloat(bot.engagementRate || "0.5") * 100} className="h-2" />
                  </div>
                </div>

                <Separator />

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDistanceToNow(new Date(bot.createdAt))} ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={bot.isActive === 1 ? "text-success" : "text-muted-foreground"}>
                      {bot.isActive === 1 ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Recent Posts ({botPosts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {botPosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No posts yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {botPosts.slice(0, 10).map((post) => (
                        <div 
                          key={post.id}
                          className="border border-border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm flex-1">{post.content}</p>
                            <Badge variant="outline" className="ml-2">
                              Score: {parseFloat(post.algorithmScore).toFixed(1)}
                            </Badge>
                          </div>
                          
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.map((tag, index) => (
                                <span key={index} className="text-xs text-primary">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center space-x-1">
                                <span>❤️</span>
                                <span>{post.likesCount}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>💬</span>
                                <span>{post.commentsCount}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>🔄</span>
                                <span>{post.sharesCount}</span>
                              </span>
                            </div>
                            <span>
                              {formatDistanceToNow(new Date(post.createdAt))} ago
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}