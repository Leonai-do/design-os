
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkConnection, detectCapabilities } from '../src/services/ollama';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Ollama Service', () => {
    beforeEach(() => {
        fetchMock.mockClear();
    });

    describe('checkConnection', () => {
        it('should return true when response is ok', async () => {
            fetchMock.mockResolvedValueOnce({ ok: true });
            const result = await checkConnection('http://localhost:11434');
            expect(result).toBe(true);
            expect(fetchMock).toHaveBeenCalledWith('http://localhost:11434/', { method: 'GET' });
        });

        it('should return false when response is not ok', async () => {
             fetchMock.mockResolvedValueOnce({ ok: false });
             const result = await checkConnection('http://localhost:11434');
             expect(result).toBe(false);
        });

        it('should return false on network error', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Network error'));
            const result = await checkConnection('http://localhost:11434');
            expect(result).toBe(false);
        });
    });

    describe('detectCapabilities', () => {
        it('should detect vision from capabilities array', () => {
             const caps = detectCapabilities('gemma3', { capabilities: ['vision'] });
             expect(caps.vision).toBe(true);
        });

        it('should detect thinking from model name', () => {
            const caps = detectCapabilities('deepseek-r1:latest', null);
            expect(caps.thinking).toBe(true);
        });
        
        it('should detect tools from modelfile template', () => {
             const caps = detectCapabilities('mistral:latest', { modelfile: 'TEMPLATE "{{ if .Tools }}...{{ end }}"' });
             expect(caps.tools).toBe(true);
        });
    });
});
