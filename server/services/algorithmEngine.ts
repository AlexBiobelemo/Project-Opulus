import { storage } from "../storage";
import { type Post, type Bot, type Engagement } from "@shared/schema";

export class AlgorithmEngine {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.start();
  }

  private async calculatePostScore(post: Post): Promise<number> {
    const config = await storage.getAlgorithmConfig();
    const engagementWeight = parseFloat(config.engagementWeight || "0.4");
    const recencyWeight = parseFloat(config.recencyWeight || "0.3");
    const relevanceWeight = parseFloat(config.relevanceWeight || "0.3");

    // Calculate engagement score (0-1)
    const totalEngagements = (post.likesCount || 0) + (post.commentsCount || 0) + (post.sharesCount || 0);
    const engagementScore = Math.min(totalEngagements / 100, 1); // Normalize to 0-1

    // Calculate recency score (0-1)
    const now = new Date();
    const postTime = new Date(post.createdAt || new Date());
    const hoursAgo = (now.getTime() - postTime.getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - (hoursAgo / 24)); // Decay over 24 hours

    // Calculate relevance score (0-1) - based on hashtags and content length
    const hashtagBonus = (post.hashtags?.length || 0) * 0.1;
    const contentLength = post.content.length;
    const lengthScore = Math.min(contentLength / 200, 1); // Optimal around 200 characters
    const relevanceScore = Math.min((hashtagBonus + lengthScore) / 2, 1);

    // Calculate final weighted score (0-10)
    const finalScore = (
      engagementScore * engagementWeight +
      recencyScore * recencyWeight +
      relevanceScore * relevanceWeight
    ) * 10;

    return Math.round(finalScore * 10) / 10; // Round to 1 decimal place
  }

  private async simulateEngagements() {
    const posts = await storage.getPosts(20); // Get recent posts
    const bots = await storage.getBots();
    
    for (const post of posts) {
      const postBot = bots.find(bot => bot.id === post.botId);
      if (!postBot) continue;

      // Simulate engagement based on post age and bot personalities
      const hoursAgo = (new Date().getTime() - new Date(post.createdAt || new Date()).getTime()) / (1000 * 60 * 60);
      if (hoursAgo > 24) continue; // Don't engage with old posts

      const engagingBots = bots.filter(bot => 
        bot.id !== post.botId && 
        bot.isActive === 1 &&
        Math.random() < parseFloat(bot.engagementRate || "0.5") * 0.1
      );

      for (const bot of engagingBots) {
        const engagementType = this.selectEngagementType();
        
        // Update post engagement counts
        const updates: Partial<Post> = {};
        if (engagementType === 'like') {
          updates.likesCount = (post.likesCount || 0) + 1;
        } else if (engagementType === 'comment') {
          updates.commentsCount = (post.commentsCount || 0) + 1;
        } else if (engagementType === 'share') {
          updates.sharesCount = (post.sharesCount || 0) + 1;
        }

        await storage.updatePost(post.id, updates);
        
        // Create engagement record
        await storage.createEngagement({
          postId: post.id,
          botId: bot.id,
          type: engagementType,
          content: engagementType === 'comment' ? this.generateComment() : undefined
        });
      }
    }
  }

  private selectEngagementType(): string {
    const rand = Math.random();
    if (rand < 0.7) return 'like';
    if (rand < 0.9) return 'comment';
    return 'share';
  }

  private generateComment(): string {
    const comments = [
      "Great post!",
      "Love this! 💙",
      "So inspiring!",
      "Thanks for sharing",
      "This is amazing!",
      "Couldn't agree more",
      "Well said!",
      "Exactly what I needed to see today",
      "This hits different 🔥",
      "Facts! 💯"
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private async updateAllPostScores() {
    const posts = await storage.getPosts(100); // Update top 100 posts
    
    for (const post of posts) {
      const newScore = await this.calculatePostScore(post);
      await storage.updatePost(post.id, { algorithmScore: newScore.toString() });
    }
  }

  private async updateSimulationStats() {
    const posts = await storage.getPosts();
    const bots = await storage.getBots();
    const engagements = await storage.getEngagements();
    
    const totalPosts = posts.length;
    const totalEngagements = engagements.length;
    const activeBots = bots.filter(bot => bot.isActive === 1).length;
    
    // Calculate average score
    const scores = posts.map(post => parseFloat(post.algorithmScore || "0"));
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    // Calculate posts per minute (approximate)
    const recentPosts = posts.filter(post => {
      const postTime = new Date(post.createdAt || new Date());
      const now = new Date();
      return (now.getTime() - postTime.getTime()) < 60000; // Last minute
    });
    const postsPerMinute = recentPosts.length;

    await storage.updateSimulationStats({
      totalPosts,
      totalEngagements,
      avgScore: avgScore.toFixed(1),
      activeBots,
      postsPerMinute: postsPerMinute.toString()
    });
  }

  public async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      await this.simulateEngagements();
      await this.updateAllPostScores();
      await this.updateSimulationStats();
    }, 2000); // Update every 2 seconds
  }

  public pause() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public async updateWeights(engagementWeight: number, recencyWeight: number, relevanceWeight: number) {
    // Normalize weights to sum to 1
    const total = engagementWeight + recencyWeight + relevanceWeight;
    const normalizedEngagement = engagementWeight / total;
    const normalizedRecency = recencyWeight / total;
    const normalizedRelevance = relevanceWeight / total;

    await storage.updateAlgorithmConfig({
      engagementWeight: normalizedEngagement.toFixed(2),
      recencyWeight: normalizedRecency.toFixed(2),
      relevanceWeight: normalizedRelevance.toFixed(2)
    });

    // Recalculate all post scores with new weights
    await this.updateAllPostScores();
  }

  public getStatus() {
    return {
      isRunning: this.isRunning
    };
  }
}
