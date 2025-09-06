import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AlgorithmConfig {
  engagementWeight: string;
  recencyWeight: string;
  relevanceWeight: string;
}

interface AlgorithmParametersProps {
  config: AlgorithmConfig;
}

export function AlgorithmParameters({ config }: AlgorithmParametersProps) {
  const [engagementWeight, setEngagementWeight] = useState(
    Math.round(parseFloat(config.engagementWeight) * 100)
  );
  const [recencyWeight, setRecencyWeight] = useState(
    Math.round(parseFloat(config.recencyWeight) * 100)
  );
  const [relevanceWeight, setRelevanceWeight] = useState(
    Math.round(parseFloat(config.relevanceWeight) * 100)
  );
  const [postingFrequency, setPostingFrequency] = useState(5);
  const [engagementRate, setEngagementRate] = useState(7);
  const [diversity, setDiversity] = useState(6);

  const { toast } = useToast();

  const handleApplyChanges = async () => {
    try {
      // Normalize weights so they sum to 100%
      const total = engagementWeight + recencyWeight + relevanceWeight;
      const normalizedEngagement = engagementWeight / total;
      const normalizedRecency = recencyWeight / total;
      const normalizedRelevance = relevanceWeight / total;

      await apiRequest('POST', '/api/algorithm-config', {
        engagementWeight: normalizedEngagement.toFixed(2),
        recencyWeight: normalizedRecency.toFixed(2),
        relevanceWeight: normalizedRelevance.toFixed(2)
      });

      // Invalidate cache to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/algorithm-config'] });

      toast({
        title: "Success",
        description: "Algorithm parameters updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update algorithm parameters",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle data-testid="parameters-title">Algorithm Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Engagement Weight: {engagementWeight}%
            </Label>
            <Slider
              value={[engagementWeight]}
              onValueChange={(value) => setEngagementWeight(value[0])}
              max={100}
              min={0}
              step={1}
              className="w-full mt-2"
              data-testid="engagement-weight-slider"
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Recency Weight: {recencyWeight}%
            </Label>
            <Slider
              value={[recencyWeight]}
              onValueChange={(value) => setRecencyWeight(value[0])}
              max={100}
              min={0}
              step={1}
              className="w-full mt-2"
              data-testid="recency-weight-slider"
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Relevance Weight: {relevanceWeight}%
            </Label>
            <Slider
              value={[relevanceWeight]}
              onValueChange={(value) => setRelevanceWeight(value[0])}
              max={100}
              min={0}
              step={1}
              className="w-full mt-2"
              data-testid="relevance-weight-slider"
            />
          </div>
          
          <Button 
            onClick={handleApplyChanges}
            className="w-full mt-4"
            data-testid="button-apply-changes"
          >
            Apply Changes
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle data-testid="bot-behavior-title">Bot Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Posting Frequency</Label>
            <Slider
              value={[postingFrequency]}
              onValueChange={(value) => setPostingFrequency(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-20"
              data-testid="posting-frequency-slider"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Engagement Rate</Label>
            <Slider
              value={[engagementRate]}
              onValueChange={(value) => setEngagementRate(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-20"
              data-testid="engagement-rate-slider"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Diversity</Label>
            <Slider
              value={[diversity]}
              onValueChange={(value) => setDiversity(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-20"
              data-testid="diversity-slider"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
