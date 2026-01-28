import Link from 'next/link';
import Image from 'next/image';
import { imageApi } from '@/lib/api';
import type { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

const RecipeCard = ({ recipe, className = '' }: RecipeCardProps) => {
  return (
    <Link
      href={`/recipe/${recipe._id}`}
      className={`text-center category__link text-decoration-none ${className}`}
    >
      <div className="category__img category__img--large shadow-sm rounded-3 mb-2">
        <Image
          src={imageApi.getImageUrl(recipe.image)}
          alt={recipe.name}
          width={250}
          height={330}
          className="img-fluid rounded-3"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="pt-1 fw-bold text-dark">{recipe.name}</div>
    </Link>
  );
};

export default RecipeCard;
