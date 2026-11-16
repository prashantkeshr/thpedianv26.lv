import type { APIRoute } from 'astro';
import { getAllComponents } from '../../services/componentService';

export const GET: APIRoute = () => {
  const components = getAllComponents().map(c => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    commonNames: c.commonNames,
    manufacturerName: c.manufacturerName,
    partNumber: c.partNumber,
    category: c.category,
    description: c.description,
    images: c.images.slice(0, 1),
    specs: c.specs,
    packageType: c.packageType,
  }));

  return new Response(JSON.stringify(components), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
