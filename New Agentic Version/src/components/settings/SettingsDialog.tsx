
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { ProviderConfigForm } from './ProviderConfigForm';

export const SettingsDialog: React.FC = () => {
    const { isOpen, toggleSettings } = useSettingsStore();

    return (
        <Dialog.Root open={isOpen} onOpenChange={toggleSettings}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-800 bg-zinc-950 p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl">
                    <div className="flex flex-col gap-1.5 text-center sm:text-left">
                        <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-white flex items-center gap-2">
                             <SettingsIcon size={18} />
                             AI Provider Settings
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-zinc-400">
                            Configure your local or cloud AI provider connection.
                        </Dialog.Description>
                    </div>
                    
                    <ProviderConfigForm />
                    
                    <Dialog.Close asChild>
                        <button
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-zinc-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-zinc-800"
                        >
                            <X className="h-4 w-4 text-zinc-400" />
                            <span className="sr-only">Close</span>
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
