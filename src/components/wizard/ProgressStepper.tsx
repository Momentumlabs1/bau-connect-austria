import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full py-3 md:py-4">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-5 h-1 w-full bg-secondary" />
        
        {/* Progress Bar Fill */}
        <div 
          className="absolute left-0 top-5 h-1 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-all duration-300",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-background text-primary scale-110",
                    !isCompleted && !isCurrent && "border-secondary text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 hidden text-xs font-medium sm:block",
                    (isCurrent || isCompleted) && "text-foreground",
                    !isCurrent && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}