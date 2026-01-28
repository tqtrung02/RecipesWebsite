import { redirect } from 'next/navigation';
import RecipeGrid from '@/components/RecipeGrid';
import type { Recipe } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

async function getFavoriteRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites`, {
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (response.status === 401) {
      redirect('/login');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch favorite recipes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching favorite recipes:', error);
    return [];
  }
}

export default async function FavoritesPage() {
  const recipes = await getFavoriteRecipes();

  return (
    <div className="container py-4">
      <h1 className="pb-4">Công thức yêu thích</h1>
      <RecipeGrid 
        recipes={recipes} 
        emptyMessage="Bạn chưa có công thức yêu thích nào." 
      />
    </div>
  );
}
