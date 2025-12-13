/**
 * Author Edit Component for Admin Dashboard
 * Requirements: 4.2
 */
import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  required,
  minValue,
  maxValue,
  useRecordContext,
} from 'react-admin';
import { Grid, Typography, Card, CardMedia, Avatar, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

/**
 * Author Profile Preview Component
 */
const AuthorProfilePreview = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
      {record.profileImage ? (
        <Card sx={{ maxWidth: 200 }}>
          <CardMedia
            component="img"
            image={record.profileImage}
            alt={record.name}
            sx={{ height: 200, width: 200, objectFit: 'cover' }}
          />
        </Card>
      ) : (
        <Avatar sx={{ width: 150, height: 150 }}>
          <PersonIcon sx={{ fontSize: 80 }} />
        </Avatar>
      )}
      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        {record.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {record.bookCount || 0} sách
      </Typography>
    </Box>
  );
};

/**
 * Author Edit Form
 * Requirement: 4.2 - Edit author information
 */
export const AuthorEdit = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Edit title="Chỉnh sửa tác giả" redirect="list" mutationMode="pessimistic">
      <SimpleForm>
        <Grid container spacing={3}>
          {/* Profile Preview */}
          <Grid item xs={12} md={3}>
            <AuthorProfilePreview />
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextInput
                  source="name"
                  label="Tên tác giả"
                  validate={required('Vui lòng nhập tên tác giả')}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextInput
                  source="nationality"
                  label="Quốc tịch"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <NumberInput
                  source="birthYear"
                  label="Năm sinh"
                  validate={[
                    minValue(1000, 'Năm sinh không hợp lệ'),
                    maxValue(currentYear, 'Năm sinh không thể lớn hơn năm hiện tại')
                  ]}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <NumberInput
                  source="deathYear"
                  label="Năm mất"
                  validate={[
                    minValue(1000, 'Năm mất không hợp lệ'),
                    maxValue(currentYear, 'Năm mất không thể lớn hơn năm hiện tại')
                  ]}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextInput
                  source="website"
                  label="Website"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Profile Image */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Ảnh đại diện
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextInput
              source="profileImage"
              label="URL ảnh đại diện"
              fullWidth
              helperText="Nhập URL ảnh đại diện của tác giả"
            />
          </Grid>

          {/* Biography */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Tiểu sử
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextInput
              source="biography"
              label="Tiểu sử"
              multiline
              rows={6}
              fullWidth
              helperText="Mô tả ngắn về tác giả"
            />
          </Grid>

          {/* Quote */}
          <Grid item xs={12}>
            <TextInput
              source="quote"
              label="Trích dẫn nổi tiếng"
              multiline
              rows={3}
              fullWidth
              helperText="Một câu trích dẫn nổi tiếng của tác giả (nếu có)"
            />
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>
  );
};

export default AuthorEdit;
