import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SportType } from "@/types";
import { getSportTypeLabel } from "@/services/mockData";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [sportType, setSportType] = useState<SportType | "">(
    (searchParams.get("sport_type") as SportType) || ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minCapacity, setMinCapacity] = useState(
    searchParams.get("minCapacity") || ""
  );
  const [maxCapacity, setMaxCapacity] = useState(
    searchParams.get("maxCapacity") || ""
  );

  const hasAdvancedFilters = minPrice || maxPrice || minCapacity || maxCapacity;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (sportType) params.set("sport_type", sportType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minCapacity) params.set("minCapacity", minCapacity);
    if (maxCapacity) params.set("maxCapacity", maxCapacity);
    navigate(`/search?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinCapacity("");
    setMaxCapacity("");
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border shadow-sm text-gray-900">
        {/* Main search row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Tìm theo tên sân hoặc địa chỉ..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={sportType}
              onChange={(e) => setSportType(e.target.value as SportType | "")}
              className="flex h-9 w-full rounded-md border border-input bg-white text-gray-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Tất cả môn</option>
              {Object.values(SportType).map((type) => (
                <option key={type} value={type}>
                  {getSportTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            {/* Advanced Filters Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="relative">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Lọc
                  {hasAdvancedFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Bộ lọc nâng cao</h4>
                    {hasAdvancedFilters && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-auto p-1 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Xóa
                      </Button>
                    )}
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Khoảng giá (VNĐ/giờ)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Từ"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-8 bg-white text-gray-900"
                        min="0"
                      />
                      <span className="text-muted-foreground self-center">
                        -
                      </span>
                      <Input
                        type="number"
                        placeholder="Đến"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-8 bg-white text-gray-900"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Capacity Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Sức chứa (người)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Từ"
                        value={minCapacity}
                        onChange={(e) => setMinCapacity(e.target.value)}
                        className="h-8 bg-white text-gray-900"
                        min="0"
                      />
                      <span className="text-muted-foreground self-center">
                        -
                      </span>
                      <Input
                        type="number"
                        placeholder="Đến"
                        value={maxCapacity}
                        onChange={(e) => setMaxCapacity(e.target.value)}
                        className="h-8 bg-white text-gray-900"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button type="submit">
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasAdvancedFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {minPrice && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Giá từ: {Number(minPrice).toLocaleString()}đ
              </span>
            )}
            {maxPrice && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Giá đến: {Number(maxPrice).toLocaleString()}đ
              </span>
            )}
            {minCapacity && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Sức chứa từ: {minCapacity} người
              </span>
            )}
            {maxCapacity && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Sức chứa đến: {maxCapacity} người
              </span>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
