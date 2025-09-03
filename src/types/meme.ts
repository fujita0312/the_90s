export interface Meme {
  id: string;
  imageUrl: string;
  createdAt: string;
  author?: string;
}

export interface MemeSubmission {
  imageUrl: string;
  author?: string;
}
