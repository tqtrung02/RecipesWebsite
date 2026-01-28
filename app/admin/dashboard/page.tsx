import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { imageApi } from '@/lib/api';
import AdminUserTable from '@/components/AdminUserTable';

interface Recipe {
  _id: string;
  name: string;
  image: string;
}


async function getAdminData(page: number = 1) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  try {
    // Check if user is admin
    const userResponse = await fetch(`${API_BASE_URL}/api/user/current`, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!userResponse.ok) {
      redirect('/login');
    }

    const user = await userResponse.json();
    if (user.role !== 'admin') {
      redirect('/');
    }

    // Fetch recipes
    const recipesResponse = await fetch(`${API_BASE_URL}/api/admin/recipes?page=${page}`, {
      credentials: 'include',
      cache: 'no-store',
    });

    // Fetch users
    const usersResponse = await fetch(`${API_BASE_URL}/api/admin/users`, {
      credentials: 'include',
      cache: 'no-store',
    });

    const recipesData = recipesResponse.ok ? await recipesResponse.json() : { recipes: [], totalPages: 1, currentPage: 1 };
    const users = usersResponse.ok ? await usersResponse.json() : [];

    return { recipes: recipesData.recipes, totalPages: recipesData.totalPages, currentPage: recipesData.currentPage, users };
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return { recipes: [], totalPages: 1, currentPage: 1, users: [] };
  }
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const { recipes, totalPages, currentPage, users } = await getAdminData(page);

  return (
    <div className="container py-4">
      {/* Recipes Section */}
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4 text-success">Quản lý công thức</h2>
          {recipes.length > 0 ? (
            <>
              <div className="row row-cols-2 row-cols-lg-5 g-2 g-lg-3">
                {recipes.map((recipe: Recipe) => (
                  <Link
                    key={recipe._id}
                    href={`/recipe/${recipe._id}`}
                    className="col text-center category__link"
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
                    <div className="pt-1 fw-bold">{recipe.name}</div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Page navigation" className="mt-4">
                  <ul className="pagination justify-content-center">
                    {currentPage > 1 && (
                      <li className="page-item">
                        <Link className="page-link" href={`/admin/dashboard?page=${currentPage - 1}`}>
                          Trước
                        </Link>
                      </li>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <li
                        key={pageNum}
                        className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        <Link className="page-link" href={`/admin/dashboard?page=${pageNum}`}>
                          {pageNum}
                        </Link>
                      </li>
                    ))}

                    {currentPage < totalPages && (
                      <li className="page-item">
                        <Link className="page-link" href={`/admin/dashboard?page=${currentPage + 1}`}>
                          Tiếp
                        </Link>
                      </li>
                    )}
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <p>No items found.</p>
          )}
        </div>
      </div>

      {/* Users Section */}
      <div className="row mt-5">
        <div className="col-12">
          <h2 className="mb-4 text-info">Quản lý người dùng</h2>
          <AdminUserTable users={users} />
        </div>
      </div>
    </div>
  );
}
