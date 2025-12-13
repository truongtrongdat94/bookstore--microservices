/**
 * Admin App Bar Component
 * Top navigation bar with user info and actions
 */
import { AppBar, AppBarProps, UserMenu, useLogout } from 'react-admin';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

function CustomUserMenu() {
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleGoToStore = () => {
    navigate('/');
  };

  return (
    <UserMenu>
      <MenuItem onClick={handleGoToStore}>
        <ListItemIcon>
          <HomeIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Về trang chủ</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <ExitToAppIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Đăng xuất</ListItemText>
      </MenuItem>
    </UserMenu>
  );
}

export function AdminAppBar(props: AppBarProps) {
  return (
    <AppBar
      {...props}
      color="primary"
      userMenu={<CustomUserMenu />}
    >
      <Box flex={1} display="flex" alignItems="center">
        <Typography
          variant="h6"
          color="inherit"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Admin Dashboard
        </Typography>
      </Box>
    </AppBar>
  );
}

export default AdminAppBar;
