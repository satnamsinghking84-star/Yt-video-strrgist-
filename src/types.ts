export interface Channel {
  id: string;
  name: string;
  handle: string;
  color: string;
  createdAt: string;
}

export interface Checklist {
  thumbnail: boolean;
  title: boolean;
  description: boolean;
  script: boolean;
  voice: boolean;
  fullVideo: boolean;
}

export type VideoStatus = 'Pending' | 'Scheduled' | 'Published';

export interface Video {
  id: string;
  channelId: string;
  title: string;
  description: string;
  script: string;
  voiceNotes: string;
  status: VideoStatus;
  scheduledDate: string; // "YYYY-MM-DDTHH:MM" format
  checklist: Checklist;
  createdAt: string;
  updatedAt: string;
  contentType?: 'Video' | 'Post';
}

export interface Idea {
  id: string;
  text: string;
  channelId: string;
  createdAt: string;
}
