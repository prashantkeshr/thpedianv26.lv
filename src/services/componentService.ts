import type { ElectronicComponent } from '../types';
import componentsData from '../../datasets/normalized/components.json';

const components: ElectronicComponent[] = componentsData as unknown as ElectronicComponent[];

export function getAllComponents(): ElectronicComponent[] {
  return components;
}

export function getComponentBySlug(slug: string): ElectronicComponent | undefined {
  return components.find(c => c.slug === slug);
}

export function getComponentsByCategory(category: string): ElectronicComponent[] {
  return components.filter(c => c.category === category);
}

export function getComponentByPartNumber(partNumber: string): ElectronicComponent | undefined {
  return components.find(c =>
    c.partNumber.toLowerCase() === partNumber.toLowerCase()
  );
}

export function getAllComponentCategories(): string[] {
  return [...new Set(components.map(c => c.category))];
}

export function getComponentCount(): number {
  return components.length;
}
