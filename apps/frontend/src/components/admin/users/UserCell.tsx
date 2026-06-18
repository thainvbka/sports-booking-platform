import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminUser } from "@/types/admin.types";
import { getNameInitials } from "@/utils";
import { Mail, Phone, User } from "lucide-react";

interface UserCellProps {
  user: AdminUser;
}

export function UserCell({ user }: UserCellProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <Avatar className="size-9 border border-border/60">
        <AvatarImage
          src={
            user.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.full_name || "U",
            )}&background=random`
          }
          alt={user.full_name}
        />
        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
          {getNameInitials(user.full_name, "U")}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <User className="size-3.5 text-primary" />
          <span className="truncate">{user.full_name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Mail className="size-3" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Phone className="size-3" />
          <span>{user.phone_number}</span>
        </div>
      </div>
    </div>
  );
}
