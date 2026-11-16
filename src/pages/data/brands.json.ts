import type { APIRoute } from 'astro';
import { getAllBrands } from '../../services/brandService';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getAllBrands()), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
