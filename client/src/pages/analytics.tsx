import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layout } from "@/components/Layout";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SimulationStats {
  totalPosts: number;
  totalEngagements: number;
  avgScore: string;
  activeBots: number;
  postsPerMinute: string;
  updatedAt: string;
}

interface Bot {
  id: string;
  username: string;
  displayName: string;
  personality: string;
  followersCount: number;
  isActive: number;
  postingFrequency: string;
  engagementRate: string;
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
  bot?: Bot;
}

export default function Analytics() {
  const { data: stats } = useQuery<SimulationStats>({
    queryKey: ['/api/stats'],
    refetchInterval: 2000,
  });

  const { data: bots = [] } = useQuery<Bot[]>({
    queryKey: ['/api/bots'],
    refetchInterval: 5000,
  });

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    refetchInterval: 3000,
  });

  // Bot personality distribution
  const personalityData = bots.reduce((acc, bot) => {
    const personality = bot.personality;
    const existing = acc.find(item => item.name === personality);
    if (existing) {
      existing.value += 1;
      existing.active += bot.isActive;
    } else {
      acc.push({
        name: personality,
        value: 1,
        active: bot.isActive,
        label: personality.replace('_', ' ').toUpperCase()
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; active: number; label: string }>);

  // Engagement metrics over time (simulated)
  const engagementData = posts.slice(0, 10).map((post, index) => ({
    name: `Post ${index + 1}`,
    likes: post.likesCount,
    comments: post.commentsCount,
    shares: post.sharesCount,
    score: parseFloat(post.algorithmScore || "0")
  })).reverse();

  // Top performing hashtags
  const hashtagCounts = posts.reduce((acc, post) => {
    post.hashtags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topHashtags = Object.entries(hashtagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // Bot performance metrics
  const botPerformance = bots
    .filter(bot => bot.isActive === 1)
    .slice(0, 10)
    .map(bot => {
      const botPosts = posts.filter(post => post.bot?.id === bot.id);
      const totalEngagements = botPosts.reduce((sum, post) => 
        sum + post.likesCount + post.commentsCount + post.sharesCount, 0);
      return {
        name: bot.username.replace('@', ''),
        posts: botPosts.length,
        engagements: totalEngagements,
        avgScore: botPosts.length > 0 
          ? (botPosts.reduce((sum, post) => sum + parseFloat(post.algorithmScore || "0"), 0) / botPosts.length).toFixed(1)
          : "0",
        personality: bot.personality,
        followers: bot.followersCount
      };
    })
    .sort((a, b) => b.engagements - a.engagements);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getPersonalityColor = (personality: string) => {
    const colors = {
      casual: "#FF9800",
      influencer: "#9C27B0", 
      power_user: "#2196F3",
      lurker: "#607D8B"
    };
    return colors[personality as keyof typeof colors] || "#607D8B";
  };

  return (
    <Layout title="Analytics Dashboard" description="Deep insights into your simulation performance">
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="analytics-title">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Deep insights into your simulation performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" data-testid="last-updated">
            Last updated: {stats ? new Date(stats.updatedAt).toLocaleTimeString() : 'Loading...'}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
              <p className="text-2xl font-bold text-primary" data-testid="total-posts-metric">
                {stats?.totalPosts?.toLocaleString() || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Engagements</p>
              <p className="text-2xl font-bold text-accent" data-testid="total-engagements-metric">
                {stats?.totalEngagements?.toLocaleString() || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold text-success" data-testid="avg-score-metric">
                {stats?.avgScore || "0"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Active Bots</p>
              <p className="text-2xl font-bold text-warning" data-testid="active-bots-metric">
                {stats?.activeBots || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Posts/Min</p>
              <p className="text-2xl font-bold text-destructive" data-testid="posts-per-minute-metric">
                {stats?.postsPerMinute || "0"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot Personality Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Bot Personality Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={personalityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({label, percent}) => `${label} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {personalityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getPersonalityColor(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Post Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="likes" fill="#FF8042" />
                <Bar dataKey="comments" fill="#00C49F" />
                <Bar dataKey="shares" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Algorithm Score Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Score Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Hashtags */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Hashtags</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72">
              <div className="space-y-3">
                {topHashtags.map((item, index) => (
                  <div 
                    key={item.tag}
                    className="flex items-center justify-between"
                    data-testid={`hashtag-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-mono text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-medium">#{item.tag}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress 
                        value={(item.count / Math.max(...topHashtags.map(h => h.count))) * 100}
                        className="w-20 h-2"
                      />
                      <span className="text-sm font-bold min-w-[2rem] text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Bots */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Bots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">Rank</th>
                  <th className="text-left p-2">Bot</th>
                  <th className="text-left p-2">Personality</th>
                  <th className="text-right p-2">Posts</th>
                  <th className="text-right p-2">Engagements</th>
                  <th className="text-right p-2">Avg Score</th>
                  <th className="text-right p-2">Followers</th>
                </tr>
              </thead>
              <tbody>
                {botPerformance.map((bot, index) => (
                  <tr 
                    key={bot.name}
                    className="border-b border-border/50 hover:bg-secondary/50"
                    data-testid={`bot-row-${index}`}
                  >
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="p-2 font-medium">{bot.name}</td>
                    <td className="p-2">
                      <Badge 
                        variant="secondary"
                        style={{ backgroundColor: getPersonalityColor(bot.personality) }}
                        className="text-white text-xs"
                      >
                        {bot.personality.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">{bot.posts}</td>
                    <td className="p-2 text-right font-bold text-accent">
                      {bot.engagements.toLocaleString()}
                    </td>
                    <td className="p-2 text-right font-bold text-success">
                      {bot.avgScore}
                    </td>
                    <td className="p-2 text-right text-muted-foreground">
                      {bot.followers.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}