import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string; // if absent, renders as plain text (current page)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs mb-3">
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1">
        {i > 0 && (
          <span className="text-ink-soft" aria-hidden="true">/</span>
        )}
        {item.to ? (
          <Link
            to={item.to}
            className="text-link hover:text-link-hover no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-ink" aria-current="page">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;
