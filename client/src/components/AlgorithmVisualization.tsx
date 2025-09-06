import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AlgorithmConfig {
  engagementWeight: string;
  recencyWeight: string;
  relevanceWeight: string;
}

interface AlgorithmVisualizationProps {
  config: AlgorithmConfig;
}

export function AlgorithmVisualization({ config }: AlgorithmVisualizationProps) {
  const engagementPercent = Math.round(parseFloat(config.engagementWeight) * 100);
  const recencyPercent = Math.round(parseFloat(config.recencyWeight) * 100);
  const relevancePercent = Math.round(parseFloat(config.relevanceWeight) * 100);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="algorithm-title">Algorithm Weights Visualization</CardTitle>
          <Button variant="outline" size="sm" data-testid="button-algorithm-details">
            <i className="fas fa-info-circle mr-1"></i>Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="algorithm-visualization rounded-lg p-6 text-white mb-6">
          <div className="text-center">
            <h4 className="text-xl font-bold mb-2" data-testid="formula-title">Content Scoring Formula</h4>
            <p className="opacity-90" data-testid="formula-description">
              Score = (Engagement × {config.engagementWeight}) + (Recency × {config.recencyWeight}) + (Relevance × {config.relevanceWeight})
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Engagement Weight</span>
              <span className="text-sm text-primary font-bold" data-testid="engagement-percentage">{engagementPercent}%</span>
            </div>
            <Progress value={engagementPercent} className="h-2" data-testid="engagement-progress" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Recency Weight</span>
              <span className="text-sm text-accent font-bold" data-testid="recency-percentage">{recencyPercent}%</span>
            </div>
            <Progress value={recencyPercent} className="h-2" data-testid="recency-progress" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Relevance Weight</span>
              <span className="text-sm text-success font-bold" data-testid="relevance-percentage">{relevancePercent}%</span>
            </div>
            <Progress value={relevancePercent} className="h-2" data-testid="relevance-progress" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
