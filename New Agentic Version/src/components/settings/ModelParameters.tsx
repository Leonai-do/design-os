
import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

const formatContextDisplay = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return value.toString();
};

export const ModelParameters: React.FC = () => {
    const provider = useSettingsStore(state => state.provider);
    const updateModelConfig = useSettingsStore(state => state.updateModelConfig);
    const params = provider.currentModelConfig?.parameters;

    const [contextInput, setContextInput] = useState<string>('');
    
    // Sync input with store value
    useEffect(() => {
        if (params?.numCtx) {
            setContextInput(params.numCtx.toString());
        }
    }, [params?.numCtx]);

    if (!params) return null;

    const maxContext = params.maxContextLength || 131072; // Default to 128k if not detected
    const currentContext = params.numCtx || 4096;

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        updateModelConfig({ numCtx: value });
        setContextInput(value.toString());
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContextInput(e.target.value);
    };

    const handleInputBlur = () => {
        let value = parseInt(contextInput);
        if (isNaN(value) || value < 512) value = 512;
        if (value > maxContext) value = maxContext;
        updateModelConfig({ numCtx: value });
        setContextInput(value.toString());
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };

    // Calculate slider position percentage for gradient styling
    const sliderPercent = ((currentContext - 512) / (maxContext - 512)) * 100;

    return (
        <div className="space-y-4 mt-6 border-t border-zinc-800 pt-4">
            <h3 className="text-sm font-medium text-zinc-400">Model Parameters</h3>
            
            <div className="space-y-4">
                {/* Temperature */}
                <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500">Temperature: {params.temperature}</label>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={params.temperature}
                        onChange={(e) => updateModelConfig({ temperature: parseFloat(e.target.value) })}
                        className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Context Window - Slider + Input */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-500">
                            Context Window
                        </label>
                        <span className="text-xs text-zinc-600">
                            Max: {formatContextDisplay(maxContext)}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Slider */}
                        <div className="flex-1 relative">
                            <input
                                type="range"
                                min="512"
                                max={maxContext}
                                step="512"
                                value={currentContext}
                                onChange={handleSliderChange}
                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${sliderPercent}%, #27272a ${sliderPercent}%, #27272a 100%)`
                                }}
                            />
                            {/* Scale markers */}
                            <div className="flex justify-between mt-1 px-0.5">
                                <span className="text-[9px] text-zinc-600">512</span>
                                <span className="text-[9px] text-zinc-600">{formatContextDisplay(Math.round(maxContext / 2))}</span>
                                <span className="text-[9px] text-zinc-600">{formatContextDisplay(maxContext)}</span>
                            </div>
                        </div>
                        
                        {/* Input box */}
                        <div className="w-24">
                            <input
                                type="text"
                                value={contextInput}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                onKeyDown={handleInputKeyDown}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 text-right focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    
                    {/* Current value display */}
                    <p className="text-[10px] text-zinc-600">
                        Current: {currentContext.toLocaleString()} tokens ({formatContextDisplay(currentContext)})
                    </p>
                </div>
            </div>
        </div>
    );
};
