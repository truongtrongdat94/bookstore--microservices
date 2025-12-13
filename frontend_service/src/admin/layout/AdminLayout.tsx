/**
 * Admin Dashboard Layout Component
 * Provides the main layout structure with sidebar navigation
 */
import { Layout, LayoutProps } from 'react-admin';
import { AdminMenu } from './AdminMenu';
import { AdminAppBar } from './AdminAppBar';

export function AdminLayout(props: LayoutProps) {
  return (
    <Layout
      {...props}
      menu={AdminMenu}
      appBar={AdminAppBar}
    />
  );
}

export default AdminLayout;
