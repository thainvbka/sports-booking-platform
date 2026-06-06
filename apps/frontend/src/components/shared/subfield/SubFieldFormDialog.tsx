import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubfieldStore } from "@/store/owner/useSubfieldStore";
import { SportType } from "@/types";
import { getSportTypeLabel } from "@/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageUploadField } from "../ui-utility/ImageUploadField";

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
  const { createSubfield, isLoading } = useSubfieldStore();
  const [open, setOpen] = useState(false);
  const [sportType, setSportType] = useState<SportType | "">("");
  const [subfieldImage, setSubfieldImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubFieldFormData>();



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
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
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

            <ImageUploadField
              id="subfield_image"
              label="Hình ảnh sân"
              required
              value={subfieldImage}
              onChange={setSubfieldImage}
            />
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



