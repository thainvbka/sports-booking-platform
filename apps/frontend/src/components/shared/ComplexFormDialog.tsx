import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOwnerStore } from "@/store/useOwnerStore";
import { Plus, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface ComplexFormData {
  complex_name: string;
  complex_address: string;
}

export function ComplexFormDialog() {
  const { createComplex, isLoading } = useOwnerStore();
  const [open, setOpen] = useState(false);
  const [complexImage, setComplexImage] = useState<File | null>(null);
  const [verificationDocs, setVerificationDocs] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComplexFormData>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setComplexImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVerificationDocs((prev) => [...prev, ...files].slice(0, 10));
  };

  const removeDoc = (index: number) => {
    setVerificationDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = () => {
    setComplexImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: ComplexFormData) => {
    setError(null);

    if (!complexImage) {
      setError("Vui lòng tải lên hình ảnh khu phức hợp");
      return;
    }

    if (verificationDocs.length === 0) {
      setError("Vui lòng tải lên ít nhất một giấy tờ xác thực");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("complex_name", data.complex_name);
      formData.append("complex_address", data.complex_address);
      formData.append("complex_image", complexImage);
      verificationDocs.forEach((doc) => {
        formData.append("verification_docs", doc);
      });

      await createComplex(formData);

      // Reset form
      reset();
      setComplexImage(null);
      setImagePreview(null);
      setVerificationDocs([]);
      setError(null);
      setOpen(false);
      toast.success("Khu phức hợp đã được tạo và đang chờ duyệt.");
    } catch (err) {
      toast.error(
        "Đã có lỗi xảy ra khi tạo khu phức hợp. Vui lòng thử lại sau."
      );
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Khu Phức Hợp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Khu Phức Hợp Mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin khu phức hợp. Khu phức hợp sẽ được gửi để chờ duyệt.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="complex_name">
                Tên khu phức hợp <span className="text-destructive">*</span>
              </Label>
              <Input
                id="complex_name"
                placeholder="Ví dụ: Sân bóng ABC"
                {...register("complex_name", {
                  required: "Tên khu phức hợp là bắt buộc",
                })}
              />
              {errors.complex_name && (
                <p className="text-sm text-destructive">
                  {errors.complex_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="complex_address">
                Địa chỉ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="complex_address"
                placeholder="Ví dụ:  số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
                {...register("complex_address", {
                  required: "Địa chỉ là bắt buộc",
                })}
              />
              {errors.complex_address && (
                <p className="text-sm text-destructive">
                  {errors.complex_address.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="complex_image">
                Hình ảnh khu phức hợp{" "}
                <span className="text-destructive">*</span>
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
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="complex_image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nhấp để tải lên hình ảnh
                    </span>
                  </label>
                )}
                <Input
                  id="complex_image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="verification_docs">
                Giấy tờ xác thực <span className="text-destructive">*</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (Tối đa 10 file)
                </span>
              </Label>
              <div className="flex flex-col gap-2">
                {verificationDocs.length > 0 && (
                  <div className="grid gap-2">
                    {verificationDocs.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <span className="text-sm truncate">{doc.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDoc(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {verificationDocs.length < 10 && (
                  <label
                    htmlFor="verification_docs"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Nhấp để tải lên giấy tờ
                    </span>
                  </label>
                )}
                <Input
                  id="verification_docs"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  multiple
                  onChange={handleDocsChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang tạo..." : "Tạo Khu Phức Hợp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
