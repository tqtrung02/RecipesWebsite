import Link from 'next/link';
import Image from 'next/image';
import { imageApi } from '@/lib/api';

interface Recipe {
  _id: string;
  name: string;
  image: string;
  description: string;
  ingredients: string[];
  category: string;
}

async function getRandomRecipe(): Promise<Recipe | null> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/explore-random`, {
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch random recipe');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching random recipe:', error);
    return null;
  }
}

export default async function ExploreRandomPage() {
  const recipe = await getRandomRecipe();

  if (!recipe) {
    return (
      <div className="container py-4">
        <p className="text-center">Không tìm thấy công thức nào.</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="text-primary fw-bold mb-4" style={{ textTransform: 'uppercase' }}>
        Công thức ngẫu nhiên
      </h1>

      <div className="row">
        <div className="col-md-6">
          <Image 
            src={imageApi.getImageUrl(recipe.image)} 
            alt={recipe.name} 
            width={600} 
            height={400}
            className="img-fluid rounded shadow"
          />
        </div>
        <div className="col-md-6">
          <h2 className="fw-bold">{recipe.name}</h2>
          <p className="text-muted">{recipe.description}</p>
          <div className="mb-3">
            <strong>Danh mục:</strong> {recipe.category}
          </div>
          <div className="mb-3">
            <strong>Nguyên liệu:</strong>
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <Link href={`/recipe/${recipe._id}`} className="btn btn-primary">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
