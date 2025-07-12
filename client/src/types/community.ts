
export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  coverImageUrl?: string;
  memberCount: number;
  questionCount: number;
  isJoined: boolean;
  isPrivate: boolean;
  createdAt: Date;
  tags: string[];
  creator: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  moderators: Array<{
    id: string;
    username: string;
    avatarUrl?: string;
    role: 'moderator' | 'admin';
  }>;
  rules?: string[];
  resources?: Array<{
    title: string;
    url: string;
    type: 'link' | 'document';
  }>;
}

export interface CommunityQuestion {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
    reputation: number;
  };
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  createdAt: Date;
  hasAcceptedAnswer: boolean;
  communityId: string;
}

export interface CreateCommunityData {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  tags: string[];
  isPrivate: boolean;
  coverImage?: File;
  rules: string[];
}
