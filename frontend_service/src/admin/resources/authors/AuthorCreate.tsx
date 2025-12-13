/**
 * Author Create Component for Admin Dashboard
 * Requirements: 4.1
 */
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  required,
  minValue,
  maxValue,
} from 'react-admin';
import { Grid, Typography } from '@mui/material';

/**
 * Author Create Form
 * Requirement: 4.1 - Create author with name, biography, and profile image
 */
export const AuthorCreate = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Create title="Thêm tác giả mới" redirect="list">
      <SimpleForm>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
          </Grid>

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
    </Create>
  );
};

export default AuthorCreate;
