import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  viewMoreHref?: string;
  viewMoreText?: string;
  className?: string;
}

const SectionHeader = ({ 
  title, 
  viewMoreHref, 
  viewMoreText = 'Xem thêm',
  className = ''
}: SectionHeaderProps) => {
  return (
    <div className={`d-flex mb-2 align-items-center ${className}`}>
      <h2 className="text-primary fw-bold" style={{ textTransform: 'uppercase' }}>
        {title}
      </h2>
      {viewMoreHref && (
        <Link href={viewMoreHref} className="ms-auto text-decoration-none text-muted">
          {viewMoreText}
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
