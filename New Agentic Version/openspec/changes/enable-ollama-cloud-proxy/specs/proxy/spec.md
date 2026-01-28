## Change Requirements

### Requirement: Cloud Proxy

The system SHALL provide a development proxy to `https://ollama.com` to bypass CORS restrictions when using Cloud models.

- **Path**: `/ollama-cloud`
- **Target**: `https://ollama.com`
- **Behavior**: Forward all methods, headers (including Authorization), and rewrite the path.

### Requirement: Hybrid Configuration

The system SHALL support both local and cloud configurations.

- **Local**: `http://localhost:11434` (No Key required)
- **Cloud**: `/ollama-cloud` (Key required)
