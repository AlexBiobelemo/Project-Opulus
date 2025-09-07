import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bots = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  personality: text("personality").notNull(), // casual, influencer, power_user, lurker
  avatar: text("avatar").notNull(),
  followersCount: integer("followers_count").default(0),
  isActive: integer("is_active").default(1), // 1 for true, 0 for false
  postingFrequency: decimal("posting_frequency").default("5"), // 1-10 scale
  engagementRate: decimal("engagement_rate").default("5"), // 1-10 scale
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().references(() => bots.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  hashtags: text("hashtags").array().default([]),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  algorithmScore: decimal("algorithm_score").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const engagements = pgTable("engagements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  botId: varchar("bot_id").notNull().references(() => bots.id),
  type: text("type").notNull(), // like, comment, share
  content: text("content"), // for comments
  createdAt: timestamp("created_at").defaultNow(),
});

export const algorithmConfig = pgTable("algorithm_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  engagementWeight: decimal("engagement_weight").default("0.4"),
  recencyWeight: decimal("recency_weight").default("0.3"),
  relevanceWeight: decimal("relevance_weight").default("0.3"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const simulationStats = pgTable("simulation_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalPosts: integer("total_posts").default(0),
  totalEngagements: integer("total_engagements").default(0),
  avgScore: decimal("avg_score").default("0"),
  activeBots: integer("active_bots").default(0),
  postsPerMinute: decimal("posts_per_minute").default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export const insertEngagementSchema = createInsertSchema(engagements).omit({
  id: true,
  createdAt: true,
});

export const insertAlgorithmConfigSchema = createInsertSchema(algorithmConfig).omit({
  id: true,
  updatedAt: true,
});

export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof bots.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertEngagement = z.infer<typeof insertEngagementSchema>;
export type Engagement = typeof engagements.$inferSelect;
export type InsertAlgorithmConfig = z.infer<typeof insertAlgorithmConfigSchema>;
export type AlgorithmConfig = typeof algorithmConfig.$inferSelect;
export type SimulationStats = typeof simulationStats.$inferSelect;
