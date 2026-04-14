'use client';

import { useRef, useCallback } from 'react';

interface DragItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface DropZoneProps {
  id: string;
  onDrop: (itemId: string, zoneId: string) => void;
  children: React.ReactNode;
  className?: string;
  activeClass?: string;
}

export function DragItem({ id, children, className = '', disabled }: DragItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', id);
    e.currentTarget.classList.add('opacity-40');
  }, [id]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-40');
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    el.dataset.dragging = 'true';
    el.dataset.dragId = id;
    const touch = e.touches[0];
    el.dataset.offsetX = String(touch.clientX - el.getBoundingClientRect().left);
    el.dataset.offsetY = String(touch.clientY - el.getBoundingClientRect().top);
  }, [id, disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const el = ref.current;
    if (!el || el.dataset.dragging !== 'true') return;
    const touch = e.touches[0];
    el.style.position = 'fixed';
    el.style.zIndex = '1000';
    el.style.left = `${touch.clientX - Number(el.dataset.offsetX)}px`;
    el.style.top = `${touch.clientY - Number(el.dataset.offsetY)}px`;
    el.style.opacity = '0.8';
    el.style.pointerEvents = 'none';
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const el = ref.current;
    if (!el || el.dataset.dragging !== 'true') return;
    el.dataset.dragging = 'false';
    el.style.position = '';
    el.style.zIndex = '';
    el.style.left = '';
    el.style.top = '';
    el.style.opacity = '';
    el.style.pointerEvents = '';

    // Find drop zone under touch point
    const touch = e.changedTouches[0];
    const dropZone = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('[data-drop-zone]');
    if (dropZone) {
      const event = new CustomEvent('touchdrop', { detail: { itemId: id, zoneId: dropZone.getAttribute('data-drop-zone') } });
      dropZone.dispatchEvent(event);
    }
  }, [id]);

  return (
    <div
      ref={ref}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`cursor-grab active:cursor-grabbing touch-none select-none ${className}`}
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  );
}

export function DropZone({ id, onDrop, children, className = '', activeClass = '' }: DropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add(...activeClass.split(' ').filter(Boolean));
  }, [activeClass]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove(...activeClass.split(' ').filter(Boolean));
  }, [activeClass]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove(...activeClass.split(' ').filter(Boolean));
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) onDrop(itemId, id);
  }, [id, onDrop, activeClass]);

  // Touch drop support
  const handleTouchDrop = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.itemId && detail?.zoneId) {
      onDrop(detail.itemId, detail.zoneId);
    }
  }, [onDrop]);

  return (
    <div
      ref={ref}
      data-drop-zone={id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      // Touch drop listener added via effect in parent
      className={className}
    >
      {children}
    </div>
  );
}
