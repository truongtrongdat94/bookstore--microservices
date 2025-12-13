/**
 * Admin Sidebar Menu Component
 * Navigation menu for admin dashboard
 */
import { Menu, MenuItemLink, useSidebarState } from 'react-admin';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/MenuBook';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

export function AdminMenu() {
  const [open] = useSidebarState();

  return (
    <Box
      sx={{
        width: open ? 240 : 55,
        transition: 'width 0.3s',
        overflow: 'hidden',
      }}
    >
      {/* Logo/Brand */}
      {open && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            📚 Bookstore Admin
          </Typography>
        </Box>
      )}
      
      <Divider />

      <Menu>
        {/* Dashboard */}
        <MenuItemLink
          to="/admin"
          primaryText="Dashboard"
          leftIcon={<DashboardIcon />}
        />

        <Divider sx={{ my: 1 }} />

        {/* Product Management Section */}
        {open && (
          <Typography
            variant="caption"
            sx={{ px: 2, py: 1, color: 'text.secondary', display: 'block' }}
          >
            QUẢN LÝ SẢN PHẨM
          </Typography>
        )}

        <MenuItemLink
          to="/admin/books"
          primaryText="Sách"
          leftIcon={<BookIcon />}
        />

        <MenuItemLink
          to="/admin/categories"
          primaryText="Danh mục"
          leftIcon={<CategoryIcon />}
        />

        <MenuItemLink
          to="/admin/authors"
          primaryText="Tác giả"
          leftIcon={<PersonIcon />}
        />

        <Divider sx={{ my: 1 }} />

        {/* Order Management Section */}
        {open && (
          <Typography
            variant="caption"
            sx={{ px: 2, py: 1, color: 'text.secondary', display: 'block' }}
          >
            QUẢN LÝ ĐƠN HÀNG
          </Typography>
        )}

        <MenuItemLink
          to="/admin/orders"
          primaryText="Đơn hàng"
          leftIcon={<ShoppingCartIcon />}
        />

        <Divider sx={{ my: 1 }} />

        {/* User Management Section */}
        {open && (
          <Typography
            variant="caption"
            sx={{ px: 2, py: 1, color: 'text.secondary', display: 'block' }}
          >
            QUẢN LÝ NGƯỜI DÙNG
          </Typography>
        )}

        <MenuItemLink
          to="/admin/users"
          primaryText="Người dùng"
          leftIcon={<PeopleIcon />}
        />
      </Menu>
    </Box>
  );
}

export default AdminMenu;
