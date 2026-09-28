import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

/**
 * Avatar / logo upload with preview.
 *
 * Props:
 *   value:      File | null — the file to upload
 *   previewUrl: string | null — existing URL from the server
 *   onChange:   (file | null) => void
 *   name:       display name for initials fallback
 *   size:       Avatar size
 *   label:      button label
 */
export default function AvatarUpload({
  value,
  previewUrl,
  onChange,
  name,
  size = "xl",
  label = "Upload image",
}) {
  const [localPreview, setLocalPreview] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const display = localPreview || previewUrl || null;

  return (
    <div className="flex items-center gap-4">
      <Avatar src={display} name={name} size={size} />
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onChange(file);
          }}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={Upload}
          onClick={() => inputRef.current?.click()}
        >
          {label}
        </Button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        )}
      </div>
    </div>
  );
}