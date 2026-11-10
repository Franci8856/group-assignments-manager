import { Outlet } from 'react-router';
import AppNavbar from '../components/NavHeader';

function DefaultLayout({ user, handleLogout }) {
  return (
    <>
      <AppNavbar user={user} handleLogout={handleLogout} />
      <Outlet />
    </>
  );
}

export default DefaultLayout;