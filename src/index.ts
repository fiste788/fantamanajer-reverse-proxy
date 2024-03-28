export default {
	async fetch(request: Request, env: Env, context: ExecutionContext) {
		// new URL object to play with,
		// based on the one being requested.
		// e.g. https://domain.com/blog/page
		var url = new URL(request.url);

		// Construct the cache key from the cache URL
		const cacheKey = new Request(url.toString(), request);
		const cache = caches.default;

		// Check whether the value is already available in the cache
		// if not, you will need to fetch it from R2, and store it in the cache
		// for future access
		let response = await cache.match(cacheKey);

		if (response) {
			console.log(`Cache hit for: ${request.url}.`);
			return response;
		}


		// set hostname to the place we're proxying requests from
		url.hostname = env.API_HOST;
		url.protocol = env.API_PROTOCOL;
		url.port = env.API_PORT;

		// remove the first occurence of /blog
		// so it requests / of the proxy domain
		url.pathname = url.pathname.replace('api/', '');
		// pass the modified url back to the request,

		const date = new Date();
		console.log(`Fetching: ${url.toString()}`);
		response = await fetch(url, request);
		//response = await onRequestGet(context, env);
		console.log('Fetched' , Date.now() - date.getTime())
		if (response.headers.has('Expires')) {
			context.waitUntil(cache.put(cacheKey, response.clone()));
		} else {
			console.log('Not has expires');
		}
		return response;
	},
};
