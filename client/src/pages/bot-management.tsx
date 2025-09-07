import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { BotEditModal } from "@/components/BotEditModal";
import { BotDetailsModal } from "@/components/BotDetailsModal";
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

export default function BotManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [personalityFilter, setPersonalityFilter] = useState("all");
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBots, setSelectedBots] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: bots = [], isLoading } = useQuery<Bot[]>({
    queryKey: ['/api/bots'],
    refetchInterval: 5000,
  });

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
      casual: "Casual User",
      influencer: "Influencer",
      power_user: "Power User", 
      lurker: "Lurker"
    };
    return labels[personality as keyof typeof labels] || personality;
  };

  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPersonality = personalityFilter === "all" || bot.personality === personalityFilter;
    return matchesSearch && matchesPersonality;
  });

  const handleToggleBotActive = async (botId: string, isActive: boolean) => {
    try {
      await apiRequest('PATCH', `/api/bots/${botId}`, { isActive: isActive ? 1 : 0 });
      await queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      toast({
        title: "Success",
        description: `Bot ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot status",
        variant: "destructive",
      });
    }
  };

  const handleEditBot = (bot: Bot) => {
    setSelectedBot(bot);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (bot: Bot) => {
    setSelectedBot(bot);
    setIsDetailsModalOpen(true);
  };

  const handleBatchActivation = async (activate: boolean) => {
    if (selectedBots.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedBots).map(botId => 
          apiRequest('PATCH', `/api/bots/${botId}`, { isActive: activate ? 1 : 0 })
        )
      );
      
      await queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      setSelectedBots(new Set());
      
      toast({
        title: "Success",
        description: `${selectedBots.size} bots ${activate ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot statuses",
        variant: "destructive",
      });
    }
  };

  const toggleBotSelection = (botId: string) => {
    const newSelected = new Set(selectedBots);
    if (newSelected.has(botId)) {
      newSelected.delete(botId);
    } else {
      newSelected.add(botId);
    }
    setSelectedBots(newSelected);
  };

  const selectAllBots = () => {
    setSelectedBots(new Set(filteredBots.map(bot => bot.id)));
  };

  const clearSelection = () => {
    setSelectedBots(new Set());
  };

  const personalityStats = bots.reduce((acc, bot) => {
    acc[bot.personality] = (acc[bot.personality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeBots = bots.filter(bot => bot.isActive === 1).length;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Bot Management" description="Manage your AI bots and their behaviors">
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="bot-management-title">Bot Management</h1>
          <p className="text-muted-foreground">Manage your AI bots and their behaviors</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" data-testid="total-bots-badge">
            Total: {bots.length} bots
          </Badge>
          <Badge variant="default" data-testid="active-bots-badge">
            Active: {activeBots} bots
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(personalityStats).map(([personality, count]) => (
          <Card key={personality}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getPersonalityColor(personality)}`}></div>
                <div>
                  <p className="text-sm font-medium" data-testid={`${personality}-count`}>
                    {getPersonalityLabel(personality)}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Batch Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters & Actions</CardTitle>
            {selectedBots.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedBots.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchActivation(true)}
                  data-testid="batch-activate"
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchActivation(false)}
                  data-testid="batch-deactivate"
                >
                  Deactivate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  data-testid="clear-selection"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Bots</Label>
              <Input
                id="search"
                placeholder="Search by username or display name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-bots-input"
              />
            </div>
            <div>
              <Label htmlFor="personality-filter">Personality</Label>
              <select 
                id="personality-filter"
                className="w-full p-2 border border-border rounded-md bg-background"
                value={personalityFilter}
                onChange={(e) => setPersonalityFilter(e.target.value)}
                data-testid="personality-filter-select"
              >
                <option value="all">All Personalities</option>
                <option value="casual">Casual Users</option>
                <option value="influencer">Influencers</option>
                <option value="power_user">Power Users</option>
                <option value="lurker">Lurkers</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllBots}
                data-testid="select-all"
              >
                Select All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bots List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Bots ({filteredBots.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredBots.map((bot) => (
                <div 
                  key={bot.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                  data-testid={`bot-card-${bot.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedBots.has(bot.id)}
                      onChange={() => toggleBotSelection(bot.id)}
                      className="w-4 h-4"
                      data-testid={`bot-checkbox-${bot.id}`}
                    />
                    <Avatar 
                      className="w-12 h-12 cursor-pointer" 
                      onClick={() => handleViewDetails(bot)}
                    >
                      <AvatarFallback 
                        className="text-white font-bold"
                        style={{ background: bot.avatar }}
                        data-testid={`bot-avatar-${bot.id}`}
                      >
                        {bot.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 
                          className="font-medium cursor-pointer hover:text-primary" 
                          onClick={() => handleViewDetails(bot)}
                          data-testid={`bot-username-${bot.id}`}
                        >
                          {bot.username}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={getPersonalityColor(bot.personality)}
                          data-testid={`bot-personality-${bot.id}`}
                        >
                          {getPersonalityLabel(bot.personality)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`bot-display-name-${bot.id}`}>
                        {bot.displayName}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span data-testid={`bot-followers-${bot.id}`}>
                          {bot.followersCount.toLocaleString()} followers
                        </span>
                        <span data-testid={`bot-posting-freq-${bot.id}`}>
                          Posting: {bot.postingFrequency}/10
                        </span>
                        <span data-testid={`bot-engagement-rate-${bot.id}`}>
                          Engagement: {parseFloat(bot.engagementRate || "0.5") * 10}/10
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`active-${bot.id}`} className="text-sm">Active</Label>
                      <Switch
                        id={`active-${bot.id}`}
                        checked={bot.isActive === 1}
                        onCheckedChange={(checked) => handleToggleBotActive(bot.id, checked)}
                        data-testid={`bot-active-switch-${bot.id}`}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(bot)}
                      data-testid={`bot-view-button-${bot.id}`}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditBot(bot)}
                      data-testid={`bot-edit-button-${bot.id}`}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <BotEditModal
        bot={selectedBot}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBot(null);
        }}
      />

      <BotDetailsModal
        bot={selectedBot}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedBot(null);
        }}
      />
      </div>
    </Layout>
  );
}