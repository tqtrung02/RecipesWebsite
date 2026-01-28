import RecipeGrid from '@/components/RecipeGrid';
import type { Recipe } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

interface CategoryData {
  recipes: Recipe[];
  category: {
    name: string;
  } | null;
}

async function getCategoryRecipes(name: string): Promise<CategoryData> {
  try {
    // Decode the name first (Next.js already decodes it, but ensure it's correct)
    const decodedName = decodeURIComponent(name);
    const response = await fetch(`${API_BASE_URL}/api/categories/${encodeURIComponent(decodedName)}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch category recipes');
    }
    
    return await response.json();
  } catch (error) {
    return { recipes: [], category: null };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const { recipes, category } = await getCategoryRecipes(name);

  return (
    <div className="container py-4">
      <h1 className="text-primary fw-bold mb-4" style={{ textTransform: 'uppercase' }}>
        {category?.name || name}
      </h1>
      <RecipeGrid 
        recipes={recipes} 
        emptyMessage="Không tìm thấy công thức nào trong danh mục này." 
      />
    </div>
  );
}
