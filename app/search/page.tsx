'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import RecipeGrid from '@/components/RecipeGrid';
import type { Recipe } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'ingredients'>('name');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = searchParams.get('q');
    const type = searchParams.get('type') as 'name' | 'ingredients' || 'name';
    
    if (term) {
      setSearchTerm(term);
      setSearchType(type);
      handleSearch(term, type);
    }
  }, [searchParams]);

  const handleSearch = async (term: string, type: 'name' | 'ingredients') => {
    if (!term.trim()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('searchTerm', term);
      formData.append('searchType', type);

      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
        setSearchTerm(data.searchTerm || term);
        setSearchType(data.searchType || type);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const term = formData.get('searchTerm') as string;
    const type = formData.get('searchType') as 'name' | 'ingredients';
    handleSearch(term, type);
  };

  return (
    <div className="container py-4">
      <h1 className="pb-4">
        Kết quả tìm kiếm của{' '}
        {searchType === 'name' ? (
          <>tên: <strong>{searchTerm}</strong></>
        ) : (
          <>nguyên liệu: <strong>{searchTerm}</strong></>
        )}
      </h1>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tìm kiếm...</span>
          </div>
        </div>
      ) : recipes.length > 0 ? (
        <RecipeGrid recipes={recipes} />
      ) : searchTerm ? (
        <p className="text-center">Không tìm thấy công thức.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="input-group mb-3">
            <input
              type="search"
              name="searchTerm"
              className="form-control form-control-lg"
              placeholder="Tìm công thức..."
              required
            />
            <select name="searchType" className="form-select form-control-lg" defaultValue="name">
              <option value="name">Theo tên</option>
              <option value="ingredients">Theo nguyên liệu</option>
            </select>
            <button className="btn btn-primary btn-lg" type="submit">
              <i className="bi bi-search"></i> Tìm kiếm
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
