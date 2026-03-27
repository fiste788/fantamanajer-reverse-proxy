export default {
	async fetch(request: Request, env: Env, context: ExecutionContext) {
		const url = new URL(request.url);

		url.hostname = env.API_HOST;
		url.protocol = env.API_PROTOCOL;
		url.port = env.API_PORT;

		url.pathname = url.pathname.replace('/api', '').replace('/backend', '');

		// In Cloudflare, invece di keepalive, usiamo un oggetto Request pulito.
		// Il motore v8 di Cloudflare riutilizzerà le connessioni TCP/TLS verso
		// lo stesso hostname automaticamente (Connection Pooling).
		const modifiedRequest = new Request(url, {
			method: request.method,
			headers: request.headers,
			body: request.body,
			redirect: 'manual',
		});

		try {
			// Effettuiamo la fetch.
			// Nota: Non aggiungere keepalive qui se TS si lamenta.
			const response = await fetch(modifiedRequest);

			// Fondamentale: Cloudflare mantiene la connessione "calda" verso l'origine
			// solo se il body della risposta viene passato correttamente al client.
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
		} catch (e) {
			return new Response("Errore di connessione all'origine", { status: 502 });
		}
	},
};
