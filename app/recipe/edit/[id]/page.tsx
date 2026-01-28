'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { imageApi } from '@/lib/api';

interface Recipe {
  _id: string;
  name: string;
  description: string;
  ingredients: string[];
  category: string;
  image: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);

  useEffect(() => {
    const fetchData = async () => {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/recipe/${recipeId}/edit`, {
          credentials: 'include',
        });

        if (response.status === 401 || response.status === 403) {
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch recipe');
        }

        const data = await response.json();
        setRecipe(data.recipe);
        setCategories(data.categories);
        setIngredients(data.recipe.ingredients || ['']);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Không thể tải công thức.');
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchData();
    }
  }, [recipeId, router]);

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
    
    if (filteredIngredients.length === 0) {
      setError('Vui lòng thêm ít nhất một nguyên liệu.');
      setSubmitting(false);
      return;
    }

    const submitData = new FormData();
    submitData.append('name', formData.get('name') as string);
    submitData.append('description', formData.get('description') as string);
    submitData.append('category', formData.get('category') as string);
    filteredIngredients.forEach(ing => {
      submitData.append('ingredients', ing);
    });
    
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      submitData.append('image', imageFile);
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const response = await fetch(`${API_BASE_URL}/recipe/edit/${recipeId}`, {
        method: 'POST',
        credentials: 'include',
        body: submitData,
      });

      if (response.ok) {
        setSuccess('Công thức đã được cập nhật thành công!');
        setTimeout(() => {
          router.push(`/recipe/${recipeId}`);
        }, 1500);
      } else {
        setError('Có lỗi xảy ra khi cập nhật công thức.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật công thức.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Không tìm thấy công thức.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="px-4 py-5 my-5 text-center">
        <h1 className="display-5 fw-bold">Sửa công thức của bạn</h1>
        <Image
          src="/img/—Pngtree—recipe book vector_12159143.png"
          alt="Recipe Image"
          width={400}
          height={300}
          className="img-fluid"
        />
        <div className="col-lg-6 mx-auto">
          <p className="lead">
            Chỉnh sửa công thức nấu ăn của bạn. Điền vào biểu mẫu dưới đây để cập nhật công thức!
          </p>
        </div>
      </div>

      <div className="row justify-content-center">
        {error && (
          <div className="col-8 alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="col-8 alert alert-success" role="alert">
            {success}
          </div>
        )}

        <div className="col-8">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="name" className="form-label">Tên công thức</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="form-control"
                  defaultValue={recipe.name}
                  required
                />
              </div>

              <div className="col-12">
                <label htmlFor="description" className="form-label">Cách chế biến</label>
                <textarea
                  name="description"
                  id="description"
                  className="form-control"
                  cols={30}
                  rows={4}
                  defaultValue={recipe.description}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Nguyên liệu</label>
                <small> Ví dụ: Muối</small>
                <div className="ingredientList">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredientDiv mb-1 position-relative">
                      <input
                        type="text"
                        name="ingredients"
                        className="form-control ps-3 pe-5"
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        required
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-link text-danger position-absolute top-50 end-0 translate-middle-y"
                          onClick={() => removeIngredient(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addIngredient}
                >
                  + Nguyên liệu
                </button>
              </div>

              <div className="col-12">
                <label htmlFor="category">Chọn danh mục</label>
                <select
                  className="form-select form-control"
                  name="category"
                  aria-label="Category"
                  defaultValue={recipe.category}
                  required
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label htmlFor="image">Hình ảnh (để trống nếu không muốn thay đổi)</label>
                <input
                  type="file"
                  className="form-control"
                  name="image"
                  accept="image/*"
                />
                {recipe.image && (
                  <div className="mt-2">
                    <small>Hình ảnh hiện tại:</small>
                    <br />
                    <Image
                      src={imageApi.getImageUrl(recipe.image)}
                      alt={recipe.name}
                      width={200}
                      height={200}
                      className="img-thumbnail mt-2"
                    />
                  </div>
                )}
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang cập nhật...' : 'Cập nhật công thức'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
