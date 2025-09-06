import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { AlgorithmVisualization } from "@/components/AlgorithmVisualization";
import { ContentFeed } from "@/components/ContentFeed";
import { RealTimeStats } from "@/components/RealTimeStats";
import { AlgorithmParameters } from "@/components/AlgorithmParameters";
import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";

interface SimulationData {
  posts: any[];
  stats: any;
  config: any;
  botStatus: {
    isRunning: boolean;
    speed: number;
  };
  algorithmStatus: {
    isRunning: boolean;
  };
  activeBots: number;
}

export default function Dashboard() {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Fetch initial data
  const { data: initialPosts } = useQuery({
    queryKey: ['/api/posts'],
    refetchInterval: false,
  });

  const { data: initialStats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: false,
  });

  const { data: initialConfig } = useQuery({
    queryKey: ['/api/algorithm-config'],
    refetchInterval: false,
  });

  // WebSocket connection for real-time updates
  const { isConnected, connectionStatus: wsStatus } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'simulation_update') {
        setSimulationData(message.data);
      }
    },
    onConnect: () => {
      setConnectionStatus('connected');
    },
    onDisconnect: () => {
      setConnectionStatus('disconnected');
    }
  });

  useEffect(() => {
    setConnectionStatus(wsStatus);
  }, [wsStatus]);

  const posts = simulationData?.posts || initialPosts || [];
  const stats = simulationData?.stats || initialStats || {
    totalPosts: 0,
    totalEngagements: 0,
    avgScore: "0",
    activeBots: 0,
    postsPerMinute: "0"
  };
  const config = simulationData?.config || initialConfig || {
    engagementWeight: "0.4",
    recencyWeight: "0.3", 
    relevanceWeight: "0.3"
  };
  const botStatus = simulationData?.botStatus || { isRunning: false, speed: 5 };
  const activeBots = simulationData?.activeBots || 0;

  const handleSpeedChange = (speed: number) => {
    // Speed changes are handled through the sidebar component
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        simulationStatus={botStatus}
        onSpeedChange={handleSpeedChange}
      />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" data-testid="dashboard-title">Algorithm Dashboard</h2>
              <p className="text-muted-foreground">Real-time social media algorithm simulation</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" data-testid="active-bots-badge">
                Active Bots: {activeBots}
              </Badge>
              <Badge variant="secondary" data-testid="posts-per-minute-badge">
                Posts/min: {stats.postsPerMinute}
              </Badge>
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
                data-testid="connection-status-badge"
              >
                {connectionStatus === 'connected' ? '🟢 Live' : '🔴 Offline'}
              </Badge>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Algorithm Visualization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <AlgorithmVisualization config={config} />
              <RealTimeStats stats={stats} activeBots={activeBots} />
            </div>

            {/* Content Feed and Algorithm Parameters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <ContentFeed posts={Array.isArray(posts) ? posts : []} />
              <AlgorithmParameters config={config} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
