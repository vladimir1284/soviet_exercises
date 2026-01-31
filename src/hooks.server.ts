import type { Handle } from '@sveltekit/kit';
import { VITE_CLERK_PUBLISHABLE_KEY } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			// Prioritize Cloudflare env var, fallback to local .env
            // In dev, always use the local key
			const clerkKey = import.meta.env.DEV 
                ? VITE_CLERK_PUBLISHABLE_KEY 
                : (event.platform?.env?.PUBLIC_CLERK_PUBLISHABLE_KEY || VITE_CLERK_PUBLISHABLE_KEY);
			
            if (!clerkKey) {
                console.warn('Clerk publishable key not found');
            }

			return html.replace('%clerk_publishable_key%', clerkKey || '');
		}
	});

	return response;
};
