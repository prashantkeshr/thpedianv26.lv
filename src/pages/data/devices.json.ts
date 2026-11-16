import type { APIRoute } from 'astro';
import { getAllDevices } from '../../services/deviceService';

export const GET: APIRoute = () => {
  const devices = getAllDevices().map(d => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    brand: d.brand,
    brandName: d.brandName,
    category: d.category,
    status: d.status,
    description: d.description,
    tags: d.tags,
    images: d.images.slice(0, 1),
    specs: d.specs,
    releasedAt: d.releasedAt,
  }));

  return new Response(JSON.stringify(devices), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
