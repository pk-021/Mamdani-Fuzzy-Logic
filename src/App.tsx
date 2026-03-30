import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ApplicationForm } from './ui/ApplicationForm';
import { FuzzyVariableChart } from './ui/FuzzyVariableChart';
import { InferenceVisualizer } from './ui/InferenceVisualizer';
import { AggregationChart } from './ui/AggregationChart';
import { CrispInput, fuzzifyAll, INPUT_VARIABLES, OUTPUT_VARIABLE } from './fuzzy/fuzzy';
import { runInference, aggregate, defuzzifyCentroid, InferenceMethod } from './core/mamdani';
import { PRESETS } from './data/presets';
import { 
  Calculator, 
  Settings2, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  BrainCircuit,
  Activity,
  Layers,
  BarChart3,
  Info,
  Zap
} from 'lucide-react';

const BrandIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
    <rect width="32" height="32" rx="10" fill="url(#paint0_linear)" />
    <path d="M16 22V16M16 16L10 10M16 16L22 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="22" r="2.5" fill="white"/>
    <circle cx="10" cy="10" r="2.5" fill="white"/>
    <circle cx="22" cy="10" r="2.5" fill="white"/>
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1E1B4B" />
      </linearGradient>
    </defs>
  </svg>
);

export default function App() {
  const [inputs, setInputs] = useState<CrispInput>(PRESETS["Ideal Candidate"]);
  const [activeTab, setActiveTab] = useState<'fuzzification' | 'inference' | 'aggregation'>('fuzzification');
  const [inferenceMethod, setInferenceMethod] = useState<InferenceMethod>('max-min');
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  // Mamdani Inference Pipeline
  const fuzzifiedInputs = useMemo(() => fuzzifyAll(inputs), [inputs]);
  const inferenceResults = useMemo(() => runInference(fuzzifiedInputs), [fuzzifiedInputs]);
  const aggregated = useMemo(() => aggregate(inferenceResults, OUTPUT_VARIABLE, inferenceMethod), [inferenceResults, inferenceMethod]);
  const centroid = useMemo(() => defuzzifyCentroid(aggregated, OUTPUT_VARIABLE), [aggregated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target as Node)) {
        setIsPresetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetChange = (presetName: string) => {
    const preset = PRESETS[presetName];
    if (preset) {
      setInputs(preset);
      setIsPresetDropdownOpen(false);
    }
  };

  const getStatusColor = (score: number) => {
    if (score >= 60) return 'text-green-600 bg-green-50 border-green-100';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getStatusLabel = (score: number) => {
    if (score >= 60) return 'Approved';
    if (score >= 40) return 'Marginal';
    return 'Rejected';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <BrandIcon />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-slate-800">
              FuzzyFlow FIS
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mamdani Inference System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 mr-2">
            <button
              onClick={() => setInferenceMethod('max-min')}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                inferenceMethod === 'max-min' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Max-Min
            </button>
            <button
              onClick={() => setInferenceMethod('max-product')}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                inferenceMethod === 'max-product' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Max-Product
            </button>
          </div>

          <div className="relative flex items-center" ref={presetDropdownRef}>
            <button
              onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
              className="flex items-center justify-between w-48 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-blue-500 pl-4 pr-3 py-2.5 transition-all hover:bg-gray-100 outline-none"
            >
              <span>Load Profile...</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isPresetDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isPresetDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-2xl py-1 z-50 overflow-hidden origin-top-right">
                <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  Candidate Presets
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {Object.keys(PRESETS).map(key => (
                    <button
                      key={key}
                      onClick={() => handlePresetChange(key)}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-l-4 border-transparent hover:border-blue-500"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${getStatusColor(centroid)} shadow-sm transition-all duration-500`}>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Final Decision</span>
              <span className="text-sm font-bold">{getStatusLabel(centroid)}</span>
            </div>
            <div className="text-2xl font-black font-mono border-l border-current pl-3 ml-1">
              {centroid.toFixed(1)}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Inputs */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 flex-shrink-0">
          <ApplicationForm inputs={inputs} onChange={setInputs} />
        </aside>

        {/* Main Content: Inference Walkthrough */}
        <section className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 px-6 flex items-center space-x-8">
            <button 
              onClick={() => setActiveTab('fuzzification')}
              className={`py-4 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${
                activeTab === 'fuzzification' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>1. Fuzzification</span>
            </button>
            <button 
              onClick={() => setActiveTab('inference')}
              className={`py-4 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${
                activeTab === 'inference' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Rule Inference</span>
            </button>
            <button 
              onClick={() => setActiveTab('aggregation')}
              className={`py-4 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${
                activeTab === 'aggregation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>3. Aggregation & Defuzzification</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'fuzzification' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start space-x-4">
                  <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-blue-900 font-bold mb-1">Step 1: Fuzzification</h3>
                    <p className="text-blue-800/70 text-sm leading-relaxed">
                      Converting crisp numerical inputs into fuzzy linguistic sets. Each input value is mapped to its degree of membership (0 to 1) in various categories.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {INPUT_VARIABLES.map(variable => (
                    <FuzzyVariableChart 
                      key={variable.name} 
                      variable={variable} 
                      currentValue={(inputs as any)[variable.name === "Credit Score" ? "creditScore" : 
                                     variable.name === "DTI Ratio" ? "dti" :
                                     variable.name === "Annual Income" ? "income" :
                                     variable.name === "Employment History" ? "employment" :
                                     variable.name === "LTV Ratio" ? "ltv" :
                                     variable.name === "Savings Liquidity" ? "savings" : "defaults"]}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'inference' && (
              <div className="max-w-4xl mx-auto">
                <InferenceVisualizer 
                  fuzzifiedInputs={fuzzifiedInputs} 
                  inferenceResults={inferenceResults} 
                  method={inferenceMethod}
                />
              </div>
            )}

            {activeTab === 'aggregation' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start space-x-4">
                  <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-indigo-900 font-bold mb-1">Step 3: Aggregation & Defuzzification</h3>
                    <p className="text-indigo-800/70 text-sm leading-relaxed">
                      The activated consequents from all rules are combined (aggregated) into a single fuzzy set. Finally, the Centroid method calculates the "center of gravity" to produce a crisp final score.
                    </p>
                  </div>
                </div>
                <AggregationChart 
                  variable={OUTPUT_VARIABLE} 
                  aggregated={aggregated} 
                  centroid={centroid} 
                  method={inferenceMethod}
                  inferenceResults={inferenceResults}
                />
                
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Final Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Active Rules</span>
                      <span className="text-2xl font-black text-gray-700">{inferenceResults.filter(r => r.activation > 0).length}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Max Activation</span>
                      <span className="text-2xl font-black text-gray-700">{(Math.max(...inferenceResults.map(r => r.activation)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Defuzzification</span>
                      <span className="text-2xl font-black text-gray-700">Centroid</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
