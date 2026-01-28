## Implementation Details

### 1. Vite Proxy Configuration

- **Location**: `vite.config.ts`
- **Change**: Add a proxy rule to forward requests to `https://ollama.com`.

```typescript
server: {
  proxy: {
    '/ollama-cloud': {
      target: 'https://ollama.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/ollama-cloud/, '')
    }
  }
}
```

### 2. Service/Provider Logic

- **No changes needed** to `OllamaProvider` logic (it already handles Key + URL).
- **Usage**:
  - **Local**: User sets URL to `http://localhost:11434`. (API Key optional/empty).
  - **Cloud**: User sets URL to `/ollama-cloud`. (API Key required).

### 3. Verification

- Test connection to `/ollama-cloud` with the user's API key.
- Test connection to `http://localhost:11434` without key.
