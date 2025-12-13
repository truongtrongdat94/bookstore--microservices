/**
 * Admin Dashboard Module Entry Point
 * Uses React Admin for admin interface
 */
import { Admin, Resource } from 'react-admin';
import { adminDataProvider } from './dataProvider';
import { AdminLayout } from './layout/AdminLayout';
import { AdminDashboard } from './pages/Dashboard';
import { adminTheme } from './theme';
import { AdminAuthProvider } from './auth/AdminAuthProvider';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Resource imports
import { BookList, BookCreate, BookEdit } from './resources/books';
import { AuthorList, AuthorCreate, AuthorEdit, AuthorShow } from './resources/authors';
import { OrderList, OrderShow } from './resources/orders';
import { UserList, UserShow } from './resources/users';
// import { CategoryList } from './resources/categories';

export function AdminApp() {
  return (
    <Admin
      basename="/admin"
      dataProvider={adminDataProvider}
      authProvider={AdminAuthProvider}
      dashboard={AdminDashboard}
      layout={AdminLayout}
      theme={adminTheme}
      requireAuth
    >
      {/* Book Management - Requirements: 2.1, 2.2, 2.3, 2.4, 2.5 */}
      <Resource 
        name="books" 
        list={BookList} 
        create={BookCreate} 
        edit={BookEdit}
        icon={MenuBookIcon}
        options={{ label: 'Quản lý Sách' }}
      />
      
      {/* Author Management - Requirements: 4.1, 4.2, 4.3, 4.4 */}
      <Resource 
        name="authors" 
        list={AuthorList} 
        create={AuthorCreate} 
        edit={AuthorEdit} 
        show={AuthorShow}
        icon={PersonIcon}
        options={{ label: 'Quản lý Tác giả' }}
      />
      
      {/* Order Management - Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 8.1, 8.2 */}
      <Resource 
        name="orders" 
        list={OrderList} 
        show={OrderShow}
        icon={ShoppingCartIcon}
        options={{ label: 'Quản lý Đơn hàng' }}
      />
      
      {/* User Management - Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 11.1 */}
      <Resource 
        name="users" 
        list={UserList} 
        show={UserShow}
        icon={PeopleIcon}
        options={{ label: 'Quản lý Người dùng' }}
      />
      
      {/* Resources will be added as modules are implemented */}
      {/* <Resource name="categories" list={CategoryList} /> */}
    </Admin>
  );
}

export default AdminApp;
