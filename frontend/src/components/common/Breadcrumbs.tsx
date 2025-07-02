'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={`${styles.breadcrumbs} ${className || ''}`} aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <Link href="/" className={styles.breadcrumbLink}>
            <Home size={16} />
            <span className={styles.srOnly}>Home</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className={styles.breadcrumbItem}>
            <ChevronRight size={16} className={styles.breadcrumbSeparator} />
            {item.current || !item.href ? (
              <span className={styles.breadcrumbCurrent} aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className={styles.breadcrumbLink}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
