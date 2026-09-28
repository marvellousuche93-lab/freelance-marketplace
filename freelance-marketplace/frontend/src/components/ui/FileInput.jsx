/**
 * FileInput — a styled file picker with image preview.
 *
 * Usage:
 *   <FileInput
 *     label="Cover image"
 *     accept="image/*"
 *     currentUrl={existingImageUrl}
 *     onChange={(file) => setFile(file)}
 *   />
 *
 * The component is controlled: the parent owns the File (via onChange).
 * It does NOT submit anything. If the user picks a new file, `onChange`
 * receives that File. If the user clears it, `onChange(null)`.
 */

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";

import Button from "./Button";
import { cn } from "../../utils/cn";

export default function FileInput({
  label,
  accept = "image/*",
  currentUrl = null,
  onChange,
  helper,
  error,
  className = "",
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  // Revoke object URLs when they're replaced or unmounted.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function pick() {
    inputRef.current?.click();
  }

  function onFileChange(e) {
    const file = e.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
    onChange?.(file);
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange?.(null);
  }

  const shown = preview || currentUrl;

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <p className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
          {label}
        </p>
      ) : null}

      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border",
          error
            ? "border-red-500"
            : "border-slate-300 dark:border-slate-700"
        )}
      >
        <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
          {shown ? (
            <img
              src={shown}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <ImageIcon size={20} className="text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onFileChange}
            className="hidden"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Button type="button" variant="outline" size="sm" onClick={pick}>
              <Upload size={14} />
              {shown ? "Change" : "Choose file"}
            </Button>
            {shown ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 size={14} /> Remove
              </Button>
            ) : null}
          </div>
          {helper ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {helper}
            </p>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}