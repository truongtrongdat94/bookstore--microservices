/**
 * Revenue Chart Component
 * Displays interactive revenue trends over time
 * Requirement: 1.5
 */
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { dashboardApi } from '../dataProvider/customMethods';
import { RevenueChartData } from '../types';

type ChartPeriod = 'week' | 'month' | 'year';

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

const formatTooltipValue = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ backgroundColor: 'white', p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>{label}</Typography>
        <Typography variant="body2" color="primary">
          Doanh thu: {formatTooltipValue(payload[0].value)}
        </Typography>
        {payload[1] && (
          <Typography variant="body2" color="secondary">
            Đơn hàng: {payload[1].value}
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};

export function RevenueChart() {
  const [period, setPeriod] = useState<ChartPeriod>('week');
  const [chartData, setChartData] = useState<RevenueChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardApi.getRevenueChart(period);
        setChartData(data);
      } catch (err: any) {
        console.error('Failed to fetch revenue chart:', err);
        setError(err.message || 'Không thể tải dữ liệu biểu đồ');
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [period]);

  const handlePeriodChange = (_: React.MouseEvent<HTMLElement>, newPeriod: ChartPeriod | null) => {
    if (newPeriod) {
      setPeriod(newPeriod);
    }
  };

  const getPeriodLabel = (p: ChartPeriod): string => {
    switch (p) {
      case 'week': return '7 ngày';
      case 'month': return '30 ngày';
      case 'year': return '12 tháng';
      default: return '';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">📈 Biểu đồ Doanh thu</Typography>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            size="small"
          >
            <ToggleButton value="week">Tuần</ToggleButton>
            <ToggleButton value="month">Tháng</ToggleButton>
            <ToggleButton value="year">Năm</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : chartData.length === 0 ? (
          <Alert severity="info">Chưa có dữ liệu cho khoảng thời gian này</Alert>
        ) : (
          <Box sx={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (period === 'year') {
                      return value.substring(5); // Show MM only for year view
                    }
                    return value.substring(5); // Show MM-DD
                  }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#2196f3"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orderCount"
                  name="Số đơn hàng"
                  stroke="#ff9800"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Hiển thị dữ liệu {getPeriodLabel(period)} gần nhất
        </Typography>
      </CardContent>
    </Card>
  );
}

export default RevenueChart;
