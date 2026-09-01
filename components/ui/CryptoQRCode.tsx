import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from './Toast';

interface CryptoQRCodeProps {
  address: string;
  asset: 'BTC' | 'ETH' | 'USDT';
  network?: string;
  amount?: number;
}

export const CryptoQRCode: React.FC<CryptoQRCodeProps> = ({
  address,
  asset,
  network,
  amount,
}) => {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    success('Address Copied', `${asset} receiving address copied to clipboard`);
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate deterministic QR-like SVG patterns based on address string
  const generatePattern = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    
    const size = 17; // 17x17 grid
    const grid: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      grid[r] = [];
      for (let c = 0; c < size; c++) {
        // Corner finder patterns
        if (
          (r < 4 && c < 4) ||
          (r < 4 && c >= size - 4) ||
          (r >= size - 4 && c < 4)
        ) {
          const inCorner =
            (r === 0 || r === 3 || c === 0 || c === 3) ||
            (r === 0 || r === 3 || c === size - 1 || c === size - 4) ||
            (r === size - 1 || r === size - 4 || c === 0 || c === 3) ||
            (r >= 1 && r <= 2 && c >= 1 && c <= 2) ||
            (r >= 1 && r <= 2 && c >= size - 3 && c <= size - 2) ||
            (r >= size - 3 && r <= size - 2 && c >= 1 && c <= 2);
          grid[r][c] = inCorner;
        } else {
          const bit = Math.abs(Math.sin((hash + r * 13 + c * 37))) > 0.45;
          grid[r][c] = bit;
        }
      }
    }
    return grid;
  };

  const grid = generatePattern(address);

  return (
    <div className="flex flex-col items-center bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center">
      <div className="relative p-3 bg-white border border-slate-200 rounded-xl shadow-xs mb-4">
        <svg
          viewBox="0 0 170 170"
          className="w-40 h-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          {grid.map((row, r) =>
            row.map((active, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * 10}
                y={r * 10}
                width="9.5"
                height="9.5"
                rx="1.5"
                fill={active ? '#0B172A' : 'transparent'}
              />
            ))
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center shadow-md">
            <span className="text-[11px] font-black text-slate-900">{asset}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {asset} Receiving Address {network ? `(${network})` : ''}
        </p>
        <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl">
          <code className="text-xs text-slate-800 font-mono break-all flex-1 text-left select-all px-1">
            {address}
          </code>
          <button
            onClick={handleCopy}
            className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Copy address"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        {amount && (
          <p className="text-xs text-slate-600 font-medium mt-2">
            Send exactly <span className="font-bold text-slate-900">${amount.toLocaleString()}</span> USD equivalent in {asset}
          </p>
        )}
      </div>
    </div>
  );
};
