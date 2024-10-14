export default {
	async fetch(request: Request, env: Env, context: ExecutionContext) {
		// new URL object to play with,
		// based on the one being requested.
		// e.g. https://domain.com/blog/page
		var url = new URL(request.url);

		// set hostname to the place we're proxying requests from
		url.hostname = env.API_HOST;
		url.protocol = env.API_PROTOCOL;
		url.port = env.API_PORT;

		// remove the first occurence of /blog
		// so it requests / of the proxy domain
		url.pathname = url.pathname.replace('/api', '');
		// pass the modified url back to the request,

		let response = await fetch(url, request);
		console.log('Fetched', response);
		return response;
	},
};
