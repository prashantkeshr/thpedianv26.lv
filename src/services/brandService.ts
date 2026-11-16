import type { Brand } from '../types';
import brandsData from '../../datasets/normalized/brands.json';

const brands: Brand[] = brandsData as unknown as Brand[];

export function getAllBrands(): Brand[] {
  return brands;
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find(b => b.slug === slug);
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find(b => b.id === id);
}

export function getBrandCount(): number {
  return brands.length;
}
