import { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

export function useDraggable(initialPosition: Position = { x: 0, y: 0 }) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const initialMousePos = useRef<Position>({ x: 0, y: 0 });
  const initialElementPos = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.terminal-top-bar')) return;

      setIsDragging(true);
      initialMousePos.current = { x: e.clientX, y: e.clientY };
      initialElementPos.current = position;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - initialMousePos.current.x;
      const dy = e.clientY - initialMousePos.current.y;

      setPosition({
        x: initialElementPos.current.x + dx,
        y: initialElementPos.current.y + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const element = dragRef.current;
    if (element) {
      element.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        element.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, position, isDesktop]);

  return { position, dragRef, isDragging, isDesktop };
}
