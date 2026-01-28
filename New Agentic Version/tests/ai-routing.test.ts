
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateContent, generateStructured } from '../src/lib/ai/client';
import { useSettingsStore } from '../src/store/settingsStore';

// Mock dependencies
vi.mock('../src/store/settingsStore');

// Mock fetch for Ollama tests
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('AI Client Routing', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchMock.mockClear();
    });

    it('should route to Ollama when configured', async () => {
        // Setup store mock
        vi.mocked(useSettingsStore.getState).mockReturnValue({
            provider: {
                url: 'http://test-ollama',
                selectedModel: 'llama3',
                models: ['llama3'],
                currentModelConfig: {}
            }
        } as any);

        // Mock Ollama response
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: { content: 'Ollama Response' } })
        });

        const result = await generateContent('test prompt', 'sys');
        
        expect(result).toBe('Ollama Response');
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('http://test-ollama/api/chat'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"model":"llama3"')
            })
        );
    });

    it('should support structured generation via Ollama', async () => {
         vi.mocked(useSettingsStore.getState).mockReturnValue({
            provider: {
                url: 'http://test-ollama',
                selectedModel: 'llama3',
                models: ['llama3'],
                currentModelConfig: {}
            }
        } as any);

        const expectedJson = { data: { intent: 'vision' }, message: 'ok' };
        
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: { content: JSON.stringify(expectedJson) } })
        });

        const result = await generateStructured('prompt', { type: 'object' }, 'sys');
        
        expect(result).toEqual(expectedJson);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('http://test-ollama/api/chat'),
            expect.objectContaining({
                body: expect.stringContaining('"format":"json"')
            })
        );
    });

    it('should inject Authorization header if apiKey is present', async () => {
        // Setup store mock with API Key
        vi.mocked(useSettingsStore.getState).mockReturnValue({
            provider: {
                url: 'http://test-ollama',
                selectedModel: 'llama3',
                models: ['llama3'],
                currentModelConfig: {},
                apiKey: 'test-api-key'
            }
        } as any);

        // Mock Ollama response
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: { content: 'Auth Response' } })
        });

        await generateContent('test prompt', 'sys');

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('http://test-ollama/api/chat'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-api-key'
                })
            })
        );
    });
});
