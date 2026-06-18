import { SubFieldFormDialog } from "@/components/shared/subfield/SubFieldFormDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddSubfieldButtonProps {
  complexId: string;
  disabled: boolean;
  label?: string;
}

export function AddSubfieldButton({
  complexId,
  disabled,
  label = "Thêm sân con",
}: AddSubfieldButtonProps) {
  return (
    <SubFieldFormDialog
      complexId={complexId}
      trigger={
        <Button
          size="sm"
          disabled={disabled}
          className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow shadow-primary/25 hover:bg-primary/92"
        >
          <Plus data-icon="inline-start" />
          {label}
        </Button>
      }
    />
  );
}
