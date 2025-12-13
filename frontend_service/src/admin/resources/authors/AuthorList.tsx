/**
 * Author List Component for Admin Dashboard
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  ImageField,
  EditButton,
  DeleteButton,
  SearchInput,
  FilterButton,
  TopToolbar,
  CreateButton,
  ShowButton,
  useNotify,
  useRefresh,
} from 'react-admin';
import { Box, Avatar, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

/**
 * Author List Filters
 */
const authorFilters = [
  <SearchInput source="search" alwaysOn placeholder="Tìm kiếm tác giả..." />,
];

/**
 * Custom Actions Toolbar
 */
const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton label="Thêm tác giả" />
  </TopToolbar>
);

/**
 * Author Avatar Component
 */
const AuthorAvatar = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  return (
    <Avatar
      src={record.profileImage}
      alt={record.name}
      sx={{ width: 50, height: 50 }}
    >
      {!record.profileImage && <PersonIcon />}
    </Avatar>
  );
};

/**
 * Author List Component
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export const AuthorList = () => {
  const notify = useNotify();
  const refresh = useRefresh();

  return (
    <List
      filters={authorFilters}
      actions={<ListActions />}
      sort={{ field: 'name', order: 'ASC' }}
      perPage={20}
      title="Quản lý Tác giả"
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ImageField
          source="profileImage"
          label="Ảnh"
          sx={{ '& img': { width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' } }}
          emptyText=""
        />
        <TextField source="name" label="Tên tác giả" />
        <TextField source="nationality" label="Quốc tịch" emptyText="-" />
        <NumberField source="birthYear" label="Năm sinh" emptyText="-" />
        <NumberField source="bookCount" label="Số sách" />
        <DateField source="createdAt" label="Ngày tạo" />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ShowButton label="" />
          <EditButton label="" />
          <DeleteButton 
            label="" 
            mutationMode="pessimistic"
            confirmTitle="Xác nhận xóa tác giả"
            confirmContent="Bạn có chắc chắn muốn xóa tác giả này? Lưu ý: Không thể xóa tác giả có sách liên kết."
          />
        </Box>
      </Datagrid>
    </List>
  );
};

export default AuthorList;
