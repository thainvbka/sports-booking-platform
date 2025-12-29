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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOwnerStore } from "@/store/useOwnerStore";
import { SportType } from "@/types";
import { getSportTypeLabel } from "@/services/mockData";
import { Plus, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface SubFieldFormData {
  subfield_name: string;
  capacity: number;
}

interface SubFieldFormDialogProps {
  complexId: string;
  trigger?: React.ReactNode;
}

export function SubFieldFormDialog({
  complexId,
  trigger,
}: SubFieldFormDialogProps) {
  const { createSubfield, isLoading } = useOwnerStore();
  const [open, setOpen] = useState(false);
  const [sportType, setSportType] = useState<SportType | "">("");
  const [subfieldImage, setSubfieldImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubFieldFormData>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubfieldImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSubfieldImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: SubFieldFormData) => {
    setError(null);

    if (!sportType) {
      setError("Vui lòng chọn loại sân");
      return;
    }

    if (!subfieldImage) {
      setError("Vui lòng tải lên hình ảnh sân");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("subfield_name", data.subfield_name);
      formData.append("capacity", data.capacity.toString());
      formData.append("sport_type", sportType);
      formData.append("subfield_image", subfieldImage);

      await createSubfield(complexId, formData);

      // Reset form
      reset();
      setSportType("");
      setSubfieldImage(null);
      setImagePreview(null);
      setError(null);
      setOpen(false);
      toast.success("Sân con đã được tạo thành công.");
    } catch (err) {
      toast.error("Đã có lỗi xảy ra khi tạo sân con. Vui lòng thử lại sau.");
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Thêm sân con
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm sân con mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin sân con. Bạn có thể thêm bảng giá sau khi tạo.
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
              <Label htmlFor="subfield_name">
                Tên sân con <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subfield_name"
                placeholder="Ví dụ: Sân bóng đá 5v5"
                {...register("subfield_name", {
                  required: "Tên sân là bắt buộc",
                })}
              />
              {errors.subfield_name && (
                <p className="text-sm text-destructive">
                  {errors.subfield_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">
                Sức chứa (số người) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                placeholder="10"
                {...register("capacity", {
                  required: "Sức chứa là bắt buộc",
                  valueAsNumber: true,
                  min: { value: 2, message: "Sức chứa tối thiểu là 2" },
                })}
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">
                  {errors.capacity.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sport_type">
                Loại sân <span className="text-destructive">*</span>
              </Label>
              <Select
                value={sportType}
                onValueChange={(value) => setSportType(value as SportType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại sân" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SportType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {getSportTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subfield_image">
                Hình ảnh sân <span className="text-destructive">*</span>
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
                    htmlFor="subfield_image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nhấp để tải lên hình ảnh
                    </span>
                  </label>
                )}
                <Input
                  id="subfield_image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || !sportType || !subfieldImage}
            >
              {isLoading ? "Đang tạo..." : "Tạo sân con"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
