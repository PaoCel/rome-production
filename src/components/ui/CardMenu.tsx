import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AppIcon from '../icons/AppIcon';

const MENU_WIDTH = 144;
const MENU_HEIGHT = 96;
const VIEWPORT_GAP = 8;

// Small accessible kebab (3-dots) menu with Edit / Delete actions.
export default function CardMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function openMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const roomBelow = window.innerHeight - rect.bottom;
    const top = roomBelow >= MENU_HEIGHT + VIEWPORT_GAP
      ? rect.bottom + 4
      : Math.max(VIEWPORT_GAP, rect.top - MENU_HEIGHT - 4);
    const left = Math.max(
      VIEWPORT_GAP,
      Math.min(window.innerWidth - MENU_WIDTH - VIEWPORT_GAP, rect.right - MENU_WIDTH),
    );

    setPosition({ left, top });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    const handleViewportChange = () => setOpen(false);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open]);

  return (
    <span className="inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Open menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        onClick={(e) => {
          e.stopPropagation();
          if (open) setOpen(false);
          else openMenu();
        }}
      >
        <AppIcon name="more" className="h-5 w-5" />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-[100] w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-card-hover"
          style={{ left: position.left, top: position.top }}
        >
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>,
        document.body,
      )}
    </span>
  );
}
