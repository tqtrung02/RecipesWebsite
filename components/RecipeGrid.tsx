import RecipeCard from './RecipeCard';
import type { Recipe } from '@/types';

interface RecipeGridProps {
  recipes: Recipe[];
  emptyMessage?: string;
  className?: string;
}

const RecipeGrid = ({ 
  recipes, 
  emptyMessage = 'Không tìm thấy công thức nào.',
  className = ''
}: RecipeGridProps) => {
  if (recipes.length === 0) {
    return <p className="text-center">{emptyMessage}</p>;
  }

  return (
    <div className={`row row-cols-2 row-cols-lg-5 g-3 g-lg-4 ${className}`}>
      {recipes.map((recipe) => (
        <div key={recipe._id} className="col">
          <RecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
  );
};

export default RecipeGrid;
