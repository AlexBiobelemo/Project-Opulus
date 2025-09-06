import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/use-websocket";

interface SimulationData {
  botStatus: {
    isRunning: boolean;
    speed: number;
  };
  activeBots: number;
  stats: {
    postsPerMinute: string;
  };
}

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function Layout({ children, title, description }: LayoutProps) {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Fetch initial data
  const { data: initialStats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: false,
  });

  // WebSocket connection for real-time updates
  const { connectionStatus: wsStatus } = useWebSocket({
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

  const botStatus = simulationData?.botStatus || { isRunning: false, speed: 5 };
  const activeBots = simulationData?.activeBots || 0;
  const stats = simulationData?.stats || initialStats || { postsPerMinute: "0" };
  const postsPerMinute = stats?.postsPerMinute || "0";

  const handleSpeedChange = () => {
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
              <h2 className="text-2xl font-bold" data-testid="page-title">{title}</h2>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" data-testid="active-bots-badge">
                Active Bots: {activeBots}
              </Badge>
              <Badge variant="secondary" data-testid="posts-per-minute-badge">
                Posts/min: {postsPerMinute}
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

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}