
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'moderator';
  reputation: number;
  isVerified: boolean;
  isBanned: boolean;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  communities: string[];
  badges: UserBadge[];
  stats: UserStats;
  socialLinks?: SocialLinks;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserStats {
  questionsAsked: number;
  answersGiven: number;
  acceptedAnswers: number;
  totalUpvotes: number;
  totalDownvotes: number;
  commentsPosted: number;
  profileViews: number;
  followersCount: number;
  followingCount: number;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface UserActivity {
  id: string;
  type: 'question_posted' | 'answer_posted' | 'comment_posted' | 'upvote_given' | 'badge_earned' | 'community_joined';
  title: string;
  description: string;
  timestamp: Date;
  relatedId?: string;
  relatedUrl?: string;
  icon: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  votes: number;
  answerCount: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: {
    username: string;
    avatarUrl?: string;
    reputation: number;
  };
  community?: string;
  isAccepted: boolean;
}

export interface Answer {
  id: string;
  content: string;
  votes: number;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
  questionId: string;
  questionTitle: string;
  authorId: string;
  author: {
    username: string;
    avatarUrl?: string;
    reputation: number;
  };
}
