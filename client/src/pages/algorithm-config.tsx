import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AlgorithmConfig {
  id: string;
  engagementWeight: string;
  recencyWeight: string;
  relevanceWeight: string;
  updatedAt: string;
}

export default function AlgorithmConfig() {
  const [engagementWeight, setEngagementWeight] = useState(40);
  const [recencyWeight, setRecencyWeight] = useState(30);
  const [relevanceWeight, setRelevanceWeight] = useState(30);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAutoApply, setIsAutoApply] = useState(false);
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<AlgorithmConfig>({
    queryKey: ['/api/algorithm-config'],
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (config && !hasChanges) {
      setEngagementWeight(Math.round(parseFloat(config.engagementWeight) * 100));
      setRecencyWeight(Math.round(parseFloat(config.recencyWeight) * 100));
      setRelevanceWeight(Math.round(parseFloat(config.relevanceWeight) * 100));
    }
  }, [config, hasChanges]);

  const normalizeWeights = () => {
    const total = engagementWeight + recencyWeight + relevanceWeight;
    if (total === 0) return { eng: 0, rec: 0, rel: 0 };
    
    return {
      eng: engagementWeight / total,
      rec: recencyWeight / total,
      rel: relevanceWeight / total
    };
  };

  const handleWeightChange = (type: string, value: number[]) => {
    const newValue = value[0];
    setHasChanges(true);
    
    if (type === 'engagement') {
      setEngagementWeight(newValue);
    } else if (type === 'recency') {
      setRecencyWeight(newValue);
    } else if (type === 'relevance') {
      setRelevanceWeight(newValue);
    }

    if (isAutoApply) {
      handleApplyChanges(true);
    }
  };

  const handleApplyChanges = async (skipToast = false) => {
    try {
      const normalized = normalizeWeights();
      
      await apiRequest('POST', '/api/algorithm-config', {
        engagementWeight: normalized.eng.toFixed(2),
        recencyWeight: normalized.rec.toFixed(2),
        relevanceWeight: normalized.rel.toFixed(2)
      });

      await queryClient.invalidateQueries({ queryKey: ['/api/algorithm-config'] });
      setHasChanges(false);
      
      if (!skipToast) {
        toast({
          title: "Success",
          description: "Algorithm configuration updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update algorithm configuration",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setEngagementWeight(40);
    setRecencyWeight(30);
    setRelevanceWeight(30);
    setHasChanges(true);
  };

  const presets = [
    { name: "Engagement Focus", eng: 70, rec: 20, rel: 10 },
    { name: "Recency Focus", eng: 20, rec: 60, rel: 20 },
    { name: "Balanced", eng: 33, rec: 33, rel: 34 },
    { name: "Content Quality", eng: 25, rec: 25, rel: 50 },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setEngagementWeight(preset.eng);
    setRecencyWeight(preset.rec);
    setRelevanceWeight(preset.rel);
    setHasChanges(true);
    
    if (isAutoApply) {
      setTimeout(() => handleApplyChanges(true), 100);
    }
  };

  const normalized = normalizeWeights();
  const engagementPercent = Math.round(normalized.eng * 100);
  const recencyPercent = Math.round(normalized.rec * 100);
  const relevancePercent = Math.round(normalized.rel * 100);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Algorithm Configuration" description="Fine-tune how content is ranked and displayed">
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="algorithm-config-title">Algorithm Configuration</h1>
          <p className="text-muted-foreground">Fine-tune how content is ranked and displayed</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-apply">Auto Apply</Label>
            <Switch
              id="auto-apply"
              checked={isAutoApply}
              onCheckedChange={setIsAutoApply}
              data-testid="auto-apply-switch"
            />
          </div>
          {hasChanges && (
            <Badge variant="secondary" data-testid="unsaved-changes-badge">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Algorithm Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Formula</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="algorithm-visualization rounded-lg p-6 text-white mb-6">
              <div className="text-center">
                <h4 className="text-xl font-bold mb-2" data-testid="formula-title">Content Scoring Formula</h4>
                <p className="opacity-90 text-sm" data-testid="formula-description">
                  Score = (Engagement × {(normalized.eng).toFixed(2)}) + (Recency × {(normalized.rec).toFixed(2)}) + (Relevance × {(normalized.rel).toFixed(2)})
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Engagement Weight</span>
                  <span className="text-sm text-primary font-bold" data-testid="engagement-percentage">{engagementPercent}%</span>
                </div>
                <Progress value={engagementPercent} className="h-3" data-testid="engagement-progress" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Recency Weight</span>
                  <span className="text-sm text-accent font-bold" data-testid="recency-percentage">{recencyPercent}%</span>
                </div>
                <Progress value={recencyPercent} className="h-3" data-testid="recency-progress" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Relevance Weight</span>
                  <span className="text-sm text-success font-bold" data-testid="relevance-percentage">{relevancePercent}%</span>
                </div>
                <Progress value={relevancePercent} className="h-3" data-testid="relevance-progress" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weight Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-sm font-medium">
                    Engagement Weight
                  </Label>
                  <span className="text-sm font-mono" data-testid="engagement-raw-value">{engagementWeight}</span>
                </div>
                <Slider
                  value={[engagementWeight]}
                  onValueChange={(value) => handleWeightChange('engagement', value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                  data-testid="engagement-weight-slider"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How much likes, comments, and shares matter
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-sm font-medium">
                    Recency Weight
                  </Label>
                  <span className="text-sm font-mono" data-testid="recency-raw-value">{recencyWeight}</span>
                </div>
                <Slider
                  value={[recencyWeight]}
                  onValueChange={(value) => handleWeightChange('recency', value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                  data-testid="recency-weight-slider"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How much post time/freshness matters
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-sm font-medium">
                    Relevance Weight
                  </Label>
                  <span className="text-sm font-mono" data-testid="relevance-raw-value">{relevanceWeight}</span>
                </div>
                <Slider
                  value={[relevanceWeight]}
                  onValueChange={(value) => handleWeightChange('relevance', value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                  data-testid="relevance-weight-slider"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How much hashtags and content quality matter
                </p>
              </div>

              <Separator />

              <div className="flex space-x-3">
                <Button 
                  onClick={() => handleApplyChanges()}
                  disabled={!hasChanges || isAutoApply}
                  className="flex-1"
                  data-testid="apply-changes-button"
                >
                  Apply Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  data-testid="reset-button"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {presets.map((preset, index) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="flex flex-col h-auto p-3"
                    onClick={() => applyPreset(preset)}
                    data-testid={`preset-${index}`}
                  >
                    <span className="font-medium text-xs">{preset.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {preset.eng}/{preset.rec}/{preset.rel}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </Layout>
  );
}