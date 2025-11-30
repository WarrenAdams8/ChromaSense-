import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface PaletteDisplayProps {
  colors: string[];
  dominant: string;
}

const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ colors, dominant }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="w-full space-y-8 animate-fade-in-up">
      {/* Dominant Color */}
      <div>
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">Dominant Color</h3>
        <div 
          className="group relative h-24 w-full rounded-xl shadow-lg transition-transform hover:scale-[1.01] cursor-pointer flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: dominant }}
          onClick={() => handleCopy(dominant)}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
             {copiedColor === dominant ? <Check size={16} /> : <Copy size={16} />}
             <span>{dominant}</span>
          </div>
        </div>
      </div>

      {/* Palette */}
      <div>
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">Extracted Palette</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {colors.map((color, idx) => (
            <div 
              key={`${color}-${idx}`}
              className="group relative aspect-square rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: color }}
              onClick={() => handleCopy(color)}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-slate-900/80 text-white text-xs py-1 px-3 rounded-md font-mono flex items-center gap-2 backdrop-blur-md">
                   {copiedColor === color ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                   {color}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaletteDisplay;
