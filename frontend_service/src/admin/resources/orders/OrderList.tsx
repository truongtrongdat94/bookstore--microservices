/**
 * Order List Component for Admin Dashboard
 * Requirements: 6.1, 6.2, 6.3
 */
import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  SearchInput,
  SelectInput,
  DateInput,
  FilterButton,
  TopToolbar,
  ShowButton,
  FunctionField,
  useRecordContext,
} from 'react-admin';
import { Chip, Box, Typography } from '@mui/material';

/**
 * Order Status Chip Component
 */
const OrderStatusChip = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const statusConfig: Record<string, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; label: string }> = {
    pending: { color: 'warning', label: 'Chờ xử lý' },
    confirmed: { color: 'info', label: 'Đã xác nhận' },
    processing: { color: 'primary', label: 'Đang xử lý' },
    shipped: { color: 'secondary', label: 'Đang giao' },
    delivered: { color: 'success', label: 'Đã giao' },
    cancelled: { color: 'error', label: 'Đã hủy' },
  };
  
  const config = statusConfig[record.status] || { color: 'default', label: record.status };
  return <Chip label={config.label} color={config.color} size="small" />;
};

/**
 * Payment Status Chip Component
 */
const PaymentStatusChip = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const statusConfig: Record<string, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; label: string }> = {
    pending: { color: 'warning', label: 'Chờ thanh toán' },
    awaiting_confirmation: { color: 'info', label: 'Chờ xác nhận' },
    completed: { color: 'success', label: 'Đã thanh toán' },
    failed: { color: 'error', label: 'Thất bại' },
    refunded: { color: 'default', label: 'Đã hoàn tiền' },
  };

  
  const config = statusConfig[record.payment_status] || { color: 'default', label: record.payment_status };
  return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
};

/**
 * Order List Filters
 * Requirement: 6.2 - filtering options
 */
const orderFilters = [
  <SearchInput source="search" alwaysOn placeholder="Tìm theo mã đơn hoặc tên KH..." key="search" />,
  <SelectInput
    key="status"
    source="status"
    label="Trạng thái đơn"
    choices={[
      { id: 'pending', name: 'Chờ xử lý' },
      { id: 'confirmed', name: 'Đã xác nhận' },
      { id: 'processing', name: 'Đang xử lý' },
      { id: 'shipped', name: 'Đang giao' },
      { id: 'delivered', name: 'Đã giao' },
      { id: 'cancelled', name: 'Đã hủy' },
    ]}
  />,
  <SelectInput
    key="paymentStatus"
    source="paymentStatus"
    label="Thanh toán"
    choices={[
      { id: 'pending', name: 'Chờ thanh toán' },
      { id: 'awaiting_confirmation', name: 'Chờ xác nhận' },
      { id: 'completed', name: 'Đã thanh toán' },
      { id: 'failed', name: 'Thất bại' },
    ]}
  />,
  <SelectInput
    key="paymentMethod"
    source="paymentMethod"
    label="Phương thức"
    choices={[
      { id: 'bank_transfer', name: 'Chuyển khoản' },
      { id: 'credit_card', name: 'Thẻ tín dụng' },
      { id: 'cod', name: 'COD' },
    ]}
  />,
  <DateInput source="dateFrom" label="Từ ngày" key="dateFrom" />,
  <DateInput source="dateTo" label="Đến ngày" key="dateTo" />,
];

/**
 * Custom Actions Toolbar
 */
const ListActions = () => (
  <TopToolbar>
    <FilterButton />
  </TopToolbar>
);


/**
 * Order List Component
 * Requirements: 6.1, 6.2, 6.3
 */
export const OrderList = () => {
  return (
    <List
      filters={orderFilters}
      actions={<ListActions />}
      sort={{ field: 'created_at', order: 'DESC' }}
      perPage={20}
      title="Quản lý Đơn hàng"
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="order_number" label="Mã đơn" />
        <TextField source="customer_name" label="Khách hàng" />
        <TextField source="customer_email" label="Email" />
        <NumberField
          source="total_amount"
          label="Tổng tiền"
          options={{ style: 'currency', currency: 'VND' }}
        />
        <FunctionField
          label="Trạng thái"
          render={() => <OrderStatusChip />}
        />
        <FunctionField
          label="Thanh toán"
          render={() => <PaymentStatusChip />}
        />
        <TextField source="payment_method" label="PT thanh toán" />
        <FunctionField
          source="item_count"
          label="Số SP"
          render={(record: any) => (
            <Typography variant="body2">{record?.item_count || 0} sản phẩm</Typography>
          )}
        />
        <DateField source="created_at" label="Ngày đặt" showTime />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ShowButton label="" />
        </Box>
      </Datagrid>
    </List>
  );
};

export default OrderList;
