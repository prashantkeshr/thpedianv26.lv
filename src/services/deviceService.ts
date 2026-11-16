import type { Device } from '../types';
import devicesData from '../../datasets/normalized/devices.json';

const devices: Device[] = devicesData as unknown as Device[];

export function getAllDevices(): Device[] {
  return devices;
}

export function getDeviceBySlug(slug: string): Device | undefined {
  return devices.find(d => d.slug === slug);
}

export function getDevicesByCategory(category: string): Device[] {
  return devices.filter(d => d.category === category);
}

export function getDevicesByBrand(brandId: string): Device[] {
  return devices.filter(d => d.brand === brandId);
}

export function getDevicesByIds(ids: string[]): Device[] {
  return ids.map(id => devices.find(d => d.id === id)).filter(Boolean) as Device[];
}

export function getRelatedDevices(device: Device, limit = 4): Device[] {
  return device.relatedIds
    .map(id => devices.find(d => d.id === id))
    .filter(Boolean)
    .slice(0, limit) as Device[];
}

export function getAllCategories(): string[] {
  return [...new Set(devices.map(d => d.category))];
}

export function getDeviceCount(): number {
  return devices.length;
}
