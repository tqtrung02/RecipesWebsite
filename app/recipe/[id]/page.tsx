import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { imageApi } from '@/lib/api';
import RecipeActions from '@/components/RecipeActions';
import CommentSection from '@/components/CommentSection';

interface Comment {
  _id: string;
  user: {
    name: string;
  };
  commentText: string;
  createdAt: string;
}

interface Recipe {
  _id: string;
  name: string;
  description: string;
  ingredients: string[];
  category: string;
  image: string;
  comments: Comment[];
}

async function getRecipe(id: string): Promise<{ recipe: Recipe; user: any } | null> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  try {
    const [recipeResponse, userResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/recipe/${id}`, {
        credentials: 'include',
        cache: 'no-store',
      }),
      fetch(`${API_BASE_URL}/api/user/current`, {
        credentials: 'include',
        cache: 'no-store',
      }),
    ]);
    
    if (!recipeResponse.ok) {
      return null;
    }
    
    const recipe = await recipeResponse.json();
    const user = userResponse.ok ? await userResponse.json() : null;
    
    return { recipe, user };
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getRecipe(id);

  if (!data || !data.recipe) {
    notFound();
  }

  const { recipe, user } = data;
  const isFavorite = user?.favorites?.some((fav: any) => fav._id === recipe._id) || false;
  const canEdit = user && (recipe.email === user.email || user.role === 'admin');

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href="/">Trang chủ</Link></li>
          <li className="breadcrumb-item">
            <Link href={`/categories/${recipe.category}`}>{recipe.category}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">{recipe.name}</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-12 col-md-4">
          <Image
            src={imageApi.getImageUrl(recipe.image)}
            alt={recipe.name}
            width={400}
            height={400}
            className="img-fluid sticky-top"
            style={{ top: '20px' }}
          />
        </div>

        <div className="col-12 col-md-8">
          <div className="row">
            <div className="col-12">
              <h1>{recipe.name}</h1>
              <RecipeActions
                recipeId={recipe._id}
                user={user}
                isFavorite={isFavorite}
                canEdit={canEdit}
              />
            </div>
            <div className="col-12 mb-4">
              <i className="bi bi-tag"></i> {recipe.category}
            </div>
            <div className="col-12" style={{ whiteSpace: 'pre-line' }}>
              <h4>Công thức</h4>
              {recipe.description}
            </div>
          </div>

          <div className="row pt-4">
            <div className="col-12">
              <h4>Nguyên liệu</h4>
              <ul className="list-group list-group-flush">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="list-group-item">{ingredient}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <CommentSection
        recipeId={recipe._id}
        initialComments={recipe.comments || []}
        user={user}
        isAdmin={user?.role === 'admin'}
      />
    </div>
  );
}
