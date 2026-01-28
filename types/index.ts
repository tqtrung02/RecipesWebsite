// Common types and interfaces for the application

export interface Recipe {
  _id: string;
  name: string;
  image: string;
  description?: string;
  category?: string;
  ingredients?: string[];
  email?: string;
  comments?: Comment[];
}

export interface Category {
  _id: string;
  name: string;
  image: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  favorites?: Recipe[];
}

export interface Comment {
  _id: string;
  text: string;
  user: {
    name: string;
    email: string;
  };
  createdAt?: string;
}

export interface HomepageData {
  categories: Category[];
  food: {
    latest: Recipe[];
    thai: Recipe[];
    american: Recipe[];
    chinese: Recipe[];
    vietnamese: Recipe[];
  };
  user: User | null;
}
