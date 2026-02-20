import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Portfolio Performance Line Chart
export function PortfolioChart({ trades = [] }) {
  // Generate data from trades or use mock data
  const generatePortfolioData = () => {
    if (trades.length === 0) {
      // Mock data for demo
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Portfolio Value',
          data: [10000, 12500, 11800, 15200, 14800, 18500],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    }

    // Process real trade data
    const sortedTrades = trades.sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningTotal = 10000; // Starting portfolio value
    const portfolioData = [];
    const labels = [];

    sortedTrades.forEach((trade, index) => {
      runningTotal += trade.pl || 0;
      portfolioData.push(runningTotal);
      labels.push(new Date(trade.date).toLocaleDateString());
    });

    return {
      labels,
      datasets: [{
        label: 'Portfolio Value',
        data: portfolioData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b'
        }
      },
      y: {
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        ticks: {
          color: '#64748b',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="h-64">
      <Line data={generatePortfolioData()} options={options} />
    </div>
  );
}

// Monthly P&L Bar Chart
export function MonthlyPLChart({ trades = [] }) {
  const generateMonthlyData = () => {
    if (trades.length === 0) {
      // Mock data for demo
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Monthly P&L',
          data: [2500, -700, 3400, -300, 4700, 1200],
          backgroundColor: function(context) {
            const value = context.parsed.y;
            return value >= 0 ? '#22c55e' : '#ef4444';
          },
          borderRadius: 4,
          borderSkipped: false
        }]
      };
    }

    // Process real trade data by month
    const monthlyPL = {};
    trades.forEach(trade => {
      const month = new Date(trade.date).toLocaleDateString('en-US', { month: 'short' });
      monthlyPL[month] = (monthlyPL[month] || 0) + (trade.pl || 0);
    });

    return {
      labels: Object.keys(monthlyPL),
      datasets: [{
        label: 'Monthly P&L',
        data: Object.values(monthlyPL),
        backgroundColor: function(context) {
          const value = context.parsed.y;
          return value >= 0 ? '#22c55e' : '#ef4444';
        },
        borderRadius: 4,
        borderSkipped: false
      }]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b'
        }
      },
      y: {
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        ticks: {
          color: '#64748b',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Bar data={generateMonthlyData()} options={options} />
    </div>
  );
}

// Asset Allocation Doughnut Chart
export function AssetAllocationChart({ trades = [] }) {
  const generateAllocationData = () => {
    if (trades.length === 0) {
      // Mock data for demo
      return {
        labels: ['Stocks', 'Options', 'Crypto', 'Forex'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: [
            '#3b82f6',
            '#8b5cf6',
            '#f59e0b',
            '#10b981'
          ],
          borderWidth: 0,
          cutout: '60%'
        }]
      };
    }

    // Process real trade data by asset type
    const assetAllocation = {};
    trades.forEach(trade => {
      const assetType = trade.assetType || 'Stocks';
      assetAllocation[assetType] = (assetAllocation[assetType] || 0) + 1;
    });

    return {
      labels: Object.keys(assetAllocation),
      datasets: [{
        data: Object.values(assetAllocation),
        backgroundColor: [
          '#3b82f6',
          '#8b5cf6',
          '#f59e0b',
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 0,
        cutout: '60%'
      }]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#64748b',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    }
  };

  return (
    <div className="h-64">
      <Doughnut data={generateAllocationData()} options={options} />
    </div>
  );
}

// Win Rate Trend Chart
export function WinRateChart({ trades = [] }) {
  const generateWinRateData = () => {
    if (trades.length === 0) {
      // Mock data for demo
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Win Rate %',
          data: [65, 72, 58, 78],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    }

    // Calculate weekly win rates from real data
    const weeklyData = {};
    trades.forEach(trade => {
      const week = 'Week ' + Math.ceil(new Date(trade.date).getDate() / 7);
      if (!weeklyData[week]) {
        weeklyData[week] = { wins: 0, total: 0 };
      }
      weeklyData[week].total++;
      if ((trade.pl || 0) > 0) {
        weeklyData[week].wins++;
      }
    });

    const labels = Object.keys(weeklyData);
    const winRates = labels.map(week => 
      weeklyData[week].total > 0 ? (weeklyData[week].wins / weeklyData[week].total) * 100 : 0
    );

    return {
      labels,
      datasets: [{
        label: 'Win Rate %',
        data: winRates,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(context) {
            return `Win Rate: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b'
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        ticks: {
          color: '#64748b',
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Line data={generateWinRateData()} options={options} />
    </div>
  );
}