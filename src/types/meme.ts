export interface Meme {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  author?: string;
}

export interface MemeSubmission {
  title: string;
  description: string;
  imageUrl: string;
  author?: string;
}
