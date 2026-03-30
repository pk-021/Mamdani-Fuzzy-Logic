import React from 'react';
import { Rule, InferenceResult, RULES, InferenceMethod } from '../core/mamdani';
import { FuzzySet, INPUT_VARIABLES, OUTPUT_VARIABLE, evaluateMembership } from '../fuzzy/fuzzy';
import { ArrowRight, CheckCircle2, XCircle, Info } from 'lucide-react';

interface Props {
  fuzzifiedInputs: Record<string, FuzzySet>;
  inferenceResults: InferenceResult[];
  method: InferenceMethod;
}

export const InferenceVisualizer: React.FC<Props> = ({ fuzzifiedInputs, inferenceResults, method }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-500" />
          <span>Rule Inference Walkthrough ({method})</span>
        </h2>
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {RULES.length} Rules in Knowledge Base
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {RULES.map((rule, idx) => {
          const result = inferenceResults.find(r => r.ruleId === rule.id);
          const activation = result?.activation || 0;
          const isActive = activation > 0;

          return (
            <div 
              key={rule.id} 
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                isActive 
                  ? 'bg-white border-blue-200 shadow-md scale-[1.01]' 
                  : 'bg-gray-50/50 border-gray-100 opacity-60 grayscale-[0.5]'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {rule.id}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">IF</span>
                    {rule.conditions.map((cond, cIdx) => (
                      <React.Fragment key={cIdx}>
                        <div className="flex items-center space-x-1.5 bg-white border border-gray-100 px-2.5 py-1 rounded-lg shadow-sm">
                          <span className="text-xs font-medium text-gray-500">{cond.variable} is</span>
                          <span className={`text-xs font-bold ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                            {cond.membership}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 ml-1">
                            ({(fuzzifiedInputs[cond.variable]?.[cond.membership] || 0).toFixed(2)})
                          </span>
                        </div>
                        {cIdx < rule.conditions.length - 1 && (
                          <span className="text-xs font-bold text-blue-400">{rule.operator}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    Activation: {(activation * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <ArrowRight className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-300'}`} />
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">THEN</span>
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    <span className="text-xs font-medium opacity-80">Approval is</span>
                    <span className="text-sm font-bold">{rule.consequent}</span>
                  </div>
                </div>
              </div>

              {/* Mini visualization of the implication */}
              {isActive && (
                <div className="mt-4 pt-4 border-t border-blue-50">
                  <div className="h-12 w-full flex items-end space-x-0.5">
                    {Array.from({ length: 50 }).map((_, i) => {
                      const x = (i / 49) * 100;
                      const mf = OUTPUT_VARIABLE.memberships.find(m => m.name === rule.consequent);
                      const membership = mf ? evaluateMembership(x, mf) : 0;
                      
                      // Implication logic
                      const implied = method === 'max-min' 
                        ? Math.min(activation, membership)
                        : activation * membership;
                      
                      return (
                        <div 
                          key={i} 
                          className="flex-1 bg-blue-500 rounded-t-sm transition-all duration-500"
                          style={{ height: `${implied * 100}%`, opacity: 0.3 + implied * 0.7 }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
