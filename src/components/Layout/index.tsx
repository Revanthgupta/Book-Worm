import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

/**
 * Standard layout: Header + main content area + Footer.
 * Payment and Confirmation pages use their own full-screen layout and do NOT use this.
 */
const Layout = () => (
  <div className="flex flex-col min-h-screen bg-page">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
