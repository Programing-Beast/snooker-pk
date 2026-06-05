import { useEffect } from 'react';

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-night/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-e4 max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function ModalBody({ children }) {
  return <div className="p-5">{children}</div>;
}

export function ModalFooter({ children }) {
  return <div className="flex gap-2.5 px-5 py-4 bg-card-alt border-t border-divider justify-end">{children}</div>;
}
