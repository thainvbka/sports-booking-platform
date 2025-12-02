// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { useOwnerStore } from "@/store/useOwnerStore";
// import { CheckCircle2, Loader2 } from "lucide-react";

// export function StripeOnboardingButton() {
//   const owner = useOwnerStore((state) => state.owner);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleConnect = async () => {
//     setIsLoading(true);

//     // Simulate API call to /api/stripe/onboard
//     await new Promise((resolve) => setTimeout(resolve, 1500));

//     // Mock: In real app, backend would create Stripe account and return onboarding URL
//     // Then redirect to Stripe: window.location.href = onboardingUrl

//     // For now, just mock success
//     alert(
//       "Trong ứng dụng thực, bạn sẽ được chuyển đến trang Stripe để hoàn tất đăng ký."
//     );
//     setIsLoading(false);
//   };

//   if (!owner) {
//     return null;
//   }

//   if (owner.stripe_onboarding_complete) {
//     return (
//       <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
//         <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
//         <span className="text-sm font-medium text-green-700 dark:text-green-300">
//           Đã kết nối Stripe
//         </span>
//       </div>
//     );
//   }

//   return (
//     <Button onClick={handleConnect} disabled={isLoading} variant="default">
//       {isLoading ? (
//         <>
//           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//           Đang kết nối...
//         </>
//       ) : (
//         "Kết nối Stripe"
//       )}
//     </Button>
//   );
// }
