export enum Category {
  DOG_FOOD = '🐶 Dog Food',
  DOG_TOYS = '🎾 Dog Toys',
  DOG_GROOMING = '✂️ Dog Grooming',
  DOG_ACCESSORIES = '🎒 Dog Accessories',
  CAT_FOOD = '🐱 Cat Food',
  CAT_TOYS = '🧶 Cat Toys',
  CAT_ACCESSORIES = '🏠 Cat Accessories',
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  rating: number;
  reviewsCount: number;
  image: string;
  features: string[];
  category: Category;
  pros: string[];
  cons: string[];
  amazonUrl: string;
  fullReview?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
}

export type Page = 'home' | 'dogs' | 'cats' | 'blog' | 'about' | 'review';
