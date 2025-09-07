import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimulationStats {
  totalPosts: number;
  totalEngagements: number;
  avgScore: string;
  activeBots: number;
  postsPerMinute: string;
}

interface RealTimeStatsProps {
  stats: SimulationStats;
  activeBots: number;
}

export function RealTimeStats({ stats, activeBots }: RealTimeStatsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle data-testid="metrics-title">Real-Time Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Posts</span>
            <span className="text-xl font-bold text-primary" data-testid="total-posts">{stats.totalPosts.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Engagements</span>
            <span className="text-xl font-bold text-accent" data-testid="total-engagements">{stats.totalEngagements.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Score</span>
            <span className="text-xl font-bold text-success" data-testid="avg-score">{stats.avgScore}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle data-testid="bot-activity-title">Bot Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm" data-testid="casual-bots">Casual Users: 156 active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span className="text-sm" data-testid="influencer-bots">Influencers: 23 active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-sm" data-testid="power-user-bots">Power Users: 41 active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            <span className="text-sm" data-testid="lurker-bots">Lurkers: 27 active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
