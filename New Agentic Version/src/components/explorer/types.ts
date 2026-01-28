
export interface FileNode {
  name: string;
  path: string; // Full path
  type: 'file' | 'folder';
  children?: FileNode[];
  status?: 'M' | 'U' | 'A' | 'D';
  trashId?: string; // If in trash
  originalName?: string; // Real name without suffix
}
