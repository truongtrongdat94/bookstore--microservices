/**
 * User Show Component for Admin Dashboard
 * Requirements: 9.3, 10.1, 10.2, 11.1
 */
import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  EmailField,
  DateField,
  useRecordContext,
  useNotify,
  useRefresh,
  useDataProvider,
  TopToolbar,
  ListButton,
  Confirm,
} from 'react-admin';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Box,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockResetIcon from '@mui/icons-material/LockReset';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HistoryIcon from '@mui/icons-material/History';

/**
 * Custom Actions Toolbar
 */
const ShowActions = () => (
  <TopToolbar>
    <ListButton label="Danh sách" />
  </TopToolbar>
);

/**
 * User Profile Card Component
 */
const UserProfileCard = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const [blockDialogOpen, setBlockDialogOpen] = React.useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = React.useState(false);
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [blockReason, setBlockReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (!record) return null;

  const isBlocked = record.status === 'blocked';


  const handleBlock = async () => {
    if (!blockReason.trim()) {
      notify('Vui lòng nhập lý do khóa tài khoản', { type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/admin/users/${record.user_id}/block`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: blockReason }),
        }
      );
      const result = await response.json();
      if (result.success) {
        notify('Đã khóa tài khoản người dùng', { type: 'success' });
        refresh();
      } else {
        throw new Error(result.error?.message || 'Không thể khóa tài khoản');
      }
    } catch (error: any) {
      notify(error.message || 'Không thể khóa tài khoản', { type: 'error' });
    } finally {
      setLoading(false);
      setBlockDialogOpen(false);
      setBlockReason('');
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/admin/users/${record.user_id}/unblock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        notify('Đã mở khóa tài khoản người dùng', { type: 'success' });
        refresh();
      } else {
        throw new Error(result.error?.message || 'Không thể mở khóa tài khoản');
      }
    } catch (error: any) {
      notify(error.message || 'Không thể mở khóa tài khoản', { type: 'error' });
    } finally {
      setLoading(false);
      setUnblockDialogOpen(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/admin/users/${record.user_id}/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        notify('Đã gửi email đặt lại mật khẩu', { type: 'success' });
      } else {
        throw new Error(result.error?.message || 'Không thể gửi email đặt lại mật khẩu');
      }
    } catch (error: any) {
      notify(error.message || 'Không thể gửi email đặt lại mật khẩu', { type: 'error' });
    } finally {
      setLoading(false);
      setResetDialogOpen(false);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {record.avatar_url ? (
          <Avatar
            src={record.avatar_url}
            alt={record.full_name}
            sx={{ width: 100, height: 100, mr: 3 }}
          />
        ) : (
          <Avatar sx={{ width: 100, height: 100, mr: 3 }}>
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
        )}
        
        <Box>
          <Typography variant="h5" gutterBottom>
            {record.full_name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {record.email}
          </Typography>
          {record.phone && (
            <Typography variant="body2" color="text.secondary">
              {record.phone}
            </Typography>
          )}
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Chip
              label={isBlocked ? 'Đã khóa' : 'Hoạt động'}
              color={isBlocked ? 'error' : 'success'}
              size="small"
              icon={isBlocked ? <BlockIcon /> : <CheckCircleIcon />}
            />
            <Chip
              label={record.auth_provider === 'email' ? 'Email' : record.auth_provider}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Typography variant="body2" color="text.secondary">Số đơn hàng</Typography>
          <Typography variant="h6">{record.orderCount || 0}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="body2" color="text.secondary">Tổng chi tiêu</Typography>
          <Typography variant="h6">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.totalSpent || 0)}
          </Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="body2" color="text.secondary">Ngày đăng ký</Typography>
          <Typography variant="body1">
            {new Date(record.created_at).toLocaleDateString('vi-VN')}
          </Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="body2" color="text.secondary">Đơn hàng gần nhất</Typography>
          <Typography variant="body1">
            {record.lastOrderAt ? new Date(record.lastOrderAt).toLocaleDateString('vi-VN') : '-'}
          </Typography>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        {isBlocked ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => setUnblockDialogOpen(true)}
            disabled={loading}
          >
            Mở khóa tài khoản
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            startIcon={<BlockIcon />}
            onClick={() => setBlockDialogOpen(true)}
            disabled={loading}
          >
            Khóa tài khoản
          </Button>
        )}
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<LockResetIcon />}
          onClick={() => setResetDialogOpen(true)}
          disabled={loading || record.auth_provider !== 'email'}
        >
          Đặt lại mật khẩu
        </Button>
      </Box>

      {/* Block Dialog with Reason */}
      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Khóa tài khoản người dùng</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn khóa tài khoản của <strong>{record.full_name}</strong>?
          </Typography>
          <MuiTextField
            label="Lý do khóa tài khoản"
            fullWidth
            multiline
            rows={3}
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)} disabled={loading}>Hủy</Button>
          <Button onClick={handleBlock} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Khóa tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unblock Confirmation Dialog */}
      <Confirm
        isOpen={unblockDialogOpen}
        title="Xác nhận mở khóa tài khoản"
        content={`Bạn có chắc chắn muốn mở khóa tài khoản của ${record.full_name}?`}
        onConfirm={handleUnblock}
        onClose={() => setUnblockDialogOpen(false)}
        loading={loading}
      />

      {/* Reset Password Confirmation Dialog */}
      <Confirm
        isOpen={resetDialogOpen}
        title="Xác nhận đặt lại mật khẩu"
        content={`Bạn có chắc chắn muốn gửi email đặt lại mật khẩu cho ${record.full_name}?`}
        onConfirm={handleResetPassword}
        onClose={() => setResetDialogOpen(false)}
        loading={loading}
      />
    </Card>
  );
};


/**
 * User Orders Table Component
 * Requirement: 9.3 - Display order history
 */
const UserOrdersTable = () => {
  const record = useRecordContext();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!record?.user_id) return;
      
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/admin/users/${record.user_id}/orders`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        if (result.success) {
          setOrders(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching user orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [record?.user_id]);

  if (!record) return null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Người dùng này chưa có đơn hàng nào.
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Mã đơn hàng</TableCell>
            <TableCell>Ngày đặt</TableCell>
            <TableCell align="right">Tổng tiền</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Thanh toán</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order: any) => (
            <TableRow key={order.order_id} hover>
              <TableCell>{order.order_number || `ORD-${String(order.order_id).padStart(6, '0')}`}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString('vi-VN')}</TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={order.payment_status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  color={order.payment_status === 'completed' ? 'success' : 'warning'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};


/**
 * User Block History Component
 * Requirement: 10.3 - Display block history
 */
const UserBlockHistory = () => {
  const record = useRecordContext();

  if (!record || !record.blockHistory || record.blockHistory.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon /> Lịch sử khóa tài khoản
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ngày khóa</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Ngày mở khóa</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {record.blockHistory.map((block: any) => (
                <TableRow key={block.id}>
                  <TableCell>{new Date(block.blocked_at).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{block.reason}</TableCell>
                  <TableCell>
                    {block.unblocked_at 
                      ? new Date(block.unblocked_at).toLocaleString('vi-VN')
                      : <Chip label="Đang khóa" color="error" size="small" />
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

/**
 * User Show Component
 * Requirements: 9.3, 10.1, 10.2, 11.1
 */
export const UserShow = () => {
  return (
    <Show title="Chi tiết người dùng" actions={<ShowActions />}>
      <SimpleShowLayout>
        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12}>
            <UserProfileCard />
          </Grid>

          {/* Orders List */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingCartIcon /> Lịch sử đơn hàng
                </Typography>
                <UserOrdersTable />
              </CardContent>
            </Card>
          </Grid>

          {/* Block History */}
          <Grid item xs={12}>
            <UserBlockHistory />
          </Grid>
        </Grid>
      </SimpleShowLayout>
    </Show>
  );
};

export default UserShow;
