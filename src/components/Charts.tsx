import { formatRupiah } from '@/lib/format';

interface BarChartProps {
  data: { label: string; income: number; expense: number }[];
}

export function BarChart({ data }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
  const barHeight = 160;

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height: barHeight + 40 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full items-end justify-center gap-1" style={{ height: barHeight }}>
            <div
              className="w-3 sm:w-4 rounded-t-md bg-sage-400 transition-all duration-500"
              style={{ height: `${(d.income / maxVal) * barHeight}px` }}
              title={`Pemasukan: ${formatRupiah(d.income)}`}
            />
            <div
              className="w-3 sm:w-4 rounded-t-md bg-florist-400 transition-all duration-500"
              style={{ height: `${(d.expense / maxVal) * barHeight}px` }}
              title={`Pengeluaran: ${formatRupiah(d.expense)}`}
            />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

export function LineChart({ data, color = '#5d8654' }: LineChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const width = 100;
  const height = 100;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

  const points = data
    .map((d, i) => `${i * stepX},${height - (d.value / maxVal) * height}`)
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height: 180 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#lineGradient)" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={i * stepX}
            cy={height - (d.value / maxVal) * height}
            r="1.5"
            fill={color}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] sm:text-xs text-gray-500">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-40 h-40 -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="12" />
        {total > 0 &&
          data.map((d, i) => {
            const dash = (d.value / total) * circumference;
            const segment = (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth="12"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return segment;
          })}
      </svg>
      <div className="flex flex-col gap-2 w-full">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-gray-600">{d.label}</span>
            </div>
            <span className="font-medium text-gray-800">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
