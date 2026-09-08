import type { Handle } from '@sveltekit/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			// Prioritize Cloudflare env var, fallback to dynamic env var or import.meta.env
			const clerkKey = import.meta.env.DEV 
				? (env.VITE_CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || '')
				: (event.platform?.env?.PUBLIC_CLERK_PUBLISHABLE_KEY || env.VITE_CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || '');
			
			if (!clerkKey) {
				console.warn('Clerk publishable key not found');
			}

			return html.replace('%clerk_publishable_key%', clerkKey || '');
		}
	});

	return response;
};
