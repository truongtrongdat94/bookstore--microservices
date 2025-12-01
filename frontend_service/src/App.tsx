import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { BookListingPage } from './components/BookListingPage';
import { BookDetailPage } from './components/BookDetailPage';
import { AuthPage } from './components/AuthPage';
import { CartPage } from './components/CartPage';
import { AuthorsPage } from './components/AuthorsPage';
import { AuthorDetailPage } from './components/AuthorDetailPage';
import { OAuthCallback } from './components/OAuthCallback';
import { ProfilePage } from './components/ProfilePage';
import { BlogListPage } from './components/BlogListPage';
import { BlogDetailPage } from './components/BlogDetailPage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { ScrollToTop } from './components/ScrollToTop';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BookListingPage />} />
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
          <Route path="/profile" element={<ProfilePage onNavigate={(page) => {}} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
