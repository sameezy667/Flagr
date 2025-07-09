import React, { useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AnalysisResult } from '../types';

const RISK_BUCKETS = [
  { label: 'Low (0-3)', min: 0, max: 3 },
  { label: 'Medium (4-7)', min: 4, max: 7 },
  { label: 'High (8-10)', min: 8, max: 10 },
];

const SEVERITIES = ['Low', 'Medium', 'High'];
const COLORS = ['#1DB954', '#facc15', '#ef4444'];

function interpolateColor(value: number, min: number, max: number) {
  if (value === 0) return '#23272b';
  const percent = (value - min) / (max - min);
  let r, g, b;
  if (percent < 0.5) {
    r = Math.round(29 + (250 - 29) * (percent / 0.5));
    g = Math.round(185 + (202 - 185) * (percent / 0.5));
    b = Math.round(84 + (21 - 84) * (percent / 0.5));
  } else {
    r = Math.round(250 + (239 - 250) * ((percent - 0.5) / 0.5));
    g = Math.round(202 + (68 - 202) * ((percent - 0.5) / 0.5));
    b = Math.round(21 + (68 - 21) * ((percent - 0.5) / 0.5));
  }
  return `rgb(${r},${g},${b})`;
}

function getRiskColor(score: number) {
  return interpolateColor(score, 0, 10);
}

function getFlagColor(idx: number, value: number) {
  if (value === 0) return '#23272b';
  if (idx === 2) return interpolateColor(10, 0, 10); // High
  if (idx === 1) return interpolateColor(6, 0, 10); // Medium
  return interpolateColor(2, 0, 10); // Low
}

// Enhanced: multi-stop color scale for density heatmap
function getHeatmapColor(score: number) {
  // 0 = deep blue, 2 = cyan, 4 = green, 6 = yellow, 8 = orange, 9 = red, 10 = white
  if (score <= 0) return 'rgba(0, 32, 128, 0.7)'; // deep blue
  if (score <= 2) return 'rgba(0, 200, 255, 0.7)'; // cyan
  if (score <= 4) return 'rgba(0, 255, 128, 0.7)'; // green
  if (score <= 6) return 'rgba(255, 255, 0, 0.7)'; // yellow
  if (score <= 8) return 'rgba(255, 128, 0, 0.7)'; // orange
  if (score <= 9) return 'rgba(255, 64, 0, 0.8)'; // red
  return 'rgba(255,255,255,0.95)'; // white
}

function getHeatmapGradient(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, score: number) {
  // Multi-stop radial gradient: deep blue-cyan-green-yellow-orange-red-white
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, getHeatmapColor(score));
  grad.addColorStop(0.15, getHeatmapColor(score));
  grad.addColorStop(0.35, 'rgba(0,255,128,0.4)'); // green
  grad.addColorStop(0.55, 'rgba(255,255,0,0.25)'); // yellow
  grad.addColorStop(0.7, 'rgba(255,128,0,0.18)'); // orange
  grad.addColorStop(0.85, 'rgba(255,64,0,0.12)'); // red
  grad.addColorStop(1, 'rgba(0,0,0,0)'); // transparent
  return grad;
}

function HeatmapLegendBar() {
  // Show a horizontal color bar from deep blue to cyan to green to yellow to orange to red to white
  const gradient = 'linear-gradient(90deg, #002080 0%, #00c8ff 15%, #00ff80 35%, #ffff00 55%, #ff8000 70%, #ff4000 85%, #fff 100%)';
  return (
    <div className="flex flex-col items-center mt-2 mb-1">
      <div className="w-56 h-3 rounded-full" style={{ background: gradient }} />
      <div className="flex justify-between w-56 text-xs text-gray-400 mt-1">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}

// Density heatmap for risk scores (eye-catching version)
const DensityHeatmap: React.FC<{ risks: { area: string; score: number }[] }> = ({ risks }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const width = 440;
  const height = 200;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const n = risks.length;
    // Draw vignette for focus
    const vignette = ctx.createRadialGradient(width/2, height/2, width/3, width/2, height/2, width/1.1);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    // Draw heat spots
    risks.forEach((risk, i) => {
      const x = ((i + 0.5) / n) * width;
      const y = height / 2 + (Math.sin(i * 1.2) * 32);
      const radius = 80 + risk.score * 4.5;
      const grad = getHeatmapGradient(ctx, x, y, radius, risk.score);
      ctx.globalAlpha = 0.97;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fillStyle = grad;
      // No shadow or glow
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    // Add a subtle highlight in the center for depth
    const highlight = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2.2);
    highlight.addColorStop(0, 'rgba(255,255,255,0.07)');
    highlight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = highlight;
    ctx.fillRect(0, 0, width, height);
  }, [risks]);
  // Animated shimmer overlay
  useEffect(() => {
    if (!shimmerRef.current) return;
    shimmerRef.current.animate([
      { backgroundPosition: '0% 0%' },
      { backgroundPosition: '100% 100%' }
    ], {
      duration: 3200,
      iterations: Infinity
    });
  }, []);
  return (
    <div className="flex flex-col items-center mt-4 mb-2 relative">
      <div className="relative" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ width: width, height: height, borderRadius: 24, background: '#18181b' }}
        />
        {/* Animated shimmer overlay */}
        <div
          ref={shimmerRef}
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: width,
            height: height,
            borderRadius: 24,
            background: 'linear-gradient(120deg, transparent 60%, #fff2 80%, transparent 100%)',
            opacity: 0.13,
            filter: 'blur(6px)',
            zIndex: 2,
          }}
        />
        {/* Title overlay */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-white text-lg font-bold drop-shadow-lg tracking-wide" style={{ zIndex: 3, textShadow: '0 2px 8px #000a' }}>
          Risk Hotspot Map
        </div>
        {/* No glowing border */}
      </div>
      <div className="flex justify-between w-full mt-2 px-2">
        {risks.map((risk, i) => (
          <span key={risk.area} className="text-xs text-gray-400" style={{ width: `${100 / risks.length}%`, textAlign: 'center' }}>{risk.area}</span>
        ))}
      </div>
      <HeatmapLegendBar />
    </div>
  );
};

interface DocumentInfographicsProps {
  results: AnalysisResult;
}

const DocumentInfographics: React.FC<DocumentInfographicsProps> = ({ results }) => {
  const risks = results.riskAssessment?.risks || [];
  const flags = results.flags || [];

  // Risk matrix: rows = areas, columns = buckets
  const riskAreas = risks.map(risk => risk.area);
  const riskMatrix = risks.map(risk =>
    RISK_BUCKETS.map(bucket => (risk.score >= bucket.min && risk.score <= bucket.max ? risk.score : 0))
  );

  // Flag matrix: single row, columns = severities
  const flagAreas = ['All Flags'];
  const flagMatrix = [SEVERITIES.map(sev => flags.filter(f => f.severity === sev).length)];

  // Data for bar chart (risk scores)
  const riskData = risks.map(risk => ({
    area: risk.area,
    score: risk.score,
  }));

  // Data for pie chart (flag severities)
  const flagCounts: Record<string, number> = {};
  flags.forEach(flag => {
    flagCounts[flag.severity] = (flagCounts[flag.severity] || 0) + 1;
  });
  const flagData = Object.entries(flagCounts).map(([severity, count]) => ({
    name: severity,
    value: count,
  }));

  return (
    <div className="flex flex-col gap-8 w-full my-8">
      {/* --- Density Heatmap FIRST --- */}
      <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-4">Risk Score Density Heatmap</h4>
        <DensityHeatmap risks={riskData} />
      </div>
      {/* --- Grid Heatmap --- */}
      <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-4">Risk Score Heatmap (Grid)</h4>
        <HeatmapLegendBar />
        <div className="overflow-x-auto">
          {risks.length > 0 ? (
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 p-2"></th>
                  {RISK_BUCKETS.map(bucket => (
                    <th key={bucket.label} className="text-gray-400 p-2 text-sm font-semibold">{bucket.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riskAreas.map((area, i) => (
                  <tr key={area}>
                    <td className="text-gray-300 p-2 text-sm font-medium">{area}</td>
                    {riskMatrix[i].map((value, j) => (
                      <td key={j} className="p-2">
                        <div
                          className="w-16 h-12 flex items-center justify-center rounded-xl transition-all duration-200 shadow-lg cursor-pointer border border-neutral-800 hover:scale-110 hover:ring-2 hover:ring-spotify relative group"
                          style={{ background: getRiskColor(value), color: '#fff', fontWeight: 600, fontSize: 18 }}
                        >
                          {value > 0 ? value : ''}
                          {value > 0 && (
                            <span className="absolute bottom-1 right-2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">Score</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-neutral-400">No risk data available.</div>
          )}
        </div>
      </div>
      {/* --- Bar Chart --- */}
      <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-4">Risk Scores by Area (Bar Chart)</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={riskData} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
            <XAxis dataKey="area" stroke="#aaa" tick={{ fill: '#aaa' }} />
            <YAxis stroke="#aaa" tick={{ fill: '#aaa' }} domain={[0, 10]} />
            <RechartsTooltip />
            <Bar dataKey="score" fill="#1DB954" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* --- Pie Chart --- */}
      <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-4">Flags by Severity (Pie Chart)</h4>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={flagData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {flagData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* --- Flags Heatmap --- */}
      <div className="bg-neutral-900 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-4">Flags by Severity Heatmap</h4>
        <HeatmapLegendBar />
        <div className="overflow-x-auto">
          {flags.length > 0 ? (
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 p-2"></th>
                  {SEVERITIES.map(sev => (
                    <th key={sev} className="text-gray-400 p-2 text-sm font-semibold">{sev}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flagAreas.map((area, i) => (
                  <tr key={area}>
                    <td className="text-gray-300 p-2 text-sm font-medium">{area}</td>
                    {flagMatrix[i].map((value, j) => (
                      <td key={j} className="p-2">
                        <div
                          className="w-16 h-12 flex items-center justify-center rounded-xl transition-all duration-200 shadow-lg cursor-pointer border border-neutral-800 hover:scale-110 hover:ring-2 hover:ring-spotify relative group"
                          style={{ background: getFlagColor(j, value), color: '#fff', fontWeight: 600, fontSize: 18 }}
                        >
                          {value > 0 ? value : ''}
                          {value > 0 && (
                            <span className="absolute bottom-1 right-2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">{SEVERITIES[j]}</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-neutral-400">No flag data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentInfographics; 