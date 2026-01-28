
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Layers, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { PhaseNav } from './PhaseNav'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'
import { FileExplorer } from './FileExplorer'
import { CodeEditor } from './CodeEditor'
import { useDesignStore } from '../lib/store'
import { useSettingsStore } from '../store/settingsStore'
import { SettingsDialog } from './settings/SettingsDialog'
import { generateFileContent } from '../lib/generators'
import { cn } from '../lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  backTo?: string
  backLabel?: string
  showPhaseNav?: boolean
  mode?: 'dashboard' | 'ide' | 'preview'
}

interface ActiveFile {
  name: string;
  content: string;
  language: string;
  path: string; // Added path to robustly track file
}

export function AppLayout({
  children,
  title,
  backTo,
  backLabel = 'Back',
  showPhaseNav = true,
  mode = 'dashboard'
}: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSubPage = !!backTo
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeFile, setActiveFile] = useState<ActiveFile | null>(null)
  
  // Settings
  const toggleSettings = useSettingsStore(state => state.toggleSettings)
  
  // Sync content
  const { data, addCustomFile } = useDesignStore()

  // Clear active file when navigating to a different dashboard page
  useEffect(() => {
    setActiveFile(null);
  }, [location.pathname]);

  // Close editor if active file is deleted (checked via hiddenFiles)
  useEffect(() => {
    if (activeFile && data.hiddenFiles?.includes(activeFile.path)) {
        setActiveFile(null);
    }
  }, [data.hiddenFiles, activeFile]);

  // SYNC: Update active file content when store data changes
  useEffect(() => {
    if (activeFile) {
        // Regenerate content based on path
        const newContent = generateFileContent(activeFile.path, data);
        if (newContent !== activeFile.content) {
            setActiveFile(prev => prev ? ({ ...prev, content: newContent }) : null);
        }
    }
  }, [data, activeFile?.path]); 

  const handleFileSelect = (file: { name: string, content: string, language: string, path: string }) => {
    setActiveFile(file);
  }

  const handleCloseEditor = () => {
    setActiveFile(null);
  }

  const handleSaveFile = (newContent: string) => {
    if (activeFile) {
        addCustomFile(activeFile.path, newContent);
    }
  }

  return (
    <div className="h-screen bg-background animate-fade-in flex flex-col overflow-hidden">
      <SettingsDialog />
      
      {/* Top Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm z-20 shrink-0">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-48">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" onClick={() => setShowSidebar(!showSidebar)}>
                  {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
               </Button>
               {isSubPage ? (
                 <Button variant="ghost" size="sm" onClick={() => backTo && navigate(backTo)} className="-ml-2 h-8">
                   <ArrowLeft className="w-4 h-4 mr-2" />
                   {backLabel}
                 </Button>
               ) : (
                <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                   <div className="w-6 h-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-black">
                      <Layers className="w-3.5 h-3.5" />
                   </div>
                   <span className="hidden sm:inline">Design OS</span>
                </div>
               )}
            </div>

            {showPhaseNav && (
              <div className="flex-1 flex justify-center">
                <PhaseNav onNavigate={() => setActiveFile(null)} />
              </div>
            )}

            <div className="w-48 flex justify-end">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main IDE Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-zinc-50 dark:bg-zinc-950/50 transition-all duration-300">
             <div className="flex-1 min-h-0 relative">
                 <FileExplorer 
                    onSelectFile={handleFileSelect} 
                    selectedFileName={activeFile?.name}
                 />
             </div>
             <div className="p-2 border-t border-border shrink-0 bg-zinc-50 dark:bg-zinc-950">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 gap-2" 
                    onClick={() => toggleSettings(true)}
                >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </Button>
             </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full relative bg-background overflow-hidden flex flex-col">
           {activeFile ? (
             // Code Mode (Editor)
             <div className="flex-1 h-full">
               <CodeEditor 
                  filename={activeFile.name}
                  initialValue={activeFile.content}
                  language={activeFile.language}
                  onClose={handleCloseEditor}
                  onSave={handleSaveFile}
               />
             </div>
           ) : (
             // Content Mode (Dashboard/IDE/Preview)
             <div className={cn(
               "flex-1 overflow-y-auto",
               mode === 'preview' ? "bg-zinc-100 dark:bg-zinc-900" : ""
             )}>
               {mode === 'dashboard' ? (
                 <div className="max-w-5xl mx-auto px-6 py-10 min-h-full">
                    {title && <h1 className="text-3xl font-bold mb-8 tracking-tight">{title}</h1>}
                    {children}
                 </div>
               ) : mode === 'ide' ? (
                 <div className="h-full flex flex-col">
                    {title && <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                        <h1 className="text-lg font-semibold">{title}</h1>
                    </div>}
                    <div className="flex-1 overflow-y-auto p-6">
                        {children}
                    </div>
                 </div>
               ) : (
                 // Preview Mode - absolute freedom for children
                 <div className="h-full w-full flex flex-col">
                    {children}
                 </div>
               )}
             </div>
           )}
        </main>
      </div>
    </div>
  )
}
