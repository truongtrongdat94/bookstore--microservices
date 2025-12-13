/**
 * User List Component for Admin Dashboard
 * Requirements: 9.1, 9.2
 */
import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  FunctionField,
  SearchInput,
  FilterButton,
  TopToolbar,
  ShowButton,
  SelectInput,
  useNotify,
  useRefresh,
  useDataProvider,
  Confirm,
} from 'react-admin';
import {
  Box,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockResetIcon from '@mui/icons-material/LockReset';

/**
 * User List Filters
 */
const userFilters = [
  <SearchInput source="search" alwaysOn placeholder="Tìm kiếm theo tên, email, SĐT..." />,
  <SelectInput
    source="status"
    label="Trạng thái"
    choices={[
      { id: 'active', name: 'Hoạt động' },
      { id: 'blocked', name: 'Đã khóa' },
    ]}
    alwaysOn
  />,
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
 * User Avatar Component
 */
const UserAvatar = ({ record }: { record?: any }) => {
  if (!record) return null;

  return (
    <Avatar
      src={record.avatar_url}
      alt={record.full_name}
      sx={{ width: 40, height: 40 }}
    >
      {!record.avatar_url && <PersonIcon />}
    </Avatar>
  );
};

/**
 * Status Chip Component
 */
const StatusChip = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const isBlocked = record.status === 'blocked';
  
  return (
    <Chip
      label={isBlocked ? 'Đã khóa' : 'Hoạt động'}
      color={isBlocked ? 'error' : 'success'}
      size="small"
      icon={isBlocked ? <BlockIcon /> : <CheckCircleIcon />}
    />
  );
};

/**
 * User Actions Component with Block/Unblock and Password Reset
 */
const UserActions = ({ record }: { record?: any }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const [blockDialogOpen, setBlockDialogOpen] = React.useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = React.useState(false);
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  if (!record) return null;

  const isBlocked = record.status === 'blocked';

  const handleBlock = async () => {
    setLoading(true);
    try {
      await dataProvider.create('users/block', {
        data: { id: record.user_id, reason: 'Vi phạm chính sách' }
      });
      notify('Đã khóa tài khoản người dùng', { type: 'success' });
      refresh();
    } catch (error: any) {
      notify(error.message || 'Không thể khóa tài khoản', { type: 'error' });
    } finally {
      setLoading(false);
      setBlockDialogOpen(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      await dataProvider.create('users/unblock', {
        data: { id: record.user_id }
      });
      notify('Đã mở khóa tài khoản người dùng', { type: 'success' });
      refresh();
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
      await dataProvider.create('users/reset-password', {
        data: { id: record.user_id }
      });
      notify('Đã gửi email đặt lại mật khẩu', { type: 'success' });
    } catch (error: any) {
      notify(error.message || 'Không thể gửi email đặt lại mật khẩu', { type: 'error' });
    } finally {
      setLoading(false);
      setResetDialogOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <ShowButton label="" />
      
      {isBlocked ? (
        <Tooltip title="Mở khóa tài khoản">
          <IconButton
            size="small"
            color="success"
            onClick={() => setUnblockDialogOpen(true)}
            disabled={loading}
          >
            <CheckCircleIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Khóa tài khoản">
          <IconButton
            size="small"
            color="error"
            onClick={() => setBlockDialogOpen(true)}
            disabled={loading}
          >
            <BlockIcon />
          </IconButton>
        </Tooltip>
      )}
      
      <Tooltip title="Đặt lại mật khẩu">
        <IconButton
          size="small"
          color="primary"
          onClick={() => setResetDialogOpen(true)}
          disabled={loading || record.auth_provider !== 'email'}
        >
          <LockResetIcon />
        </IconButton>
      </Tooltip>

      {/* Block Confirmation Dialog */}
      <Confirm
        isOpen={blockDialogOpen}
        title="Xác nhận khóa tài khoản"
        content={`Bạn có chắc chắn muốn khóa tài khoản của ${record.full_name}?`}
        onConfirm={handleBlock}
        onClose={() => setBlockDialogOpen(false)}
        loading={loading}
      />

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
    </Box>
  );
};


/**
 * User List Component
 * Requirements: 9.1, 9.2
 */
export const UserList = () => {
  return (
    <List
      filters={userFilters}
      actions={<ListActions />}
      sort={{ field: 'created_at', order: 'DESC' }}
      perPage={20}
      title="Quản lý Người dùng"
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <FunctionField
          label="Ảnh"
          render={(record: any) => <UserAvatar record={record} />}
        />
        <TextField source="full_name" label="Họ tên" />
        <EmailField source="email" label="Email" />
        <TextField source="phone" label="Số điện thoại" emptyText="-" />
        <FunctionField
          label="Xác thực"
          render={(record: any) => (
            <Chip
              label={record.auth_provider === 'email' ? 'Email' : record.auth_provider}
              size="small"
              variant="outlined"
            />
          )}
        />
        <FunctionField
          label="Đơn hàng"
          render={(record: any) => record.orderCount || 0}
        />
        <FunctionField
          label="Tổng chi tiêu"
          render={(record: any) => 
            new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND' 
            }).format(record.totalSpent || 0)
          }
        />
        <FunctionField
          label="Trạng thái"
          render={(record: any) => <StatusChip record={record} />}
        />
        <DateField source="created_at" label="Ngày đăng ký" />
        <FunctionField
          label="Thao tác"
          render={(record: any) => <UserActions record={record} />}
        />
      </Datagrid>
    </List>
  );
};

export default UserList;
