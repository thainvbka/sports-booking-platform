import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="px-4 py-6 lg:px-6">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              to="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              T-Sport
            </Link>
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span>Nền tảng đặt sân thể thao số 1 Đại Cồ Việt</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Kết nối đam mê, Đơn giản hóa trải nghiệm
          </p>
        </div>
      </div>
    </footer>
  );
}
