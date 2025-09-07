import { storage } from "../storage";
import { type Bot, type InsertBot, type InsertPost } from "@shared/schema";

interface BotPersonality {
  name: string;
  postingFrequency: number; // posts per hour
  engagementRate: number; // likelihood to engage with posts
  contentTypes: string[];
  hashtags: string[];
}

const PERSONALITIES: Record<string, BotPersonality> = {
  casual: {
    name: "Casual User",
    postingFrequency: 2,
    engagementRate: 0.3,
    contentTypes: ["personal", "food", "lifestyle"],
    hashtags: ["life", "mood", "fun", "food", "weekend"]
  },
  influencer: {
    name: "Influencer",
    postingFrequency: 8,
    engagementRate: 0.7,
    contentTypes: ["promotional", "inspirational", "tech"],
    hashtags: ["inspiration", "goals", "lifestyle", "tech", "innovation", "success"]
  },
  power_user: {
    name: "Power User",
    postingFrequency: 12,
    engagementRate: 0.9,
    contentTypes: ["educational", "news", "tech", "fitness"],
    hashtags: ["education", "fitness", "motivation", "productivity", "tech", "news"]
  },
  lurker: {
    name: "Lurker",
    postingFrequency: 0.5,
    engagementRate: 0.1,
    contentTypes: ["rare_personal"],
    hashtags: ["thoughts", "quiet", "observation"]
  }
};

const CONTENT_TEMPLATES = {
  personal: [
    "Just had an amazing day! {hashtags}",
    "Feeling grateful for all the good things in life {hashtags}",
    "Sometimes it's the little things that matter most {hashtags}",
    "Perfect weather for a walk outside! {hashtags}"
  ],
  food: [
    "This coffee is absolutely perfect ☕ {hashtags}",
    "Trying out a new recipe today! Wish me luck {hashtags}",
    "Nothing beats homemade comfort food {hashtags}",
    "Found this amazing little cafe downtown {hashtags}"
  ],
  tech: [
    "Just discovered this amazing new AI tool that's revolutionizing content creation! The possibilities are endless 🚀 {hashtags}",
    "The future of technology is here and it's incredible! {hashtags}",
    "Working on some exciting new projects. Can't wait to share! {hashtags}",
    "Love how technology keeps making our lives easier {hashtags}"
  ],
  fitness: [
    "💪 Day 30 of my fitness challenge complete! Remember: consistency beats perfection every time. Small steps lead to big changes! {hashtags}",
    "Early morning workout done! Nothing beats that endorphin rush {hashtags}",
    "Setting new personal records every week. The grind continues! {hashtags}",
    "Fitness isn't just about the body, it's about mental strength too {hashtags}"
  ],
  inspirational: [
    "Believe in yourself and amazing things will happen! {hashtags}",
    "Every setback is a setup for a comeback. Keep pushing! {hashtags}",
    "Your only limit is your mind. Dream big, achieve bigger! {hashtags}",
    "Success is not final, failure is not fatal: it is the courage to continue that counts {hashtags}"
  ],
  educational: [
    "Today I learned something fascinating about renewable energy {hashtags}",
    "Here's a quick tip that could save you hours of work {hashtags}",
    "Breaking down complex topics into simple, actionable insights {hashtags}",
    "Knowledge shared is knowledge multiplied {hashtags}"
  ]
};

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
];

export class BotEngine {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private speed: number = 5; // 1-10 scale

  constructor() {
    this.initializeBots();
  }

  private async initializeBots() {
    const existingBots = await storage.getBots();
    if (existingBots.length === 0) {
      await this.createInitialBots();
    }
  }

  private async createInitialBots() {
    const botTypes = [
      { personality: "casual", count: 156 },
      { personality: "influencer", count: 23 },
      { personality: "power_user", count: 41 },
      { personality: "lurker", count: 27 }
    ];

    for (const { personality, count } of botTypes) {
      for (let i = 0; i < count; i++) {
        const personalityData = PERSONALITIES[personality];
        const bot: InsertBot = {
          username: `@${this.generateUsername(personality)}_${i + 1}`,
          displayName: this.generateDisplayName(personality),
          personality,
          avatar: this.generateAvatar(personality),
          followersCount: this.generateFollowersCount(personality),
          isActive: 1,
          postingFrequency: personalityData.postingFrequency.toString(),
          engagementRate: personalityData.engagementRate.toString(),
        };
        await storage.createBot(bot);
      }
    }
  }

  private generateUsername(personality: string): string {
    const usernames = {
      casual: [
        "sarah_explores", "mike_adventures", "luna_vibes", "david_moments", "emma_daily",
        "jason_life", "maya_stories", "alex_journey", "zoe_wanderer", "ryan_captures",
        "isla_dreams", "noah_explorer", "aria_lifestyle", "liam_moments", "sophie_vibes"
      ],
      influencer: [
        "lifestyle_luna", "tech_maven_maya", "success_sarah", "vision_victoria", "boss_blake",
        "inspire_iris", "elite_emma", "digital_diana", "content_chloe", "brand_bella",
        "influence_ivy", "creator_claire", "trendy_tessa", "viral_violet", "social_stella"
      ],
      power_user: [
        "code_crusher", "data_driven_dan", "growth_guru_grace", "metric_maven", "scale_sam",
        "optimize_oscar", "analyze_anna", "strategy_steve", "performance_paul", "insights_ivy",
        "efficiency_evan", "results_rachel", "systems_sophia", "process_peter", "output_olivia"
      ],
      lurker: [
        "quiet_quinn", "observer_owen", "silent_sage", "watchful_willow", "lurker_leo",
        "shadow_sam", "subtle_sara", "behind_scenes", "low_key_luke", "reserved_rose",
        "discreet_dana", "private_parker", "mystery_mia", "stealth_stella", "enigma_ethan"
      ]
    };
    
    const personalityUsernames = usernames[personality as keyof typeof usernames];
    return personalityUsernames[Math.floor(Math.random() * personalityUsernames.length)];
  }

  private generateDisplayName(personality: string): string {
    const names = {
      casual: [
        "Sarah Martinez", "Mike Chen", "Luna Rodriguez", "David Thompson", "Emma Wilson",
        "Jason Park", "Maya Singh", "Alex Johnson", "Zoe Anderson", "Ryan Garcia"
      ],
      influencer: [
        "Victoria Sterling", "Blake Morrison", "Iris Delacroix", "Emma Luxe", "Diana Royal",
        "Chloe Vance", "Bella Sinclair", "Ivy Chambers", "Claire Ashford", "Tessa Vale"
      ],
      power_user: [
        "Grace Kim", "Daniel Cooper", "Anna Petrov", "Steven Walsh", "Paul Martinez",
        "Ivy Chen", "Evan Rodriguez", "Rachel Smith", "Sophia Brown", "Peter Williams"
      ],
      lurker: [
        "Quinn Torres", "Owen Mitchell", "Sage Campbell", "Willow Hayes", "Leo Foster",
        "Sam Rivers", "Sara Cross", "Luke Mason", "Rose Palmer", "Dana Webb"
      ]
    };
    
    const personalityNames = names[personality as keyof typeof names];
    return personalityNames[Math.floor(Math.random() * personalityNames.length)];
  }

  private generateAvatar(personality: string): string {
    const colors = {
      casual: ["#FF9800", "#F44336"],
      influencer: ["#9C27B0", "#E91E63"],
      power_user: ["#4CAF50", "#2196F3"],
      lurker: ["#607D8B", "#795548"]
    };
    
    const personalityColors = colors[personality as keyof typeof colors];
    return `linear-gradient(135deg, ${personalityColors[0]}, ${personalityColors[1]})`;
  }

  private generateFollowersCount(personality: string): number {
    const ranges = {
      casual: [50, 500],
      influencer: [10000, 100000],
      power_user: [1000, 15000],
      lurker: [10, 100]
    };
    
    const [min, max] = ranges[personality as keyof typeof ranges];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateContent(personality: string): { content: string; imageUrl?: string; hashtags: string[] } {
    const personalityData = PERSONALITIES[personality];
    const contentType = personalityData.contentTypes[Math.floor(Math.random() * personalityData.contentTypes.length)];
    const templates = CONTENT_TEMPLATES[contentType as keyof typeof CONTENT_TEMPLATES] || CONTENT_TEMPLATES.personal;
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const hashtags = this.selectRandomHashtags(personalityData.hashtags, 2, 4);
    const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');
    
    const content = template.replace('{hashtags}', hashtagString);
    const imageUrl = Math.random() < 0.3 ? IMAGE_URLS[Math.floor(Math.random() * IMAGE_URLS.length)] : undefined;
    
    return { content, imageUrl, hashtags };
  }

  private selectRandomHashtags(available: string[], min: number, max: number): string[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private async createBotPost() {
    const bots = await storage.getBots();
    const activeBots = bots.filter(bot => bot.isActive === 1);
    
    if (activeBots.length === 0) return;
    
    // Select bot based on posting frequency
    const weightedBots = activeBots.flatMap(bot => {
      const frequency = parseFloat(bot.postingFrequency || "1");
      return Array(Math.ceil(frequency)).fill(bot);
    });
    
    const selectedBot = weightedBots[Math.floor(Math.random() * weightedBots.length)];
    const { content, imageUrl, hashtags } = this.generateContent(selectedBot.personality);
    
    const post: InsertPost = {
      botId: selectedBot.id,
      content,
      imageUrl,
      hashtags: hashtags || [],
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      algorithmScore: "0"
    };
    
    return await storage.createPost(post);
  }

  public start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const interval = Math.max(1000, 10000 - (this.speed * 900)); // Speed affects posting frequency
    
    this.intervalId = setInterval(async () => {
      await this.createBotPost();
    }, interval);
  }

  public pause() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public setSpeed(speed: number) {
    this.speed = Math.max(1, Math.min(10, speed));
    if (this.isRunning) {
      this.pause();
      this.start();
    }
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      speed: this.speed
    };
  }
}
