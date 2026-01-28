import RecipeGrid from '@/components/RecipeGrid';
import type { Recipe } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

async function getLatestRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/explore-latest`, {
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch latest recipes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching latest recipes:', error);
    return [];
  }
}

export default async function ExploreLatestPage() {
  const recipes = await getLatestRecipes();

  return (
    <div className="container py-4">
      <h1 className="text-primary fw-bold mb-4" style={{ textTransform: 'uppercase' }}>
        Công thức mới nhất
      </h1>
      <RecipeGrid recipes={recipes} />
    </div>
  );
}
