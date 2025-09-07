import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  simulationStatus: {
    isRunning: boolean;
    speed: number;
  };
  onSpeedChange: (speed: number) => void;
}

export function Sidebar({ simulationStatus, onSpeedChange }: SidebarProps) {
  const { toast } = useToast();
  const [location] = useLocation();

  const handleSimulationControl = async (action: string, speed?: number) => {
    try {
      await apiRequest('POST', '/api/simulation/control', { action, speed });
      toast({
        title: "Success",
        description: `Simulation ${action}${speed ? ` with speed ${speed}` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to control simulation",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-robot text-primary-foreground"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold" data-testid="app-title">Algorithm Sim</h1>
            <p className="text-sm text-muted-foreground">Social Media AI</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          <Link href="/">
            <button className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${location === '/' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`} data-testid="nav-dashboard">
              <i className="fas fa-tachometer-alt w-5"></i>
              <span>Dashboard</span>
            </button>
          </Link>
          <Link href="/bots">
            <button className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${location === '/bots' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`} data-testid="nav-bots">
              <i className="fas fa-users w-5"></i>
              <span>Bot Management</span>
            </button>
          </Link>
          <Link href="/algorithm">
            <button className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${location === '/algorithm' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`} data-testid="nav-algorithm">
              <i className="fas fa-cog w-5"></i>
              <span>Algorithm Config</span>
            </button>
          </Link>
          <Link href="/analytics">
            <button className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${location === '/analytics' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`} data-testid="nav-analytics">
              <i className="fas fa-chart-line w-5"></i>
              <span>Analytics</span>
            </button>
          </Link>
        </nav>
      </div>
      
      <Separator />
      
      {/* Simulation Controls */}
      <div className="p-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Simulation Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${simulationStatus.isRunning ? 'bg-success real-time-indicator' : 'bg-muted-foreground'}`}></div>
                <Badge variant={simulationStatus.isRunning ? "default" : "secondary"} data-testid="simulation-status">
                  {simulationStatus.isRunning ? "Running" : "Paused"}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground">Speed</label>
              <div className="mt-2">
                <Slider
                  value={[simulationStatus.speed]}
                  onValueChange={(value) => {
                    onSpeedChange(value[0]);
                    handleSimulationControl('speed', value[0]);
                  }}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                  data-testid="speed-slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90"
                onClick={() => handleSimulationControl(simulationStatus.isRunning ? 'pause' : 'start')}
                data-testid="button-pause-resume"
              >
                <i className={`fas ${simulationStatus.isRunning ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                {simulationStatus.isRunning ? 'Pause' : 'Resume'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleSimulationControl('reset')}
                data-testid="button-reset"
              >
                <i className="fas fa-redo mr-2"></i>Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
