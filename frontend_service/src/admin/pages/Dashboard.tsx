/**
 * Admin Dashboard Overview Page
 * Displays key metrics and statistics
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
import { useState, useEffect } from 'react';
import { Title } from 'react-admin';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { dashboardApi } from '../dataProvider/customMethods';
import { DashboardStats, TopSellingBook } from '../types';
import { RevenueChart } from '../components/RevenueChart';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

const StatsCard = ({ title, value, subtitle, icon, color }: StatsCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ backgroundColor: `${color}20`, borderRadius: 2, p: 1, mr: 2 }}>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Typography color="text.secondary" variant="body2">{title}</Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{subtitle}</Typography>}
    </CardContent>
  </Card>
);


interface TopSellingBooksProps {
  books: TopSellingBook[];
}

const TopSellingBooks = ({ books }: TopSellingBooksProps) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <MenuBookIcon sx={{ mr: 1 }} />
        Top 10 Sách Bán Chạy
      </Typography>
      <List>
        {books.length === 0 ? (
          <ListItem><ListItemText primary="Chưa có dữ liệu" /></ListItem>
        ) : (
          books.map((book, index) => (
            <Box key={book.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar variant="rounded" src={book.coverImage} sx={{ width: 50, height: 70, mr: 1 }}>
                    {book.title.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography component="span" sx={{ backgroundColor: 'primary.main', color: 'white', borderRadius: 1, px: 1, py: 0.25, mr: 1, fontSize: '0.75rem', fontWeight: 'bold' }}>
                        #{index + 1}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{book.title}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">{book.author}</Typography>
                      <Typography variant="body2" color="primary">
                        Đã bán: {book.salesCount} | Doanh thu: {formatCurrency(book.revenue)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < books.length - 1 && <Divider variant="inset" component="li" />}
            </Box>
          ))
        )}
      </List>
    </CardContent>
  </Card>
);


export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(err.message || 'Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Typography variant="body2" color="text.secondary">Vui lòng kiểm tra kết nối và thử lại.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Title title="Dashboard" />
      <Typography variant="h4" gutterBottom>Chào mừng đến Admin Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Tổng quan hoạt động kinh doanh của cửa hàng sách.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Doanh thu hôm nay" value={formatCurrency(stats?.revenue.daily || 0)}
            subtitle={`Tuần: ${formatCurrency(stats?.revenue.weekly || 0)}`} icon={<TrendingUpIcon />} color="#4caf50" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Doanh thu tháng" value={formatCurrency(stats?.revenue.monthly || 0)}
            subtitle="30 ngày gần nhất" icon={<TrendingUpIcon />} color="#2196f3" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Đơn hàng mới (24h)" value={stats?.orders.newCount || 0}
            subtitle={`Đang chờ: ${stats?.orders.pendingCount || 0}`} icon={<ShoppingCartIcon />} color="#ff9800" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Người dùng mới (7 ngày)" value={stats?.users.newRegistrations || 0}
            subtitle={`Hoạt động: ${stats?.users.activeCount || 0}`} icon={<PeopleIcon />} color="#9c27b0" />
        </Grid>
      </Grid>

      {/* Revenue Chart - Requirement: 1.5 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <RevenueChart />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TopSellingBooks books={stats?.topBooks || []} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>📊 Tóm tắt</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>• <strong>Đơn hàng hôm nay:</strong> {stats?.orders.totalToday || 0}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>• <strong>Đơn đang chờ xử lý:</strong> {stats?.orders.pendingCount || 0}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>• <strong>Người dùng hoạt động:</strong> {stats?.users.activeCount || 0}</Typography>
                <Typography variant="body2">• <strong>Đăng ký mới (7 ngày):</strong> {stats?.users.newRegistrations || 0}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">Dữ liệu được cập nhật tự động khi tải trang.</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboard;
