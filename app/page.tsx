import Link from 'next/link';
import Image from 'next/image';
import RecipeGrid from '@/components/RecipeGrid';
import CategoryCard from '@/components/CategoryCard';
import SectionHeader from '@/components/SectionHeader';
import type { HomepageData } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

async function getHomepageData(): Promise<HomepageData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/homepage`, {
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch homepage data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      categories: [],
      food: {
        latest: [],
        thai: [],
        american: [],
        chinese: [],
        vietnamese: [],
      },
      user: null,
    };
  }
}

export default async function HomePage() {
  const { categories, food, user } = await getHomepageData();

  return (
    <>
      {/* Hero Section */}
      <div className="row flex-lg-row-reverse align-items-center g-5 py-4 mb-4">
        <div className="col-12 col-lg-6">
          <Image 
            src="/img/hero-image.png" 
            className="d-block mx-lg-auto img-fluid rounded-3" 
            width={607} 
            height={510} 
            alt="Cooking"
            priority
          />
        </div>

        <div className="col-12 col-lg-6">
          <h1 className="display-5 fw-bold mb-3 text-success">
            Lựa chọn đa dạng các công thức nấu ăn thơm ngon
          </h1>
          <p className="lead text-muted">
            Khám phá vô vàn công thức nấu ăn hấp dẫn, từ món tráng miệng đơn giản, bữa tối bình thường và thuần chay thơm ngon, bánh nướng nhanh gọn, đến những bữa ăn ấm cúng cho gia đình.
          </p>

          <div className="d-grid gap-2 d-md-flex justify-content-md-start">
            <Link href="/explore-latest" className="btn btn-primary btn-lg px-4 py-3 me-md-2">
              Khám phá công thức mới nhất
            </Link>
            <Link href="/explore-random" className="btn btn-random btn-lg px-4 py-3">
              Làm tôi bất ngờ đi!
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="row row-cols-2 row-cols-lg-6 g-2 g-lg-3 py-4">
        {categories.map((category) => (
          <div key={category._id} className="col">
            <CategoryCard category={category} />
          </div>
        ))}
        <div className="col">
          <CategoryCard 
            category={{ _id: 'view-all', name: 'Xem tất cả', image: 'view-all.jpg' }}
            href="/categories"
          />
        </div>
      </div>

      {/* Latest Recipes Section */}
      <section className="pb-4 pt-4">
        <SectionHeader 
          title="Công thức mới nhất" 
          viewMoreHref="/explore-latest" 
        />
        <RecipeGrid recipes={food.latest} emptyMessage="No items found." />
      </section>

      {/* Favorite Recipes Section */}
      {user && Array.isArray(user.favorites) && user.favorites.length > 0 && (
        <section className="pb-4 pt-4">
          <div className="d-flex mb-2 align-items-center">
            <h2 className="fw-bold" style={{ textTransform: 'uppercase', color: '#ff4081' }}>
              Công thức yêu thích
            </h2>
            <Link href="/favorites" className="ms-auto text-decoration-none text-muted">
              Xem thêm
            </Link>
          </div>
          <RecipeGrid recipes={user.favorites} />
        </section>
      )}

      {/* Recipes by Country Sections */}
      {food.vietnamese && food.vietnamese.length > 0 && (
        <section className="pb-4 pt-4">
          <SectionHeader 
            title="Công thức Việt" 
            viewMoreHref="/categories/Việt" 
          />
          <RecipeGrid recipes={food.vietnamese} />
        </section>
      )}

      {food.thai && food.thai.length > 0 && (
        <section className="pb-4 pt-4">
          <SectionHeader 
            title="Công thức Thái" 
            viewMoreHref="/categories/Thái" 
          />
          <RecipeGrid recipes={food.thai} />
        </section>
      )}

      {food.american && food.american.length > 0 && (
        <section className="pb-4 pt-4">
          <SectionHeader 
            title="Công thức Mỹ" 
            viewMoreHref="/categories/Mỹ" 
          />
          <RecipeGrid recipes={food.american} />
        </section>
      )}

      {food.chinese && food.chinese.length > 0 && (
        <section className="pb-4 pt-4">
          <SectionHeader 
            title="Công thức Trung" 
            viewMoreHref="/categories/Trung" 
          />
          <RecipeGrid recipes={food.chinese} />
        </section>
      )}

      {/* Submit Recipe Section */}
      <section className="px-4 py-5 my-5 text-center">
        <Image 
          src="/img/publish-recipe.png" 
          className="d-block mx-auto mb-4 img-fluid" 
          alt="Publish your recipe for FREE today" 
          width={566} 
          height={208}
        />
        <h1 className="display-5 fw-bold">Đăng công thức của bạn</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">
            Chia sẻ công thức nấu ăn của bạn cho mọi người cùng thưởng thức.
          </p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <Link href="/submit-recipe" className="btn btn-primary btn-dark btn-lg">
              Đăng công thức
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
