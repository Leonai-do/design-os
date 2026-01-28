
import { useState, useRef, useEffect } from 'react';
import { useDesignStore } from '../lib/store';
import { FileNode } from '../components/explorer/types';
import { normalizePath } from '../lib/utils';

export function useFileTree() {
  const { data } = useDesignStore();
  const [highlightedFiles, setHighlightedFiles] = useState<string[]>([]);
  const prevDataRef = useRef(data);

  // Highlight logic for changed files
  useEffect(() => {
    const prev = prevDataRef.current;
    const current = data;
    const modified: string[] = [];

    // Simple diff checks
    if (JSON.stringify(prev.overview) !== JSON.stringify(current.overview)) modified.push('product-vision.md');
    if (JSON.stringify(prev.roadmap) !== JSON.stringify(current.roadmap)) modified.push('roadmap.md');
    if (JSON.stringify(prev.dataModel) !== JSON.stringify(current.dataModel)) {
        modified.push('schema.prisma');
        modified.push('types.ts');
    }
    if (JSON.stringify(prev.designSystem) !== JSON.stringify(current.designSystem)) {
        modified.push('colors.ts');
        modified.push('typography.ts');
        modified.push('global.css');
    }

    if (modified.length > 0) {
        setHighlightedFiles(modified);
        const timer = setTimeout(() => setHighlightedFiles([]), 2000);
        return () => clearTimeout(timer);
    }
    prevDataRef.current = current;
  }, [data]);

  // --- MERGE CUSTOM FILES ---
  const mergeCustomFiles = (rootNodes: FileNode[]) => {
    if (!data.customFiles) return rootNodes;

    const projectRoot = rootNodes[0];

    data.customFiles.forEach(file => {
      // If file is hidden, skip it.
      const cleanPath = normalizePath(file.path);
      if (data.hiddenFiles?.some(h => normalizePath(h) === cleanPath)) return;

      const parts = file.path.split('/').filter(Boolean);
      let currentLevel = projectRoot.children || [];
      if (!projectRoot.children) projectRoot.children = currentLevel;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        let existingNode = currentLevel.find(n => n.name === part);

        if (existingNode) {
          if (isFile) {
            existingNode.status = 'A'; 
            existingNode.path = file.path; 
          } else {
             if (!existingNode.children) existingNode.children = [];
             currentLevel = existingNode.children;
          }
        } else {
          const newNode: FileNode = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
            status: 'A' 
          };
          currentLevel.push(newNode);
          
          if (!isFile) {
            currentLevel = newNode.children!;
          }
        }
      });
    });

    return rootNodes;
  };

  // --- ACTIVE TREE GENERATION ---
  const generateActiveTree = (): FileNode[] => {
    // Helper to check if a generated file is "hidden"
    const isVisible = (path: string) => {
        const cleanPath = normalizePath(path);
        return !data.hiddenFiles?.some(h => normalizePath(h) === cleanPath);
    };

    const f = (name: string, path: string, status: 'U' | 'M' | 'A' = 'U'): FileNode | null => {
      if (!isVisible(path)) return null;
      return { name, path, type: 'file', status };
    };
    
    const d = (name: string, path: string, children: (FileNode | null)[] = []): FileNode => ({ 
      name, path, type: 'folder', children: children.filter((c): c is FileNode => c !== null) 
    });

    const docsChildren: (FileNode|null)[] = []
    docsChildren.push(f('product-vision.md', 'docs/product-vision.md'))
    docsChildren.push(f('roadmap.md', 'docs/roadmap.md'))

    const srcChildren: (FileNode|null)[] = []
    if (data.dataModel) {
      srcChildren.push(d('db', 'src/db', [f('schema.prisma', 'src/db/schema.prisma')]))
      srcChildren.push(f('types.ts', 'src/types.ts', 'M'))
    }

    if (data.designSystem) {
      srcChildren.push(d('theme', 'src/theme', [
          f('colors.ts', 'src/theme/colors.ts'),
          f('typography.ts', 'src/theme/typography.ts'),
          f('global.css', 'src/theme/global.css', 'M')
      ]))
    }

    const configChildren: (FileNode|null)[] = []
    configChildren.push(f('package.json', 'package.json')) 
    
    const baseTree: FileNode[] = [
      d('PROJECT', '', [
        d('docs', 'docs', docsChildren),
        d('src', 'src', srcChildren),
        ...configChildren
      ])
    ]

    return mergeCustomFiles(baseTree);
  }

  // --- TRASH TREE GENERATION ---
  const generateTrashTree = (): FileNode[] => {
    if (!data.trash || data.trash.length === 0) return [];

    const root: FileNode = { name: 'TRASH', path: '', type: 'folder', children: [] };

    data.trash.forEach(item => {
        const parts = item.path.split('/').filter(Boolean);
        let currentLevel = root.children!;

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;
            
            if (isFile) {
                // Formatting timestamp
                const date = new Date(item.deletedAt);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const nameWithTime = `${part} (${timeStr})`;
                
                // Add unique suffix if even the timestamp is identical (fast deletes)
                let finalName = nameWithTime;
                let counter = 1;
                while (currentLevel.find(n => n.name === finalName)) {
                    finalName = `${part} (${timeStr}) ${counter++}`;
                }

                currentLevel.push({
                    name: finalName,
                    originalName: part,
                    path: item.path,
                    type: 'file',
                    trashId: item.id,
                    status: 'D'
                });
            } else {
                // Folder logic - we can reuse folders in trash tree
                let existingFolder = currentLevel.find(n => n.name === part && n.type === 'folder');
                if (!existingFolder) {
                    existingFolder = { name: part, path: parts.slice(0, index + 1).join('/'), type: 'folder', children: [] };
                    currentLevel.push(existingFolder);
                }
                currentLevel = existingFolder.children!;
            }
        });
    });

    return root.children || [];
  };

  return {
    activeTree: generateActiveTree(),
    trashTree: generateTrashTree(),
    highlightedFiles,
    deletedFilesCount: data.trash?.length || 0
  };
}
