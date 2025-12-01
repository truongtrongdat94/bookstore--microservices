import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';

// Performance: Lazy load pages for code splitting
// HomePage is NOT lazy loaded - it's the landing page and needs fast FCP
import { HomePage } from './components/HomePage';

// Lazy load other pages - they load on demand
const BookListingPage = lazy(() => import('./components/BookListingPage').then(m => ({ default: m.BookListingPage })));
const BookDetailPage = lazy(() => import('./components/BookDetailPage').then(m => ({ default: m.BookDetailPage })));
const AuthPage = lazy(() => import('./components/AuthPage').then(m => ({ default: m.AuthPage })));
const CartPage = lazy(() => import('./components/CartPage').then(m => ({ default: m.CartPage })));
const AuthorsPage = lazy(() => import('./components/AuthorsPage').then(m => ({ default: m.AuthorsPage })));
const AuthorDetailPage = lazy(() => import('./components/AuthorDetailPage').then(m => ({ default: m.AuthorDetailPage })));
const OAuthCallback = lazy(() => import('./components/OAuthCallback').then(m => ({ default: m.OAuthCallback })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const BlogListPage = lazy(() => import('./components/BlogListPage').then(m => ({ default: m.BlogListPage })));
const BlogDetailPage = lazy(() => import('./components/BlogDetailPage').then(m => ({ default: m.BlogDetailPage })));
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B5E20]"></div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1 w-full">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BookListingPage onNavigate={() => {}} />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/authors" element={<AuthorsPage />} />
            <Route path="/authors/:id" element={<AuthorDetailPage />} />
            <Route path="/profile" element={<ProfilePage onNavigate={() => {}} />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
