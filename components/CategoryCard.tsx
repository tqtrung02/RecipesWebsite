import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  category: {
    _id: string;
    name: string;
    image: string;
  };
  href?: string;
  className?: string;
}

const CategoryCard = ({ 
  category, 
  href,
  className = '' 
}: CategoryCardProps) => {
  const categoryHref = href || `/categories/${category.name}`;

  return (
    <Link
      href={categoryHref}
      className={`text-center category__link ${className}`}
    >
      <div className="category__img shadow rounded">
        <Image
          src={`/img/${category.image}`}
          alt={category.name}
          width={120}
          height={120}
          className="img-fluid"
          style={{ 
            objectFit: 'contain',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </div>
      <div className="pt-1 fw-bold">{category.name}</div>
    </Link>
  );
};

export default CategoryCard;
