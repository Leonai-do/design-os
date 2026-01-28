import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignStoreProvider } from './src/lib/store';
import { ProductPage } from './src/pages/ProductPage';
import { DataModelPage } from './src/pages/DataModelPage';
import { DesignPage } from './src/pages/DesignPage';
import { SectionsPage } from './src/pages/SectionsPage';
import { SectionPage } from './src/pages/SectionPage';
import { ScreenDesignPage } from './src/pages/ScreenDesignPage';
import { ShellDesignPage } from './src/pages/ShellDesignPage';
import { ExportPage } from './src/pages/ExportPage';
import { ChatInterface } from './src/components/ChatInterface';
import { Toaster } from './src/components/ui/toaster';

export default function App() {
  return (
    <DesignStoreProvider>
      <HashRouter>
        <div className="relative min-h-screen">
          <Routes>
            <Route path="/" element={<ProductPage />} />
            
            <Route path="/data-model" element={<DataModelPage />} />
            <Route path="/design" element={<DesignPage />} />
            <Route path="/shell/design" element={<ShellDesignPage />} />
            <Route path="/sections" element={<SectionsPage />} />
            <Route path="/sections/:sectionId" element={<SectionPage />} />
            <Route path="/sections/:sectionId/screen-designs/:designId" element={<ScreenDesignPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <ChatInterface />
          <Toaster />
        </div>
      </HashRouter>
    </DesignStoreProvider>
  );
}