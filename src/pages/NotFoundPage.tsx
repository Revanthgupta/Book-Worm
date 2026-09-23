import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
    <h1 className="text-6xl font-bold text-bw-muted mb-4">404</h1>
    <p className="text-xl text-white mb-2">Page not found</p>
    <p className="text-bw-muted mb-8">The page you're looking for doesn't exist.</p>
    <Link
      to="/"
      className="bg-bw-primary hover:bg-bw-primary-hover text-white font-medium px-6 py-3 rounded-lg transition-colors"
    >
      Go Home
    </Link>
  </div>
);

export default NotFoundPage;
