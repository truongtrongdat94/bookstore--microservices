/**
 * Book Create Component for Admin Dashboard
 * Requirements: 2.1, 2.2
 */
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  ImageInput,
  ImageField,
  DateInput,
  required,
  minValue,
  useGetList,
} from 'react-admin';
import { Box, Grid, Typography } from '@mui/material';
import { RichTextInput } from '../../components/RichTextInput';

/**
 * Book Create Form
 * Requirement: 2.1 - Create book with title, author, price, description, cover image
 * Requirement: 2.2 - Rich text editor for description
 */
export const BookCreate = () => {
  // Fetch categories for dropdown
  const { data: categories, isLoading: categoriesLoading } = useGetList(
    'categories',
    { pagination: { page: 1, perPage: 100 } }
  );

  const categoryChoices = categories?.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
  })) || [];

  return (
    <Create title="Thêm sách mới" redirect="list">
      <SimpleForm>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
          </Grid>

          <Grid item xs={12} md={8}>
            <TextInput
              source="title"
              label="Tên sách"
              validate={required('Vui lòng nhập tên sách')}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextInput source="isbn" label="ISBN" fullWidth />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextInput
              source="author"
              label="Tác giả"
              validate={required('Vui lòng nhập tên tác giả')}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SelectInput
              source="categoryId"
              label="Danh mục"
              choices={categoryChoices}
              validate={required('Vui lòng chọn danh mục')}
              fullWidth
              isLoading={categoriesLoading}
            />
          </Grid>

          {/* Pricing */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Giá & Tồn kho
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <NumberInput
              source="price"
              label="Giá bán (VNĐ)"
              validate={[required('Vui lòng nhập giá'), minValue(0, 'Giá phải >= 0')]}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <NumberInput
              source="originalPrice"
              label="Giá gốc (VNĐ)"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <NumberInput
              source="stock"
              label="Số lượng tồn kho"
              defaultValue={0}
              validate={minValue(0, 'Số lượng phải >= 0')}
              fullWidth
            />
          </Grid>

          {/* Additional Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Thông tin chi tiết
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextInput source="publisher" label="Nhà xuất bản" fullWidth />
          </Grid>

          <Grid item xs={12} md={4}>
            <NumberInput source="pages" label="Số trang" fullWidth />
          </Grid>

          <Grid item xs={12} md={4}>
            <SelectInput
              source="language"
              label="Ngôn ngữ"
              choices={[
                { id: 'Tiếng Việt', name: 'Tiếng Việt' },
                { id: 'English', name: 'English' },
                { id: 'Tiếng Nhật', name: 'Tiếng Nhật' },
                { id: 'Tiếng Trung', name: 'Tiếng Trung' },
              ]}
              defaultValue="Tiếng Việt"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextInput source="dimensions" label="Kích thước" fullWidth />
          </Grid>

          <Grid item xs={12} md={6}>
            <DateInput source="publishedDate" label="Ngày xuất bản" fullWidth />
          </Grid>

          {/* Cover Image */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Ảnh bìa
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextInput
              source="coverImage"
              label="URL ảnh bìa"
              fullWidth
              helperText="Nhập URL ảnh bìa sách"
            />
          </Grid>

          {/* Description with Rich Text Editor */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Mô tả sách
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <RichTextInput source="description" label="Mô tả chi tiết" />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
};

export default BookCreate;
