// Research Charts — Revenue, Profit, Margin, FII/DII charts
import { Line, Bar } from 'react-chartjs-2';

export function RevenueGrowthChart({ data }) {
  if (!data || data.length === 0) return <EmptyChart text="No revenue data" />;

  const chartData = {
    labels: data.map(d => d.period),
    datasets: [{
      label: 'Revenue (₹ Cr)',
      data: data.map(d => d.value),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={chartOptions('Revenue (₹ Cr)')} />
    </div>
  );
}

export function ProfitGrowthChart({ data }) {
  if (!data || data.length === 0) return <EmptyChart text="No profit data" />;

  const chartData = {
    labels: data.map(d => d.period),
    datasets: [{
      label: 'Net Profit (₹ Cr)',
      data: data.map(d => d.value),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={chartOptions('Net Profit (₹ Cr)')} />
    </div>
  );
}

export function MarginTrendChart({ data }) {
  if (!data || data.length === 0) return <EmptyChart text="No margin data" />;

  const chartData = {
    labels: data.map(d => d.period),
    datasets: [{
      label: 'Operating Margin (%)',
      data: data.map(d => d.value),
      backgroundColor: function(context) {
        const value = context.parsed?.y || 0;
        return value >= 15 ? '#22c55e' : value >= 10 ? '#eab308' : '#ef4444';
      },
      borderRadius: 4,
      borderSkipped: false,
    }],
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions('Margin (%)', true)} />
    </div>
  );
}

export function FIIDIIChart({ company }) {
  if (!company) return <EmptyChart text="No institutional data" />;

  const chartData = {
    labels: ['FII', 'DII', 'Promoter', 'Public'],
    datasets: [{
      label: 'Ownership %',
      data: [
        company.fiiHolding || 0,
        company.diiHolding || 0,
        Math.max(0, 100 - (company.fiiHolding || 0) - (company.diiHolding || 0) - 15),
        15,
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(100, 116, 139, 0.5)',
      ],
      borderRadius: 4,
    }],
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions('Ownership %', true)} />
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
      {text}
    </div>
  );
}

function chartOptions(label, isBar = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(100, 116, 139, 0.1)' },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          callback: function(value) {
            if (label.includes('₹')) return '₹' + (value >= 1000 ? (value/1000).toFixed(0) + 'K' : value);
            if (label.includes('%')) return value + '%';
            return value;
          },
        },
      },
    },
  };
}
