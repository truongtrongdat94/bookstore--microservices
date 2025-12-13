/**
 * Export Button Component for Bulk Book Export
 * Requirement: 5.4
 */
import React, { useState, useCallback } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  TableChart as CsvIcon,
  GridOn as ExcelIcon,
} from '@mui/icons-material';
import { useNotify, useListContext } from 'react-admin';
import { bulkOperationsApi } from '../dataProvider/customMethods';

interface ExportButtonProps {
  label?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ label = 'Xuất file' }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();
  const { selectedIds } = useListContext();

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'xlsx') => {
    handleClose();
    setLoading(true);

    try {
      const ids = selectedIds && selectedIds.length > 0 ? selectedIds.map(Number) : undefined;
      const blob = await bulkOperationsApi.exportBooks(format, ids);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `books_export_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      const message = ids 
        ? `Đã xuất ${ids.length} sách sang file ${format.toUpperCase()}`
        : `Đã xuất tất cả sách sang file ${format.toUpperCase()}`;
      notify(message, { type: 'success' });
    } catch (error: any) {
      notify(error.message || 'Lỗi khi xuất file', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedIds, notify, handleClose]);

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={loading ? <CircularProgress size={18} /> : <DownloadIcon />}
        disabled={loading}
        size="small"
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Xuất CSV" secondary="Định dạng văn bản" />
        </MenuItem>
        <MenuItem onClick={() => handleExport('xlsx')}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Xuất Excel" secondary="Định dạng .xlsx" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportButton;
