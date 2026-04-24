import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubfieldDetail } from "@/types";
import { SportType } from "@/types";
import { getSportTypeLabel } from "@/utils";
import { Dribbble, Loader2, Pencil, Tag, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface EditSubfieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subfield: SubfieldDetail;
  onSubmit: (data: {
    subfield_name: string;
    sport_type: string;
    capacity: number;
  }) => Promise<void>;
}

const SPORT_TYPES = [
  SportType.FOOTBALL,
  SportType.BASKETBALL,
  SportType.TENNIS,
  SportType.BADMINTON,
  SportType.VOLLEYBALL,
  SportType.PICKLEBALL,
];

export function EditSubfieldDialog({
  open,
  onOpenChange,
  subfield,
  onSubmit,
}: EditSubfieldDialogProps) {
  const [formData, setFormData] = useState({
    subfield_name: subfield.sub_field_name,
    sport_type: subfield.sport_type,
    capacity: subfield.capacity,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        subfield_name: subfield.sub_field_name,
        sport_type: subfield.sport_type,
        capacity: subfield.capacity,
      });
    }
  }, [open, subfield]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update subfield:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[32rem]">
        <div
          aria-hidden
          className="h-1 w-full bg-gradient-to-r from-primary via-emerald-500 to-primary"
        />

        <div className="flex flex-col gap-5 px-6 py-5">
          <DialogHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Pencil className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Badge
                  variant="outline"
                  className="h-5 w-fit gap-1 rounded-full border-primary/20 bg-primary/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-primary"
                >
                  <Dribbble className="size-2.5" />
                  Subfield editor
                </Badge>
                <DialogTitle className="font-display text-lg font-black italic tracking-tight">
                  Chỉnh sửa sân con
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Định danh và cấu hình cơ bản của sân.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            id="edit-subfield-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="subfield_name"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                <Tag className="size-3.5" />
                Tên sân con
              </Label>
              <Input
                id="subfield_name"
                value={formData.subfield_name}
                onChange={(e) =>
                  setFormData({ ...formData, subfield_name: e.target.value })
                }
                placeholder="Ví dụ: Sân 1"
                required
                className="h-10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="sport_type"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  <Dribbble className="size-3.5" />
                  Loại sân
                </Label>
                <Select
                  value={formData.sport_type}
                  onValueChange={(value: string) =>
                    setFormData({
                      ...formData,
                      sport_type: value as SportType,
                    })
                  }
                >
                  <SelectTrigger id="sport_type" className="w-full">
                    <SelectValue placeholder="Chọn loại sân" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SPORT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {getSportTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="capacity"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  <Users className="size-3.5" />
                  Sức chứa (người)
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Ví dụ: 10"
                  required
                  className="h-10 tabular-nums"
                />
              </div>
            </div>
          </form>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="edit-subfield-form"
              disabled={isSubmitting}
              className="rounded-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Đang lưu…
                </>
              ) : (
                <>
                  <Pencil data-icon="inline-start" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
