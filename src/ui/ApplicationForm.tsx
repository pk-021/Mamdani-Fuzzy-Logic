import React from "react";
import { CrispInput } from "../fuzzy/fuzzy";

interface ApplicationFormProps {
  inputs: CrispInput;
  onChange: (inputs: CrispInput) => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ inputs, onChange }) => {
  const handleChange = (key: keyof CrispInput, value: number) => {
    onChange({ ...inputs, [key]: value });
  };

  const renderSlider = (label: string, key: keyof CrispInput, min: number, max: number, step: number = 1, unit: string = "") => {
    const value = inputs[key];
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-gray-700">{label}</label>
          <div className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 shadow-sm">
            {value.toLocaleString()}{unit}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 flex items-center h-6">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className="absolute w-full h-2 appearance-none cursor-pointer rounded-full outline-none transition-all
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110
                [&::-webkit-slider-thumb]:transition-transform
              "
              style={{
                background: `linear-gradient(to right, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%)`
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Application Details</h2>
      
      {renderSlider("Credit Score", "creditScore", 300, 850)}
      {renderSlider("DTI Ratio", "dti", 0, 100, 1, "%")}
      {renderSlider("Annual Income", "income", 0, 200000, 1000, "$")}
      {renderSlider("Employment History", "employment", 0, 30, 1, "y")}
      {renderSlider("LTV Ratio", "ltv", 0, 100, 1, "%")}
      {renderSlider("Savings Liquidity", "savings", 0, 100000, 1000, "$")}
      {renderSlider("Previous Defaults", "defaults", 0, 10)}
    </div>
  );
};
