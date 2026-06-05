import { useRef, useState } from 'react';

export default function FileUpload({ label, accept = 'image/jpeg,image/png', maxSize = 5, onFile }) {
  const ref = useRef();
  const [preview, setPreview] = useState(null);

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSize * 1024 * 1024) { alert(`File must be under ${maxSize}MB`); return; }
    setPreview(URL.createObjectURL(file));
    onFile?.(file);
  }

  return (
    <div>
      {label && <label className="lbl">{label}</label>}
      <label
        onClick={() => ref.current?.click()}
        className="flex items-center gap-3 border border-dashed border-ink-300 rounded-md px-4 py-3.5 cursor-pointer hover:border-felt hover:bg-felt-50/50 transition"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-9 h-9 rounded-md object-cover" />
        ) : (
          <span className="w-9 h-9 rounded-md bg-card-alt grid place-items-center text-felt">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 20h14" />
            </svg>
          </span>
        )}
        <span>
          <span className="block text-[14px] font-semibold text-body">Drag a photo or browse</span>
          <span className="block text-[0.72rem] text-muted">JPG or PNG · up to {maxSize}MB</span>
        </span>
        <input ref={ref} type="file" accept={accept} onChange={handleChange} className="hidden" />
      </label>
    </div>
  );
}
