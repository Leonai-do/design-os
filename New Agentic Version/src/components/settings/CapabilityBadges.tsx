
import React from 'react';
import { Eye, Wrench, Brain, Database, Check, X } from 'lucide-react';
import { ModelConfig } from '../../store/settingsStore';

interface CapabilityBadgesProps {
  capabilities?: ModelConfig['capabilities'];
}

export const CapabilityBadges: React.FC<CapabilityBadgesProps> = ({ capabilities }) => {
  const Badge = ({ active, icon: Icon, label }: { active: boolean; icon: any; label: string }) => (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
        active
          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'
      }`}
      title={`${label} ${active ? 'Supported' : 'Not Supported'}`}
    >
      <Icon size={12} />
      <span>{label}</span>
      {active ? <Check size={10} className="ml-0.5" /> : <X size={10} className="ml-0.5" />}
    </div>
  );

  // Defaults if undefined
  const caps = capabilities || { vision: false, tools: false, thinking: false, embedding: false };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <Badge active={caps.vision} icon={Eye} label="Vision" />
      <Badge active={caps.tools} icon={Wrench} label="Tools" />
      <Badge active={caps.thinking} icon={Brain} label="Thinking" />
      <Badge active={caps.embedding} icon={Database} label="Embedding" />
    </div>
  );
};
