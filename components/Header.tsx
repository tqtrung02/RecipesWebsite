'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      try {
        const currentUser = await userApi.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await userApi.logout();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}`;
    }
  };

  const renderUserIcon = (userRole: string) => {
    if (userRole === 'admin') {
      return <i className="bi bi-shield-lock-fill ms-2" style={{ color: '#dc3545' }} title="Admin"></i>;
    }
    return <i className="bi bi-person-circle ms-2" style={{ color: '#0d6efd' }} title="User"></i>;
  };

  const renderUserGreeting = () => {
    // Prevent hydration mismatch by showing same initial state on server and client
    if (!mounted || loading) {
      return (
        <div className="p-2 rounded-4 bg-white d-inline-block">
          <h2 className="mb-0 fw-bold text-muted fs-4">Đang tải...</h2>
        </div>
      );
    }

    if (user) {
      return (
        <div className="p-2 rounded-4 bg-white d-inline-block animate__animated animate__fadeInDown">
          <h2 className="mb-0 fw-bold text-success fs-4">
            Xin chào,
            <span className="text-primary ms-1">
              {user.name}
            </span>
            {renderUserIcon(user.role)}
          </h2>
        </div>
      );
    }

    return (
      <div className="p-2 rounded-4 bg-white d-inline-block animate__animated animate__fadeInDown">
        <h2 className="mb-0 fw-bold text-warning fs-4">
          Xin chào, khách tham quan!
          <i className="bi bi-emoji-smile ms-2" style={{ color: '#ffc107' }}></i>
        </h2>
      </div>
    );
  };

  return (
    <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom" style={{ backgroundColor: '#ffffff' }}>
      <Link href="/" className="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none">
        <div className="d-flex align-items-center">
          <i className="bi bi-journal-bookmark-fill text-success me-2" style={{ fontSize: '2.2rem' }}></i>
          <div className="d-flex flex-column">
            <span className="fw-bold text-success" style={{ fontSize: '1.4rem', lineHeight: '1.2' }}>FoodRecipes</span>
            <small className="text-muted" style={{ fontSize: '0.7rem' }}>Công thức nấu ăn</small>
          </div>
        </div>
      </Link>

      <div className="col-md-6 text-end">
        {renderUserGreeting()}
      </div>

      <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0" style={{ fontWeight: 600 }}>
        <li><Link href="/" className="nav-link px-2 link-secondary fs-5"><i className="bi bi-house-door-fill me-1"></i> Trang chủ</Link></li>
        <li><Link href="/submit-recipe" className="nav-link px-2 link-secondary fs-5"><i className="bi bi-upload me-1"></i> Đăng công thức</Link></li>

        {!user && (
          <>
            <li><Link href="/signup" className="nav-link px-2 link-secondary fs-5"><i className="bi bi-person-plus-fill me-1"></i> Đăng ký</Link></li>
            <li><Link href="/login" className="nav-link px-2 link-secondary fs-5"><i className="bi bi-box-arrow-in-right me-1"></i> Đăng nhập</Link></li>
          </>
        )}

        {user && (
          <>
            <li><Link href="/profile" className="nav-link px-2 link-secondary fs-5"><i className="bi bi-person-circle me-1"></i> Thông tin người dùng</Link></li>
            <li><Link href="/my-recipes" className="nav-link px-2 link-secondary fs-5"><i className="bi bi-journal-text me-1"></i> Công thức của tôi</Link></li>
            <li>
              <button 
                onClick={handleLogout} 
                className="nav-link px-2 link-secondary fs-5 border-0 bg-transparent"
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Đăng xuất
              </button>
            </li>
          </>
        )}
      </ul>

      <form onSubmit={handleSearch} className="w-100 mb-3">
        <div className="row g-2">
          <div className="col-md-8 col-lg-9">
            <div className="input-group input-group-lg shadow-sm">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control border-start-0 ps-0" 
                placeholder="Tìm công thức..." 
                aria-label="Tìm kiếm công thức"
                style={{ fontSize: '1rem' }}
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-3">
            <div className="input-group input-group-lg shadow-sm">
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="form-select" 
                aria-label="Loại tìm kiếm"
                style={{ fontSize: '1rem' }}
              >
                <option value="name">Theo tên</option>
                <option value="ingredients">Theo nguyên liệu</option>
              </select>
              <button 
                className="btn btn-primary d-flex align-items-center justify-content-center" 
                type="submit"
                style={{ minWidth: '50px' }}
                title="Tìm kiếm"
              >
                <i className="bi bi-search fs-5"></i>
              </button>
            </div>
          </div>
        </div>
      </form>

      {mounted && user && user.role === 'admin' && (
        <div className="row justify-content-center mb-3 w-100">
          <div className="col-auto">
            <Link href="/admin/dashboard" className="btn btn-success d-flex align-items-center justify-content-center p-2 px-4 rounded-3 shadow-lg text-white fw-bold">
              <i className="bi bi-shield-check me-2"></i> Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
