## Why

The user wants to use Ollama Cloud models (e.g., `kimi-k2.5:cloud`) via an API Key.

- Direct Browser -> `ollama.com` connection is blocked by CORS.
- Browser -> `localhost:11434` -> `ollama.com` fails because the local instance is not signed in, and does not forward the API Key from the client.

## What Changes

- **Vite Configuration**: Add a server proxy rule to `vite.config.ts`.
  - Path: `/api/ollama-cloud` -> Target: `https://ollama.com`
  - This bypasses CORS and allows the browser to communicate "directly" with Ollama Cloud using the API Key.
- **Documentation**: Update instructions to guide the user to use `/api/ollama-cloud` as the Endpoint URL when using the Cloud Key.

## Impact

- **Enables Cloud Models**: Users can uses models like `kimi-k2.5:cloud` by providing their API Key in settings and pointing to the local proxy.
- **Security**: API Key is passed via headers through the local dev server.
