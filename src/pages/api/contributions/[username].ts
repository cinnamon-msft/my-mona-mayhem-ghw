import type { APIRoute } from 'astro';

export const prerender = false;

const USERNAME_PATTERN = /^[a-zA-Z0-9-]{1,39}$/;
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
	data: unknown;
	expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function jsonResponse(body: unknown, status: number, extraHeaders?: Record<string, string>): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...JSON_HEADERS, ...extraHeaders },
	});
}

export const GET: APIRoute = async ({ params }) => {
	const { username } = params;

	if (!username || !USERNAME_PATTERN.test(username)) {
		return jsonResponse({ error: 'Invalid username' }, 400);
	}

	const cached = cache.get(username);
	if (cached && cached.expiresAt > Date.now()) {
		return jsonResponse(cached.data, 200, { 'Cache-Control': 'public, max-age=300' });
	}

	try {
		const upstream = await fetch(`https://github.com/${username}.contribs`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; mona-mayhem/1.0)',
				'Accept': 'application/json',
			},
		});

		if (upstream.status === 404) {
			return jsonResponse({ error: 'GitHub user not found' }, 404);
		}

		if (!upstream.ok) {
			return jsonResponse({ error: `Upstream error: ${upstream.status}` }, 502);
		}

		const data: unknown = await upstream.json();
		cache.set(username, { data, expiresAt: Date.now() + CACHE_TTL_MS });

		return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=300' });
	} catch (err) {
		if (err instanceof SyntaxError) {
			return jsonResponse({ error: 'Invalid JSON from upstream' }, 502);
		}
		if (err instanceof TypeError) {
			// fetch() network failure
			return jsonResponse({ error: 'Failed to reach GitHub' }, 502);
		}
		return jsonResponse({ error: 'Internal server error' }, 500);
	}
};
