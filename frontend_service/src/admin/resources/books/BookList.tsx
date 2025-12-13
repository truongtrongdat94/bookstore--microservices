/**
 * Book List Component for Admin Dashboard
 * Requirements: 2.4, 2.5, 5.1, 5.2, 5.3, 5.4
 */
import React, { useState } from 'react';
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
  SelectInput,
  NumberInput,
  FilterButton,
  TopToolbar,
  CreateButton,
  useListContext,
  FunctionField,
} from 'react-admin';
import { Chip, Box, Button } from '@mui/material';
import { CloudUpload as ImportIcon } from '@mui/icons-material';
import { ImportDialog, ExportButton } from '../../components';

/**
 * Book List Filters
 * Requirement: 2.4 - filtering options
 */
const bookFilters = [
  <SearchInput source="search" alwaysOn placeholder="Tìm kiếm sách..." key="search" />,
  <SelectInput
    key="status"
    source="status"
    label="Trạng thái"
    choices={[
      { id: 'active', name: 'Còn hàng' },
      { id: 'out_of_stock', name: 'Hết hàng' },
    ]}
  />,
  <NumberInput source="minPrice" label="Giá từ" key="minPrice" />,
  <NumberInput source="maxPrice" label="Giá đến" key="maxPrice" />,
];

/**
 * Custom Actions Toolbar with Import/Export
 * Requirements: 5.1, 5.4
 */
const ListActions = () => {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <TopToolbar>
        <FilterButton />
        <CreateButton label="Thêm sách" />
        <Button
          size="small"
          startIcon={<ImportIcon />}
          onClick={() => setImportOpen(true)}
        >
          Nhập file
        </Button>
        <ExportButton label="Xuất file" />
      </TopToolbar>
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
};

/**
 * Status Chip Component
 */
const StatusField = ({ record }: { record?: any }) => {
  if (!record) return null;
  const status = record.status;
  const color = status === 'active' ? 'success' : 'error';
  const label = status === 'active' ? 'Còn hàng' : 'Hết hàng';
  return <Chip label={label} color={color} size="small" />;
};

/**
 * Book List Component
 * Requirements: 2.4, 2.5
 */
export const BookList = () => {
  return (
    <List
      filters={bookFilters}
      actions={<ListActions />}
      sort={{ field: 'createdAt', order: 'DESC' }}
      perPage={20}
      title="Quản lý Sách"
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <ImageField
          source="coverImage"
          label="Ảnh bìa"
          sx={{ '& img': { maxWidth: 50, maxHeight: 70, objectFit: 'cover' } }}
        />
        <TextField source="title" label="Tên sách" />
        <TextField source="authorName" label="Tác giả" />
        <TextField source="categoryName" label="Danh mục" />
        <NumberField
          source="price"
          label="Giá"
          options={{ style: 'currency', currency: 'VND' }}
        />
        <NumberField source="stock" label="Tồn kho" />
        <FunctionField
          label="Trạng thái"
          render={(record: any) => <StatusField record={record} />}
        />
        <DateField source="createdAt" label="Ngày tạo" />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <EditButton label="" />
          <DeleteButton label="" mutationMode="pessimistic" />
        </Box>
      </Datagrid>
    </List>
  );
};

export default BookList;
