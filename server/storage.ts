import { type Bot, type InsertBot, type Post, type InsertPost, type Engagement, type InsertEngagement, type AlgorithmConfig, type InsertAlgorithmConfig, type SimulationStats, bots as botsTable, posts as postsTable, engagements as engagementsTable, algorithmConfig as algorithmConfigTable, simulationStats as simulationStatsTable } from "@shared/schema";
import { randomUUID } from "crypto";
import { getDb, type DrizzleDb } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Bots
  createBot(bot: InsertBot): Promise<Bot>;
  getBots(): Promise<Bot[]>;
  getBot(id: string): Promise<Bot | undefined>;
  updateBot(id: string, updates: Partial<Bot>): Promise<Bot | undefined>;
  
  // Posts
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  getPostsByBot(botId: string): Promise<Post[]>;
  
  // Engagements
  createEngagement(engagement: InsertEngagement): Promise<Engagement>;
  getEngagements(): Promise<Engagement[]>;
  getEngagementsByPost(postId: string): Promise<Engagement[]>;
  
  // Algorithm Config
  getAlgorithmConfig(): Promise<AlgorithmConfig>;
  updateAlgorithmConfig(config: Partial<InsertAlgorithmConfig>): Promise<AlgorithmConfig>;
  
  // Simulation Stats
  getSimulationStats(): Promise<SimulationStats>;
  updateSimulationStats(stats: Partial<SimulationStats>): Promise<SimulationStats>;
}

export class MemStorage implements IStorage {
  private bots: Map<string, Bot>;
  private posts: Map<string, Post>;
  private engagements: Map<string, Engagement>;
  private algorithmConfig: AlgorithmConfig;
  private simulationStats: SimulationStats;

  constructor() {
    this.bots = new Map();
    this.posts = new Map();
    this.engagements = new Map();
    
    // Default algorithm config
    this.algorithmConfig = {
      id: randomUUID(),
      engagementWeight: "0.4",
      recencyWeight: "0.3",
      relevanceWeight: "0.3",
      updatedAt: new Date(),
    };
    
    // Default simulation stats
    this.simulationStats = {
      id: randomUUID(),
      totalPosts: 0,
      totalEngagements: 0,
      avgScore: "0",
      activeBots: 0,
      postsPerMinute: "0",
      updatedAt: new Date(),
    };
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    const id = randomUUID();
    const bot: Bot = { 
      ...insertBot, 
      id, 
      createdAt: new Date(),
      followersCount: insertBot.followersCount ?? 0,
      isActive: insertBot.isActive ?? 1,
      postingFrequency: insertBot.postingFrequency ?? "5",
      engagementRate: insertBot.engagementRate ?? "5"
    };
    this.bots.set(id, bot);
    return bot;
  }

  async getBots(): Promise<Bot[]> {
    return Array.from(this.bots.values());
  }

  async getBot(id: string): Promise<Bot | undefined> {
    return this.bots.get(id);
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | undefined> {
    const bot = this.bots.get(id);
    if (!bot) return undefined;
    
    const updatedBot = { ...bot, ...updates };
    this.bots.set(id, updatedBot);
    return updatedBot;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = { 
      ...insertPost, 
      id, 
      createdAt: new Date(),
      imageUrl: insertPost.imageUrl ?? null,
      hashtags: Array.isArray(insertPost.hashtags) ? insertPost.hashtags : [],
      likesCount: insertPost.likesCount ?? 0,
      commentsCount: insertPost.commentsCount ?? 0,
      sharesCount: insertPost.sharesCount ?? 0,
      algorithmScore: insertPost.algorithmScore ?? "0"
    };
    this.posts.set(id, post);
    return post;
  }

  async getPosts(limit: number = 50, offset: number = 0): Promise<Post[]> {
    const allPosts = Array.from(this.posts.values())
      .sort((a, b) => parseFloat(b.algorithmScore || "0") - parseFloat(a.algorithmScore || "0"));
    
    return allPosts.slice(offset, offset + limit);
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async getPostsByBot(botId: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.botId === botId);
  }

  async createEngagement(insertEngagement: InsertEngagement): Promise<Engagement> {
    const id = randomUUID();
    const engagement: Engagement = { 
      ...insertEngagement, 
      id, 
      createdAt: new Date(),
      content: insertEngagement.content ?? null
    };
    this.engagements.set(id, engagement);
    return engagement;
  }

  async getEngagements(): Promise<Engagement[]> {
    return Array.from(this.engagements.values());
  }

  async getEngagementsByPost(postId: string): Promise<Engagement[]> {
    return Array.from(this.engagements.values()).filter(engagement => engagement.postId === postId);
  }

  async getAlgorithmConfig(): Promise<AlgorithmConfig> {
    return this.algorithmConfig;
  }

  async updateAlgorithmConfig(config: Partial<InsertAlgorithmConfig>): Promise<AlgorithmConfig> {
    this.algorithmConfig = { 
      ...this.algorithmConfig, 
      ...config, 
      updatedAt: new Date() 
    };
    return this.algorithmConfig;
  }

  async getSimulationStats(): Promise<SimulationStats> {
    return this.simulationStats;
  }

  async updateSimulationStats(stats: Partial<SimulationStats>): Promise<SimulationStats> {
    this.simulationStats = { 
      ...this.simulationStats, 
      ...stats, 
      updatedAt: new Date() 
    };
    return this.simulationStats;
  }
}

// Choose storage implementation based on DATABASE_URL presence

export class PgStorage implements IStorage {
  private db: DrizzleDb;
  constructor(db: DrizzleDb) {
    this.db = db;
  }
  async createBot(insertBot: InsertBot): Promise<Bot> {
    const [row] = await this.db.insert(botsTable).values(insertBot).returning();
    return row;
  }
  async getBots(): Promise<Bot[]> {
    return await this.db.select().from(botsTable);
  }
  async getBot(id: string): Promise<Bot | undefined> {
    const [row] = await this.db.select().from(botsTable).where(eq(botsTable.id, id));
    return row;
  }
  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | undefined> {
    const [row] = await this.db.update(botsTable).set(updates).where(eq(botsTable.id, id)).returning();
    return row;
  }
  async createPost(insertPost: InsertPost): Promise<Post> {
    const [row] = await this.db.insert(postsTable).values(insertPost).returning();
    return row;
  }
  async getPosts(limit: number = 50, offset: number = 0): Promise<Post[]> {
    return await this.db.select().from(postsTable).orderBy(desc(postsTable.algorithmScore)).limit(limit).offset(offset);
  }
  async getPost(id: string): Promise<Post | undefined> {
    const [row] = await this.db.select().from(postsTable).where(eq(postsTable.id, id));
    return row;
  }
  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const [row] = await this.db.update(postsTable).set(updates).where(eq(postsTable.id, id)).returning();
    return row;
  }
  async getPostsByBot(botId: string): Promise<Post[]> {
    return await this.db.select().from(postsTable).where(eq(postsTable.botId, botId));
  }
  async createEngagement(insertEngagement: InsertEngagement): Promise<Engagement> {
    const [row] = await this.db.insert(engagementsTable).values(insertEngagement).returning();
    return row;
  }
  async getEngagements(): Promise<Engagement[]> {
    return await this.db.select().from(engagementsTable);
  }
  async getEngagementsByPost(postId: string): Promise<Engagement[]> {
    return await this.db.select().from(engagementsTable).where(eq(engagementsTable.postId, postId));
  }
  async getAlgorithmConfig(): Promise<AlgorithmConfig> {
    const [row] = await this.db.select().from(algorithmConfigTable).limit(1);
    if (row) return row;
    const [created] = await this.db.insert(algorithmConfigTable).values({}).returning();
    return created;
  }
  async updateAlgorithmConfig(config: Partial<InsertAlgorithmConfig>): Promise<AlgorithmConfig> {
    const existing = await this.getAlgorithmConfig();
    const [row] = await this.db.update(algorithmConfigTable).set({ ...config, updatedAt: sql`now()` }).where(eq(algorithmConfigTable.id, existing.id)).returning();
    return row;
  }
  async getSimulationStats(): Promise<SimulationStats> {
    const [row] = await this.db.select().from(simulationStatsTable).limit(1);
    if (row) return row;
    const [created] = await this.db.insert(simulationStatsTable).values({}).returning();
    return created;
  }
  async updateSimulationStats(stats: Partial<SimulationStats>): Promise<SimulationStats> {
    const existing = await this.getSimulationStats();
    const [row] = await this.db.update(simulationStatsTable).set({ ...stats, updatedAt: sql`now()` }).where(eq(simulationStatsTable.id, existing.id)).returning();
    return row;
  }
}

const db = getDb();
export const storage: IStorage = db ? new PgStorage(db) : new MemStorage();
