
import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../src/store/settingsStore';

describe('Settings Store', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should have default state', () => {
        const state = useSettingsStore.getState();
        expect(state.provider.url).toBe('http://localhost:11434');
        expect(state.provider.selectedModel).toBe('kimi-k2.5:cloud');
        expect(state.isOpen).toBe(false);
    });

    it('should update provider url', () => {
        useSettingsStore.getState().setProviderUrl('http://test-url');
        expect(useSettingsStore.getState().provider.url).toBe('http://test-url');
    });

    it('should update selected model', () => {
        useSettingsStore.getState().setSelectedModel('new-model');
        expect(useSettingsStore.getState().provider.selectedModel).toBe('new-model');
        expect(useSettingsStore.getState().provider.currentModelConfig?.name).toBe('new-model');
    });
});
