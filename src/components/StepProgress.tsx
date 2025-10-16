// components/StepProgress.tsx
"use client";

type Step = {
  number: number;
  label: string;
  completed: boolean;
  current: boolean;
};

export function StepProgress({ steps }: { steps: Step[] }) {
  return (
    <div className="w-full flex justify-center mb-8 px-4">
      <div className="flex items-center max-w-md">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle and Label */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step.completed
                    ? "bg-blue-600 text-white"
                    : step.current
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.completed ? "✓" : step.number}
              </div>
              {/* Label */}
              <span
                className={`mt-2 text-xs font-medium whitespace-nowrap ${
                  step.current ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            
            {/* Line between steps - only if not the last step */}
            {index < steps.length - 1 && (
              <div className="w-16 sm:w-24 h-0.5 mx-3 mb-6">
                <div
                  className={`h-full ${
                    step.completed ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

