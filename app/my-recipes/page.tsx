import { redirect } from 'next/navigation';
import RecipeGrid from '@/components/RecipeGrid';
import type { Recipe } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

async function getMyRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/my-recipes`, {
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (response.status === 401) {
      redirect('/login');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch my recipes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching my recipes:', error);
    return [];
  }
}

export default async function MyRecipesPage() {
  const recipes = await getMyRecipes();

  return (
    <div className="container py-4">
      <h2 className="mb-4">Công thức của tôi</h2>
      <RecipeGrid 
        recipes={recipes} 
        emptyMessage="Bạn chưa có công thức nào." 
      />
    </div>
  );
}
