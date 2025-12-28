import { Link } from "react-router-dom";
import { Facebook, Instagram, Github, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent inline-block"
            >
              T-Sport
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nền tảng đặt sân thể thao số 1 Đại Cồ Việt. Kết nối đam mê, nâng
              tầm sức khỏe.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://www.facebook.com/thainvbka"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-blue-600 hover:bg-blue-50"
                >
                  <Facebook className="w-5 h-5" />
                </Button>
              </a>

              <a
                href="https://www.instagram.com/thai_ngw"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-pink-600 hover:bg-pink-50"
                >
                  <Instagram className="w-5 h-5" />
                </Button>
              </a>

              <a
                href="https://github.com/thainvbka"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-sky-500 hover:bg-sky-50"
                >
                  <Github className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Khám phá</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/search"
                  className="hover:text-primary transition-colors"
                >
                  Tìm sân
                </Link>
              </li>
              <li>
                <Link
                  to="/search?sport_type=FOOTBALL"
                  className="hover:text-primary transition-colors"
                >
                  Sân bóng đá
                </Link>
              </li>
              <li>
                <Link
                  to="/search?sport_type=BADMINTON"
                  className="hover:text-primary transition-colors"
                >
                  Sân cầu lông
                </Link>
              </li>
              <li>
                <Link
                  to="/search?sport_type=TENNIS"
                  className="hover:text-primary transition-colors"
                >
                  Sân Tennis
                </Link>
              </li>
              <li>
                <Link
                  to="/search?sport_type=PICKLEBALL"
                  className="hover:text-primary transition-colors"
                >
                  Sân Pickleball
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Về chúng tôi</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/register"
                  className="hover:text-primary transition-colors"
                >
                  Trở thành đối tác
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>0862821861</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>nvthai2904@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} T-Sport. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
