// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useOwnerStore } from "@/store/useOwnerStore";
// import { SportType } from "@/types";
// import { getSportTypeLabel } from "@/services/mockData";

// interface SubFieldFormData {
//   sub_field_name: string;
//   capacity: number;
//   sport_type: SportType;
//   sub_field_image?: string;
// }

// interface SubFieldFormProps {
//   complexId: string;
//   onSuccess?: () => void;
//   onCancel?: () => void;
// }

// export function SubFieldForm({
//   complexId,
//   onSuccess,
//   onCancel,
// }: SubFieldFormProps) {
//   const addSubField = useOwnerStore((state) => state.addSubField);
//   const [isLoading, setIsLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<SubFieldFormData>();

//   const onSubmit = async (data: SubFieldFormData) => {
//     setIsLoading(true);
//     await new Promise((resolve) => setTimeout(resolve, 800));

//     const newSubField = {
//       id: Math.random().toString(36).substring(7),
//       complex_id: complexId,
//       sub_field_name: data.sub_field_name,
//       capacity: data.capacity,
//       sport_type: data.sport_type,
//       sub_field_image: data.sub_field_image,
//       pricing_rules: [],
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     };

//     addSubField(complexId, newSubField);
//     setIsLoading(false);
//     onSuccess?.();
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="sub_field_name">Tên sân con</Label>
//         <Input
//           id="sub_field_name"
//           placeholder="Ví dụ: Sân bóng đá 5v5"
//           {...register("sub_field_name", { required: "Tên sân là bắt buộc" })}
//         />
//         {errors.sub_field_name && (
//           <p className="text-sm text-destructive">
//             {errors.sub_field_name.message}
//           </p>
//         )}
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="capacity">Sức chứa (số người)</Label>
//         <Input
//           id="capacity"
//           type="number"
//           placeholder="10"
//           {...register("capacity", {
//             required: "Sức chứa là bắt buộc",
//             valueAsNumber: true,
//             min: { value: 2, message: "Sức chứa tối thiểu là 2" },
//           })}
//         />
//         {errors.capacity && (
//           <p className="text-sm text-destructive">{errors.capacity.message}</p>
//         )}
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="sport_type">Loại sân</Label>
//         <select
//           id="sport_type"
//           {...register("sport_type", { required: "Loại sân là bắt buộc" })}
//           className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
//         >
//           <option value="">Chọn loại sân</option>
//           {Object.values(SportType).map((type) => (
//             <option key={type} value={type}>
//               {getSportTypeLabel(type)}
//             </option>
//           ))}
//         </select>
//         {errors.sport_type && (
//           <p className="text-sm text-destructive">
//             {errors.sport_type.message}
//           </p>
//         )}
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="sub_field_image">URL hình ảnh (tùy chọn)</Label>
//         <Input
//           id="sub_field_image"
//           placeholder="https://example.com/image.jpg"
//           {...register("sub_field_image")}
//         />
//       </div>

//       <div className="flex gap-3 pt-4">
//         <Button type="submit" disabled={isLoading} className="flex-1">
//           {isLoading ? "Đang tạo..." : "Tạo sân con"}
//         </Button>
//         {onCancel && (
//           <Button type="button" variant="outline" onClick={onCancel}>
//             Hủy
//           </Button>
//         )}
//       </div>
//     </form>
//   );
// }
