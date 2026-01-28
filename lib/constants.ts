// Application constants

export const RECIPE_IMAGE_SIZE = {
  width: 250,
  height: 330,
} as const;

export const CATEGORY_IMAGE_SIZE = {
  width: 120,
  height: 120,
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
