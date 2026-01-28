'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RecipeActionsProps {
  recipeId: string;
  user: any;
  isFavorite: boolean;
  canEdit: boolean;
}

export default function RecipeActions({ recipeId, user, isFavorite: initialIsFavorite, canEdit }: RecipeActionsProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const handleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const endpoint = isFavorite ? 'unfavorite' : 'favorite';

    try {
      const response = await fetch(`${API_BASE_URL}/recipe/${endpoint}/${recipeId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        router.refresh();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có muốn xóa công thức không?')) {
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const response = await fetch(`${API_BASE_URL}/recipe/delete/${recipeId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/my-recipes');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Có lỗi xảy ra khi xóa công thức.');
    }
  };

  return (
    <>
      {user && (
        <div className="position-relative">
          <button
            onClick={handleFavorite}
            disabled={loading}
            className={`btn btn-outline-danger btn-lg position-absolute top-0 end-0 m-3`}
            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} fs-5`}></i>{' '}
            {isFavorite ? 'Remove' : 'Add'}
          </button>
        </div>
      )}

      {canEdit && (
        <div className="mt-4 d-flex justify-content-end gap-2 me-3">
          <Link
            href={`/recipe/edit/${recipeId}`}
            className="btn btn-outline-warning btn-lg d-flex align-items-center gap-2"
          >
            <i className="bi bi-pencil-square fs-5"></i>
            <span>Sửa công thức</span>
          </Link>
          <button
            onClick={handleDelete}
            className="btn btn-outline-danger btn-lg d-flex align-items-center gap-2"
          >
            <i className="bi bi-trash fs-5"></i>
            <span>Xóa công thức</span>
          </button>
        </div>
      )}
    </>
  );
}
