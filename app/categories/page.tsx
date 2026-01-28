import CategoryCard from '@/components/CategoryCard';
import type { Category } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container py-4">
      <h1 className="text-primary fw-bold mb-4" style={{ textTransform: 'uppercase' }}>
        Danh mục công thức
      </h1>

      {categories.length > 0 ? (
        <div className="row row-cols-2 row-cols-lg-6 g-2 g-lg-3">
          {categories.map((category) => (
            <div key={category._id} className="col">
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">Không tìm thấy danh mục nào.</p>
      )}
    </div>
  );
}
