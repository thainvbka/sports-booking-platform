import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  required?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUploadField({
  id,
  label,
  required = false,
  value,
  onChange,
  disabled = false,
}: ImageUploadFieldProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setImagePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(value);
  }, [value]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const removeImage = () => {
    onChange(null);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex flex-col gap-2">
        {imagePreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Nhấp để tải lên hình ảnh
            </span>
          </label>
        )}
        <Input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
