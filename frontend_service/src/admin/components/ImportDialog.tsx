/**
 * Import Dialog Component for Bulk Book Import
 * Requirements: 5.1, 5.2, 5.3
 */
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import { useNotify, useRefresh } from 'react-admin';
import { bulkOperationsApi } from '../dataProvider/customMethods';
import { BulkImportResult, ImportError } from '../types';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(extension || '')) {
        setError('Định dạng file không hợp lệ. Vui lòng chọn file CSV hoặc Excel (.csv, .xlsx, .xls)');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  }, []);


  const handleImport = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const importResult = await bulkOperationsApi.importBooks(file);
      setResult(importResult);

      if (importResult.success && importResult.successCount > 0) {
        notify(`Đã nhập thành công ${importResult.successCount} sách`, { type: 'success' });
        refresh();
      } else if (importResult.errorCount > 0) {
        notify(`Có ${importResult.errorCount} lỗi khi nhập dữ liệu`, { type: 'warning' });
      }
    } catch (err: any) {
      const errorMessage = err.body?.error?.message || err.message || 'Lỗi khi nhập dữ liệu';
      setError(errorMessage);
      
      // Check if there's validation result in the error response
      if (err.body?.data) {
        setResult(err.body.data);
      }
    } finally {
      setLoading(false);
    }
  }, [file, notify, refresh]);

  const handleClose = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  }, [onClose]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const extension = droppedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(extension || '')) {
        setError('Định dạng file không hợp lệ. Vui lòng chọn file CSV hoặc Excel (.csv, .xlsx, .xls)');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setResult(null);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Nhập sách từ file</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* File Upload Area */}
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            border: '2px dashed',
            borderColor: file ? 'primary.main' : 'grey.400',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: file ? 'primary.50' : 'grey.50',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
          }}
          onClick={() => document.getElementById('import-file-input')?.click()}
        >
          <input
            id="import-file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          {file ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <FileIcon color="primary" />
              <Typography variant="body1" color="primary">
                {file.name}
              </Typography>
              <Chip label={`${(file.size / 1024).toFixed(1)} KB`} size="small" />
            </Box>
          ) : (
            <>
              <UploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
              <Typography variant="body1" color="textSecondary">
                Kéo thả file vào đây hoặc click để chọn file
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Hỗ trợ: CSV, Excel (.xlsx, .xls)
              </Typography>
            </>
          )}
        </Box>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
              Đang xử lý file...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <AlertTitle>Lỗi</AlertTitle>
            {error}
          </Alert>
        )}


        {/* Import Result */}
        {result && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={result.success ? 'success' : 'warning'} sx={{ mb: 2 }}>
              <AlertTitle>Kết quả nhập dữ liệu</AlertTitle>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`Tổng: ${result.totalRows} dòng`} variant="outlined" />
                <Chip label={`Thành công: ${result.successCount}`} color="success" variant="outlined" />
                <Chip label={`Lỗi: ${result.errorCount}`} color="error" variant="outlined" />
              </Box>
            </Alert>

            {/* Error Details - Requirement 5.3 */}
            {result.errors && result.errors.length > 0 && (
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Chi tiết lỗi:
                </Typography>
                <List dense>
                  {result.errors.slice(0, 50).map((err: ImportError, index: number) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ErrorIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Dòng ${err.row}: ${err.message}`}
                        secondary={`Trường: ${err.field}, Giá trị: ${err.value || '(trống)'}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                  {result.errors.length > 50 && (
                    <ListItem>
                      <ListItemText
                        primary={`... và ${result.errors.length - 50} lỗi khác`}
                        primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Box>
        )}

        {/* Template Download Info */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Hướng dẫn:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            File cần có các cột: title (Tên sách), author (Tác giả), price (Giá), categoryId (ID danh mục).
            <br />
            Các cột tùy chọn: isbn, originalPrice, stock, description, coverImage, publisher, pages, language, publishedDate.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Đóng
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!file || loading}
          startIcon={<UploadIcon />}
        >
          Nhập dữ liệu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
