/**
 * Author Show Component for Admin Dashboard
 * Requirements: 4.3 - Display author with associated books
 */
import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  DateField,
  useRecordContext,
  useGetList,
  EditButton,
  TopToolbar,
  DeleteButton,
  ListButton,
} from 'react-admin';
import {
  Grid,
  Typography,
  Card,
  CardMedia,
  Avatar,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';

/**
 * Custom Actions Toolbar
 */
const ShowActions = () => (
  <TopToolbar>
    <ListButton label="Danh sách" />
    <EditButton label="Chỉnh sửa" />
    <DeleteButton 
      label="Xóa"
      mutationMode="pessimistic"
      confirmTitle="Xác nhận xóa tác giả"
      confirmContent="Bạn có chắc chắn muốn xóa tác giả này? Lưu ý: Không thể xóa tác giả có sách liên kết."
    />
  </TopToolbar>
);

/**
 * Author Profile Card Component
 */
const AuthorProfileCard = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Card sx={{ p: 3, textAlign: 'center' }}>
      {record.profileImage ? (
        <CardMedia
          component="img"
          image={record.profileImage}
          alt={record.name}
          sx={{ 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            objectFit: 'cover',
            margin: '0 auto',
            mb: 2
          }}
        />
      ) : (
        <Avatar sx={{ width: 200, height: 200, margin: '0 auto', mb: 2 }}>
          <PersonIcon sx={{ fontSize: 100 }} />
        </Avatar>
      )}
      
      <Typography variant="h5" gutterBottom>
        {record.name}
      </Typography>
      
      {record.nationality && (
        <Chip label={record.nationality} size="small" sx={{ mb: 1 }} />
      )}
      
      <Box sx={{ mt: 2 }}>
        {record.birthYear && (
          <Typography variant="body2" color="text.secondary">
            Năm sinh: {record.birthYear}
            {record.deathYear && ` - ${record.deathYear}`}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Chip 
          icon={<MenuBookIcon />} 
          label={`${record.bookCount || 0} sách`} 
          color="primary" 
          variant="outlined"
        />
      </Box>
      
      {record.website && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <a href={record.website} target="_blank" rel="noopener noreferrer">
              {record.website}
            </a>
          </Typography>
        </Box>
      )}
    </Card>
  );
};

/**
 * Author Biography Section
 */
const AuthorBiography = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Tiểu sử
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {record.biography || 'Chưa có thông tin tiểu sử.'}
      </Typography>
      
      {record.quote && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, fontStyle: 'italic' }}>
          <Typography variant="body1">
            "{record.quote}"
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/**
 * Author Books List Component
 * Requirement: 4.3 - Display all books written by the author
 */
const AuthorBooksList = () => {
  const record = useRecordContext();
  
  const { data: booksData, isLoading, error } = useGetList(
    'authors',
    {
      pagination: { page: 1, perPage: 100 },
      meta: { authorId: record?.id, endpoint: 'books' }
    },
    { enabled: !!record?.id }
  );

  if (!record) return null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Use custom fetch for author books since React Admin doesn't support nested resources well
  return <AuthorBooksTable authorId={record.id} />;
};

/**
 * Author Books Table with direct API call
 */
const AuthorBooksTable = ({ authorId }: { authorId: number }) => {
  const [books, setBooks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/books/admin/authors/${authorId}/books`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        if (result.success) {
          setBooks(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching author books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [authorId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (books.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Tác giả này chưa có sách nào trong hệ thống.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ảnh bìa</TableCell>
            <TableCell>Tên sách</TableCell>
            <TableCell>Danh mục</TableCell>
            <TableCell align="right">Giá</TableCell>
            <TableCell align="right">Tồn kho</TableCell>
            <TableCell>Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book: any) => (
            <TableRow key={book.id} hover>
              <TableCell>
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={book.title}
                    style={{ width: 40, height: 60, objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ width: 40, height: 60, bgcolor: 'grey.200' }} />
                )}
              </TableCell>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.categoryName || '-'}</TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND' 
                }).format(book.price)}
              </TableCell>
              <TableCell align="right">{book.stock}</TableCell>
              <TableCell>
                <Chip 
                  label={book.status === 'active' ? 'Còn hàng' : 'Hết hàng'}
                  color={book.status === 'active' ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Import React for useState and useEffect
import React from 'react';

/**
 * Author Show Component
 * Requirement: 4.3 - Display author with all associated books
 */
export const AuthorShow = () => {
  return (
    <Show title="Chi tiết tác giả" actions={<ShowActions />}>
      <SimpleShowLayout>
        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <AuthorProfileCard />
          </Grid>

          {/* Biography and Details */}
          <Grid item xs={12} md={8}>
            <AuthorBiography />
          </Grid>

          {/* Books List */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Sách của tác giả
            </Typography>
            <AuthorBooksList />
          </Grid>
        </Grid>
      </SimpleShowLayout>
    </Show>
  );
};

export default AuthorShow;
