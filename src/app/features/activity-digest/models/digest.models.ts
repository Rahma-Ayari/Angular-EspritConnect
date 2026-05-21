export type DigestFrequency = 'DAILY' | 'WEEKLY';

export interface DigestSectionsDTO {
  businessDirectoryPosts: boolean;
  recentlyJoinedMembers: boolean;
  latestEvents: boolean;
  latestFeedPosts: boolean;
  latestJobPosts: boolean;
  includePlatformContact: boolean;
}

export interface DigestConfigRequestDTO {
  sujet: string;
  bannerUrl?: string;
  frequence: DigestFrequency;
  actif: boolean;
  templateHtml?: string;
  sections?: DigestSectionsDTO;
  frontendBaseUrl?: string;
}

export interface DigestConfigResponseDTO extends DigestConfigRequestDTO {
  id: number;
  lastSentAt?: string;
}

export interface DigestPreviewResponseDTO {
  html: string;
}