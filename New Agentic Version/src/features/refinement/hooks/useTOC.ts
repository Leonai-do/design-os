
import { useState, useEffect } from 'react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const useTOC = (content: string) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Parse headers for TOC
  useEffect(() => {
    const lines = content.split('\n');
    const headers: TocItem[] = [];
    let inCodeBlock = false;

    lines.forEach(line => {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) return;

      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const id = slugify(match[2].trim());
        headers.push({
          level: match[1].length,
          text: match[2].trim(),
          id: id
        });
        if (!activeId) setActiveId(id);
      }
    });
    setToc(headers);
  }, [content]);

  // Scroll Spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.getElementById('prd-document');
      if (!scrollContainer) return;
      
      for (const item of toc) {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          if (rect.top >= containerRect.top - 50 && rect.top < containerRect.bottom) {
             setActiveId(item.id);
             break;
          }
        }
      }
    };

    const container = document.getElementById('prd-document');
    if (container) {
       container.addEventListener('scroll', handleScroll);
       return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [toc]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      setActiveId(id);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return { toc, activeId, scrollToSection };
};
