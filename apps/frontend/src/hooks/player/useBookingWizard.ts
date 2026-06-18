import { useEffect, useState } from "react";

type Step = 1 | 2 | 3;

interface UseBookingWizardOptions {
  hasUpsellStep: boolean;
  onValidateStep1: () => boolean;
}

export function useBookingWizard({
  hasUpsellStep,
  onValidateStep1,
}: UseBookingWizardOptions) {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const stepperSteps = hasUpsellStep
    ? [
        { number: 1, label: "Chọn lịch" },
        { number: 2, label: "Dịch vụ đi kèm" },
        { number: 3, label: "Xác nhận" },
      ]
    : [
        { number: 1, label: "Chọn lịch" },
        { number: 2, label: "Xác nhận" },
      ];

  const displayStep = hasUpsellStep ? currentStep : currentStep === 1 ? 1 : 2;

  useEffect(() => {
    if (!hasUpsellStep && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [hasUpsellStep, currentStep]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!onValidateStep1()) {
        return;
      }
      setCurrentStep(hasUpsellStep ? 2 : 3);
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBackStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(hasUpsellStep ? 2 : 1);
    }
  };

  const stepEyebrow =
    displayStep === 1
      ? "Lựa chọn khung giờ"
      : hasUpsellStep && displayStep === 2
        ? "Phụ kiện · đồ dùng"
        : "Xác nhận & thanh toán";

  const stepTitle =
    displayStep === 1
      ? "Chọn ngày & khung giờ đá"
      : hasUpsellStep && displayStep === 2
        ? "Thêm trang bị cho trận đấu"
        : "Kiểm tra lại thông tin";

  return {
    currentStep,
    setCurrentStep,
    displayStep,
    stepperSteps,
    handleNextStep,
    handleBackStep,
    stepEyebrow,
    stepTitle,
  };
}
