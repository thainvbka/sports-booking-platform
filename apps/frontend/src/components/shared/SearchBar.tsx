import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SportType } from "@/types";
import { getSportTypeLabel } from "@/services/mockData";
import { Search, MapPin } from "lucide-react";

export function SearchBar() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [sportType, setSportType] = useState<SportType | "">("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (sportType) params.set("sport_type", sportType);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-background rounded-lg border shadow-sm">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên sân hoặc địa chỉ..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={sportType}
            onChange={(e) => setSportType(e.target.value as SportType | "")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Tất cả môn</option>
            {Object.values(SportType).map((type) => (
              <option key={type} value={type}>
                {getSportTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" className="md:w-auto">
          <Search className="w-4 h-4 mr-2" />
          Tìm kiếm
        </Button>
      </div>
    </form>
  );
}
