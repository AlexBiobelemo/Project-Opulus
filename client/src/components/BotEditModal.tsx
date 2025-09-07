import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface BotEditModalProps {
  bot: Bot | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BotEditModal({ bot, isOpen, onClose }: BotEditModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    personality: "",
    followersCount: 0,
    isActive: true,
    postingFrequency: 5,
    engagementRate: 5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (bot) {
      setFormData({
        username: bot.username,
        displayName: bot.displayName,
        personality: bot.personality,
        followersCount: bot.followersCount,
        isActive: bot.isActive === 1,
        postingFrequency: parseInt(bot.postingFrequency || "5"),
        engagementRate: Math.round(parseFloat(bot.engagementRate || "0.5") * 10),
      });
    }
  }, [bot]);

  const handleSave = async () => {
    if (!bot) return;
    
    setIsLoading(true);
    try {
      await apiRequest('PATCH', `/api/bots/${bot.id}`, {
        username: formData.username,
        displayName: formData.displayName,
        personality: formData.personality,
        followersCount: formData.followersCount,
        isActive: formData.isActive ? 1 : 0,
        postingFrequency: formData.postingFrequency.toString(),
        engagementRate: (formData.engagementRate / 10).toString(),
      });

      await queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      
      toast({
        title: "Success",
        description: "Bot updated successfully",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!bot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback 
                className="text-white font-bold"
                style={{ background: bot.avatar }}
              >
                {bot.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg">Edit Bot Profile</div>
              <div className="text-sm text-muted-foreground font-normal">
                {bot.username}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Modify bot settings, behavior patterns, and engagement preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  placeholder="Display Name"
                />
              </div>
            </div>
          </div>

          {/* Personality & Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Personality & Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="personality">Personality Type</Label>
                <Select 
                  value={formData.personality} 
                  onValueChange={(value) => setFormData({...formData, personality: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select personality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>Casual User</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="influencer">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span>Influencer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="power_user">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Power User</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="lurker">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span>Lurker</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="followersCount">Followers Count</Label>
                <Input
                  id="followersCount"
                  type="number"
                  value={formData.followersCount}
                  onChange={(e) => setFormData({...formData, followersCount: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Bot Status</Label>
                <p className="text-sm text-muted-foreground">Enable or disable this bot</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Badge variant={formData.isActive ? "default" : "secondary"}>
                  {formData.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Behavior Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Behavior Settings</h3>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Posting Frequency</Label>
                <span className="text-sm font-mono">{formData.postingFrequency}/10</span>
              </div>
              <Slider
                value={[formData.postingFrequency]}
                onValueChange={(value) => setFormData({...formData, postingFrequency: value[0]})}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                How often this bot creates new posts
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Engagement Rate</Label>
                <span className="text-sm font-mono">{formData.engagementRate}/10</span>
              </div>
              <Slider
                value={[formData.engagementRate]}
                onValueChange={(value) => setFormData({...formData, engagementRate: value[0]})}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                How likely this bot is to engage with other posts
              </p>
            </div>
          </div>

          <Separator />

          {/* Bot Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Bot Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {formData.followersCount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <div className="text-lg font-bold text-accent">
                  {formData.postingFrequency}
                </div>
                <div className="text-xs text-muted-foreground">Post Frequency</div>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <div className="text-lg font-bold text-success">
                  {formData.engagementRate}
                </div>
                <div className="text-xs text-muted-foreground">Engagement Rate</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}