import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getNameInitials } from "@/utils/review.utils";

interface ReviewerAvatarProps {
  name?: string | null;
  avatar?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export function ReviewerAvatar({
  name,
  avatar,
  className,
  fallbackClassName,
}: ReviewerAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={avatar || undefined} alt={name || "Reviewer"} />
      <AvatarFallback className={cn("text-xs font-semibold", fallbackClassName)}>
        {getNameInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
