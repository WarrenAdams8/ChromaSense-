import React, { useState } from 'react';
import Dropzone from './components/Dropzone';
import PaletteDisplay from './components/PaletteDisplay';
import { loadImage, analyzeImage } from './utils/colorAnalysis';
import { PaletteResult } from './types';
import { Palette, RefreshCw, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [paletteResult, setPaletteResult] = useState<PaletteResult | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleImageSelected = async (file: File) => {
    try {
      setProcessingImage(true);
      setExecutionTime(null);
      
      const imgElement = await loadImage(file);
      setImageSrc(imgElement.src);
      
      const startTime = performance.now();
      const result = analyzeImage(imgElement);
      const endTime = performance.now();
      
      setExecutionTime(endTime - startTime);
      setPaletteResult(result);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setProcessingImage(false);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setPaletteResult(null);
    setExecutionTime(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/30">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">ChromaSense</h1>
              <p className="text-slate-400 text-sm">Extract & Analyze Colors with Canvas</p>
            </div>
          </div>
          {imageSrc && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              New Image
            </button>
          )}
        </header>

        {/* Main Content */}
        <main className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column: Input & Preview */}
          <div className="space-y-6">
            {!imageSrc ? (
              <Dropzone onImageSelected={handleImageSelected} />
            ) : (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800">
                <img 
                  src={imageSrc} 
                  alt="Uploaded preview" 
                  className="w-full h-auto object-cover max-h-[500px]"
                />
              </div>
            )}

            {processingImage && (
              <div className="flex items-center justify-center p-4 text-indigo-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Processing pixels...
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="space-y-8">
            {paletteResult ? (
              <div className="space-y-3">
                <PaletteDisplay 
                  dominant={paletteResult.dominant} 
                  colors={paletteResult.palette} 
                />
                
                {executionTime !== null && (
                  <div className="flex justify-end animate-fade-in">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Processing time: {executionTime.toFixed(2)}ms</span>
                      </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State / Placeholder */
              <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center">
                <Palette className="w-12 h-12 mb-4 opacity-20" />
                <p>Upload an image to extract its dominant color and palette.</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default App;