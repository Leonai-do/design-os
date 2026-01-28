
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { 
  ProductData, 
  ProductOverview, 
  ProductRoadmap, 
  DataModel, 
  DesignSystem, 
  ShellInfo, 
  SectionSpec, 
  ScreenDesign, 
  SectionDetail,
  TrashItem
} from '../types';
import { generateFileContent } from './generators';
import { normalizePath } from './utils';

interface DesignStoreContextType {
  data: ProductData;
  updateOverview: (overview: ProductOverview) => void;
  updateRoadmap: (roadmap: ProductRoadmap) => void;
  updateDataModel: (dataModel: DataModel) => void;
  updateDesignSystem: (designSystem: DesignSystem) => void;
  updateShell: (shell: ShellInfo) => void;
  updateSectionSpec: (sectionId: string, spec: SectionSpec) => void;
  updateSectionData: (sectionId: string, data: string) => void;
  addScreenDesign: (sectionId: string, screen: ScreenDesign) => void;
  addCustomFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  restoreFile: (trashId: string) => void;
  permanentlyDeleteFile: (trashId: string) => void;
  reset: () => void;
}

const DesignStoreContext = createContext<DesignStoreContextType | undefined>(undefined);

const INITIAL_DATA: ProductData = {
  overview: null,
  roadmap: null,
  dataModel: null,
  designSystem: null,
  shell: null,
  sections: {},
  customFiles: [],
  trash: [],
  hiddenFiles: []
};

export function DesignStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ProductData>(INITIAL_DATA);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('design-os-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrations / Default Initializers
        if (!parsed.customFiles) parsed.customFiles = [];
        if (!parsed.sections) parsed.sections = {};
        if (!parsed.trash) parsed.trash = [];
        if (!parsed.hiddenFiles) {
            // Migration: Check for old 'design-os-deleted'
            const oldDeleted = localStorage.getItem('design-os-deleted');
            if (oldDeleted) {
                try {
                    parsed.hiddenFiles = JSON.parse(oldDeleted);
                } catch {
                    parsed.hiddenFiles = [];
                }
            } else {
                parsed.hiddenFiles = [];
            }
        }
        setData(parsed);
      } catch (e) {
        console.error("Failed to load design data", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('design-os-data', JSON.stringify(data));
  }, [data]);

  const updateOverview = (overview: ProductOverview) => setData(prev => ({ ...prev, overview }));
  const updateRoadmap = (roadmap: ProductRoadmap) => setData(prev => ({ ...prev, roadmap }));
  const updateDataModel = (dataModel: DataModel) => setData(prev => ({ ...prev, dataModel }));
  const updateDesignSystem = (designSystem: DesignSystem) => setData(prev => ({ ...prev, designSystem }));
  const updateShell = (shell: ShellInfo) => setData(prev => ({ ...prev, shell }));
  
  const updateSectionSpec = (sectionId: string, spec: SectionSpec) => {
    setData(prev => {
      const prevSections = prev.sections || {};
      const prevSection = prevSections[sectionId] || { id: sectionId, spec: null, sampleData: null, screens: [] };
      return {
        ...prev,
        sections: {
          ...prevSections,
          [sectionId]: { ...prevSection, spec }
        }
      };
    });
  };

  const updateSectionData = (sectionId: string, sampleData: string) => {
    setData(prev => {
      const prevSections = prev.sections || {};
      const prevSection = prevSections[sectionId] || { id: sectionId, spec: null, sampleData: null, screens: [] };
      return {
        ...prev,
        sections: {
          ...prevSections,
          [sectionId]: { ...prevSection, sampleData }
        }
      };
    });
  };

  const addScreenDesign = (sectionId: string, screen: ScreenDesign) => {
    setData(prev => {
      const prevSections = prev.sections || {};
      const prevSection = prevSections[sectionId] || { id: sectionId, spec: null, sampleData: null, screens: [] };
      
      const existingIdx = prevSection.screens.findIndex(s => s.id === screen.id);
      let newScreens = [...prevSection.screens];
      if (existingIdx >= 0) {
        newScreens[existingIdx] = screen;
      } else {
        newScreens.push(screen);
      }
      
      return {
        ...prev,
        sections: {
          ...prevSections,
          [sectionId]: { ...prevSection, screens: newScreens }
        }
      };
    });
  };

  const addCustomFile = (path: string, content: string) => {
    const cleanPath = normalizePath(path);

    setData(prev => {
      const existing = prev.customFiles || [];
      const filtered = existing.filter(f => normalizePath(f.path) !== cleanPath);
      
      // Also unhide if it was hidden
      const hiddenFiles = prev.hiddenFiles?.filter(f => normalizePath(f) !== cleanPath) || [];

      return {
        ...prev,
        customFiles: [...filtered, { path: cleanPath, content }],
        hiddenFiles
      };
    });
  };

  const deleteFile = (path: string) => {
    const cleanPath = normalizePath(path);

    setData(prev => {
        // Generate backup content
        const content = generateFileContent(cleanPath, prev);
        
        const trashItem: TrashItem = {
            id: Math.random().toString(36).substring(7),
            path: cleanPath,
            content,
            deletedAt: Date.now()
        };

        // Remove from customFiles
        const customFiles = prev.customFiles?.filter(f => normalizePath(f.path) !== cleanPath) || [];
        
        // Add to hiddenFiles (ensure unique)
        const currentHidden = prev.hiddenFiles || [];
        const hiddenFiles = currentHidden.includes(cleanPath) 
            ? currentHidden 
            : [...currentHidden, cleanPath];
        
        const trash = [...(prev.trash || []), trashItem];

        return { ...prev, customFiles, hiddenFiles, trash };
    });
  };

  const restoreFile = (trashId: string) => {
    setData(prev => {
        const item = prev.trash?.find(t => t.id === trashId);
        if (!item) return prev;

        const cleanPath = normalizePath(item.path);

        // Restore to customFiles (overwriting any existing)
        const existingCustom = prev.customFiles || [];
        const filteredCustom = existingCustom.filter(f => normalizePath(f.path) !== cleanPath);
        const customFiles = [...filteredCustom, { path: cleanPath, content: item.content }];

        // Unhide
        const hiddenFiles = prev.hiddenFiles?.filter(f => normalizePath(f) !== cleanPath) || [];

        // Remove from trash
        const trash = prev.trash?.filter(t => t.id !== trashId) || [];

        return { ...prev, customFiles, hiddenFiles, trash };
    });
  };

  const permanentlyDeleteFile = (trashId: string) => {
    setData(prev => ({
        ...prev,
        trash: prev.trash?.filter(t => t.id !== trashId) || []
    }));
  };

  const reset = () => {
      setData(INITIAL_DATA);
  };

  return (
    <DesignStoreContext.Provider value={{
      data,
      updateOverview,
      updateRoadmap,
      updateDataModel,
      updateDesignSystem,
      updateShell,
      updateSectionSpec,
      updateSectionData,
      addScreenDesign,
      addCustomFile,
      deleteFile,
      restoreFile,
      permanentlyDeleteFile,
      reset
    }}>
      {children}
    </DesignStoreContext.Provider>
  );
}

export function useDesignStore() {
  const context = useContext(DesignStoreContext);
  if (!context) {
    throw new Error('useDesignStore must be used within a DesignStoreProvider');
  }
  return context;
}
