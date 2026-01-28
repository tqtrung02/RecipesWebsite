'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
}

export default function SubmitRecipePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
        // Fetch user
        const userResponse = await fetch(`${API_BASE_URL}/api/user/current`, {
          credentials: 'include',
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        } else {
          router.push('/login');
          return;
        }

        // Fetch categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/api/categories`, {
          credentials: 'include',
        });
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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
    } else {
      setError('Vui lòng chọn hình ảnh.');
      setSubmitting(false);
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const response = await fetch(`${API_BASE_URL}/submit-recipe`, {
        method: 'POST',
        credentials: 'include',
        body: submitData,
      });

      if (response.ok) {
        const data = await response.text();
        // Try to extract recipe ID from redirect or response
        setSuccess('Công thức đã được đăng thành công!');
        setTimeout(() => {
          router.push('/my-recipes');
        }, 1500);
      } else {
        setError('Có lỗi xảy ra khi đăng công thức.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng công thức.');
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

  if (!user) {
    return null;
  }

  return (
    <div className="container py-4">
      <div className="px-4 py-5 my-5 text-center">
        <h1 className="display-5 fw-bold">Đăng công thức của bạn</h1>
        <Image
          src="/img/—Pngtree—recipe book vector_12159143.png"
          alt="Recipe Image"
          width={400}
          height={300}
          className="img-fluid"
        />
        <div className="col-lg-6 mx-auto">
          <p className="lead">
            Chia sẻ những công thức nấu ăn tuyệt vời của bạn với mọi người. Điền vào biểu mẫu để bắt đầu ngay!
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
                  style={{ overflow: 'hidden', resize: 'none' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Nguyên liệu</label>
                <br />
                <small>Ví dụ: Muối</small>
                <div className="ingredientList">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredientDiv mb-1 position-relative">
                      <input
                        type="text"
                        className="form-control ps-3 pe-5"
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        required={index === 0}
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
                <label htmlFor="image">Hình ảnh</label>
                <input
                  type="file"
                  className="form-control"
                  name="image"
                  accept="image/*"
                  required
                />
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang đăng...' : 'Đăng công thức'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
