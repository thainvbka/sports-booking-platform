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
import { Plus } from "lucide-react";

interface SubFieldFormData {
  sub_field_name: string;
  capacity: number;
  sport_type: SportType;
  sub_field_image?: string;
}

interface SubFieldFormDialogProps {
  complexId: string;
  trigger?: React.ReactNode;
}

export function SubFieldFormDialog({
  complexId,
  trigger,
}: SubFieldFormDialogProps) {
  const addSubField = useOwnerStore((state) => state.addSubField);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [sportType, setSportType] = useState<SportType | "">("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubFieldFormData>();

  const onSubmit = async (data: SubFieldFormData) => {
    if (!sportType) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newSubField = {
      id: Math.random().toString(36).substring(7),
      complex_id: complexId,
      sub_field_name: data.sub_field_name,
      capacity: data.capacity,
      sport_type: sportType as SportType,
      sub_field_image: data.sub_field_image,
      pricing_rules: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addSubField(complexId, newSubField);
    setIsLoading(false);
    setOpen(false);
    reset();
    setSportType("");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm sân con mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin sân con. Bạn có thể thêm bảng giá sau khi tạo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sub_field_name">Tên sân con</Label>
              <Input
                id="sub_field_name"
                placeholder="Ví dụ: Sân bóng đá 5v5"
                {...register("sub_field_name", {
                  required: "Tên sân là bắt buộc",
                })}
              />
              {errors.sub_field_name && (
                <p className="text-sm text-destructive">
                  {errors.sub_field_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Sức chứa (số người)</Label>
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
              <Label htmlFor="sport_type">Loại sân</Label>
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
              {!sportType && (
                <p className="text-sm text-destructive">Loại sân là bắt buộc</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sub_field_image">URL hình ảnh (tùy chọn)</Label>
              <Input
                id="sub_field_image"
                placeholder="https://example.com/image.jpg"
                {...register("sub_field_image")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !sportType}>
              {isLoading ? "Đang tạo..." : "Tạo sân con"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
