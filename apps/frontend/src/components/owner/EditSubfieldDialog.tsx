import { useState, useEffect } from "react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubfieldDetail } from "@/types";
import { SportType } from "@/types";
import { getSportTypeLabel } from "@/services/mockData";

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

  const sportTypes = [
    SportType.FOOTBALL,
    SportType.BASKETBALL,
    SportType.TENNIS,
    SportType.BADMINTON,
    SportType.VOLLEYBALL,
    SportType.PICKLEBALL,
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin sân con</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết của sân con
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subfield_name">Tên sân con</Label>
              <Input
                id="subfield_name"
                value={formData.subfield_name}
                onChange={(e) =>
                  setFormData({ ...formData, subfield_name: e.target.value })
                }
                placeholder="Ví dụ: Sân 1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sport_type">Loại sân</Label>
              <Select
                value={formData.sport_type}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, sport_type: value as SportType })
                }
              >
                <SelectTrigger id="sport_type">
                  <SelectValue placeholder="Chọn loại sân" />
                </SelectTrigger>
                <SelectContent>
                  {sportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getSportTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Sức chứa (người)</Label>
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
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
