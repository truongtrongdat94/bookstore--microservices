/**
 * Order Show Component for Admin Dashboard
 * Requirements: 6.4, 7.1, 8.1, 8.2
 */
import React, { useState } from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  DateField,
  FunctionField,
  useRecordContext,
  useRefresh,
  useNotify,
  TopToolbar,
  ListButton,
} from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Receipt as InvoiceIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { ORDER_STATUS_TRANSITIONS, OrderStatus } from '../../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Order Status Chip
 */
const OrderStatusChip = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; label: string }> = {
    pending: { color: 'warning', label: 'Chờ xử lý' },
    confirmed: { color: 'info', label: 'Đã xác nhận' },
    processing: { color: 'primary', label: 'Đang xử lý' },
    shipped: { color: 'secondary', label: 'Đang giao' },
    delivered: { color: 'success', label: 'Đã giao' },
    cancelled: { color: 'error', label: 'Đã hủy' },
  };

  const config = statusConfig[status] || { color: 'default', label: status };
  return <Chip label={config.label} color={config.color} size="small" />;
};

/**
 * Payment Status Chip
 */
const PaymentStatusChip = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; label: string }> = {
    pending: { color: 'warning', label: 'Chờ thanh toán' },
    awaiting_confirmation: { color: 'info', label: 'Chờ xác nhận' },
    completed: { color: 'success', label: 'Đã thanh toán' },
    failed: { color: 'error', label: 'Thất bại' },
    refunded: { color: 'default', label: 'Đã hoàn tiền' },
  };
  const config = statusConfig[status] || { color: 'default', label: status };
  return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
};

/**
 * Status Update Dialog
 */
const StatusUpdateDialog = ({ 
  open, 
  onClose, 
  currentStatus, 
  orderId, 
  onSuccess 
}: { 
  open: boolean; 
  onClose: () => void; 
  currentStatus: string; 
  orderId: number;
  onSuccess: () => void;
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const notify = useNotify();
  
  const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus as OrderStatus] || [];
  
  const handleSubmit = async () => {
    if (!newStatus) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(API_BASE + '/orders/admin/orders/' + orderId + '/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ status: newStatus, reason }),
      });

      
      const data = await response.json();
      if (data.success) {
        notify('Cập nhật trạng thái thành công', { type: 'success' });
        onSuccess();
        onClose();
      } else {
        notify(data.error?.message || 'Lỗi cập nhật trạng thái', { type: 'error' });
      }
    } catch (error) {
      notify('Lỗi kết nối server', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const statusLabels: Record<string, string> = {
    confirmed: 'Xác nhận đơn',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Hủy đơn',
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Trạng thái mới</InputLabel>
            <Select
              value={newStatus}
              label="Trạng thái mới"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {allowedTransitions.map((status) => (
                <MenuItem key={status} value={status}>
                  {statusLabels[status] || status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <MuiTextField
            fullWidth
            label="Lý do (tùy chọn)"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!newStatus || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


/**
 * Order Detail Content
 */
const OrderDetailContent = () => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const notify = useNotify();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  
  if (!record) return null;
  
  const handleConfirmPayment = async () => {
    setConfirmingPayment(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(API_BASE + '/orders/admin/orders/' + record.order_id + '/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        notify('Xác nhận thanh toán thành công', { type: 'success' });
        refresh();
      } else {
        notify(data.error?.message || 'Lỗi xác nhận thanh toán', { type: 'error' });
      }
    } catch (error) {
      notify('Lỗi kết nối server', { type: 'error' });
    } finally {
      setConfirmingPayment(false);
    }
  };
  
  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(API_BASE + '/orders/admin/orders/' + record.order_id + '/invoice', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      
      const data = await response.json();
      if (data.success) {
        // Open invoice in new window for printing
        const invoiceWindow = window.open('', '_blank');
        if (invoiceWindow) {
          invoiceWindow.document.write(generateInvoiceHTML(data.data));
          invoiceWindow.document.close();
        }
      } else {
        notify(data.error?.message || 'Lỗi tạo hóa đơn', { type: 'error' });
      }
    } catch (error) {
      notify('Lỗi kết nối server', { type: 'error' });
    } finally {
      setDownloadingInvoice(false);
    }
  };

  
  let shippingAddress = record.shipping_address;
  if (typeof shippingAddress === 'string') {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch (e) {
      // If not valid JSON, treat as plain address string
      shippingAddress = { address: shippingAddress };
    }
  }
  
  const canUpdateStatus = ORDER_STATUS_TRANSITIONS[record.status as OrderStatus]?.length > 0;
  const canConfirmPayment = record.payment_status !== 'completed';
  
  return (
    <Box>
      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<ShippingIcon />}
          onClick={() => setStatusDialogOpen(true)}
          disabled={!canUpdateStatus}
        >
          Cập nhật trạng thái
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<PaymentIcon />}
          onClick={handleConfirmPayment}
          disabled={!canConfirmPayment || confirmingPayment}
        >
          {confirmingPayment ? <CircularProgress size={20} /> : 'Xác nhận thanh toán'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<InvoiceIcon />}
          onClick={handleDownloadInvoice}
          disabled={downloadingInvoice}
        >
          {downloadingInvoice ? <CircularProgress size={20} /> : 'In hóa đơn'}
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Order Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Thông tin đơn hàng</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Mã đơn:</Typography>
                  <Typography fontWeight="bold">{record.order_number}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">Trạng thái:</Typography>
                  <OrderStatusChip status={record.status} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">Thanh toán:</Typography>
                  <PaymentStatusChip status={record.payment_status} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">PT thanh toán:</Typography>
                  <Typography>{record.payment_method}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Ngày đặt:</Typography>
                  <Typography>{new Date(record.created_at).toLocaleString('vi-VN')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Tổng tiền:</Typography>
                  <Typography fontWeight="bold" color="primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.total_amount)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Customer Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Thông tin khách hàng</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Tên:</Typography>
                  <Typography>{record.customer?.name || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Email:</Typography>
                  <Typography>{record.customer?.email || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">SĐT:</Typography>
                  <Typography>{record.customer?.phone || shippingAddress?.phone || 'N/A'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Shipping Address */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Địa chỉ giao hàng</Typography>
              <Divider sx={{ mb: 2 }} />
              {shippingAddress ? (
                <Box>
                  <Typography>{shippingAddress.recipientName || shippingAddress.name}</Typography>
                  <Typography color="text.secondary">{shippingAddress.phone}</Typography>
                  <Typography color="text.secondary">
                    {shippingAddress.addressLine || shippingAddress.address}
                    {shippingAddress.ward && ', ' + shippingAddress.ward}
                    {shippingAddress.district && ', ' + shippingAddress.district}
                    {shippingAddress.city && ', ' + shippingAddress.city}
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">Không có thông tin</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        
        {/* Status History */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Lịch sử trạng thái
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {record.statusHistory && record.statusHistory.length > 0 ? (
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {record.statusHistory.map((history: any, index: number) => (
                    <Box key={index} sx={{ mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <OrderStatusChip status={history.from_status || 'new'} />
                        <Typography>→</Typography>
                        <OrderStatusChip status={history.to_status} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(history.created_at).toLocaleString('vi-VN')}
                        {history.reason && ' - ' + history.reason}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">Chưa có lịch sử</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Order Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Sản phẩm trong đơn</Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell align="right">Đơn giá</TableCell>
                      <TableCell align="center">Số lượng</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {record.items?.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {item.cover_image && (
                              <img src={item.cover_image} alt={item.title} style={{ width: 40, height: 50, objectFit: 'cover' }} />
                            )}
                            <Box>
                              <Typography variant="body2">{item.title}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.author}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <StatusUpdateDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        currentStatus={record.status}
        orderId={record.order_id}
        onSuccess={refresh}
      />
    </Box>
  );
};


/**
 * Generate Invoice HTML for printing
 */
const generateInvoiceHTML = (invoice: any) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hóa đơn ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #333; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .info-box { width: 48%; }
        .info-box h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f5f5f5; }
        .text-right { text-align: right; }
        .summary { margin-top: 20px; }
        .summary-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HÓA ĐƠN BÁN HÀNG</h1>
        <p>Số: ${invoice.invoiceNumber}</p>
        <p>Ngày: ${new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</p>
      </div>
      
      <div class="info-section">
        <div class="info-box">
          <h3>THÔNG TIN KHÁCH HÀNG</h3>
          <p><strong>${invoice.customer.name}</strong></p>
          <p>Email: ${invoice.customer.email}</p>
          <p>SĐT: ${invoice.customer.phone}</p>
        </div>
        <div class="info-box">
          <h3>ĐỊA CHỈ GIAO HÀNG</h3>
          <p>${invoice.shippingAddress?.addressLine || invoice.shippingAddress?.address || 'N/A'}</p>
          <p>${invoice.shippingAddress?.district || ''} ${invoice.shippingAddress?.city || ''}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Sản phẩm</th>
            <th class="text-right">Đơn giá</th>
            <th class="text-right">SL</th>
            <th class="text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item: any, i: number) => `
            <tr>
              <td>${i + 1}</td>
              <td>${item.title}<br><small>${item.author}</small></td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-row"><span>Tạm tính:</span><span>${formatCurrency(invoice.summary.subtotal)}</span></div>
        <div class="summary-row"><span>Thuế (${invoice.summary.taxRate}%):</span><span>${formatCurrency(invoice.summary.tax)}</span></div>
        <div class="summary-row"><span>Phí xử lý:</span><span>${formatCurrency(invoice.summary.processingFee)}</span></div>
        <div class="summary-row total-row"><span>TỔNG CỘNG:</span><span>${formatCurrency(invoice.summary.total)}</span></div>
      </div>
      
      <div class="footer">
        <p>Cảm ơn quý khách đã mua hàng!</p>
        <p>Bookstore - Hệ thống bán sách trực tuyến</p>
      </div>
      
      <script>window.print();</script>
    </body>
    </html>
  `;
};

/**
 * Order Show Actions
 */
const OrderShowActions = () => (
  <TopToolbar>
    <ListButton label="Danh sách đơn hàng" />
  </TopToolbar>
);

/**
 * Order Show Component
 * Requirements: 6.4, 7.1, 8.1, 8.2
 */
export const OrderShow = () => {
  return (
    <Show actions={<OrderShowActions />} title="Chi tiết đơn hàng">
      <SimpleShowLayout>
        <OrderDetailContent />
      </SimpleShowLayout>
    </Show>
  );
};

export default OrderShow;
