import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, ChevronDown, BookOpen, UserCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useAuth, useCart, useCategories, useSearch } from '../hooks';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showNewsMenu, setShowNewsMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: categories } = useCategories();
  
  // Search state
  const { query, setQuery, suggestions, isSuggestionsLoading, search, clearSuggestions } = useSearch({ debounceMs: 300 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length >= 2) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(text)}`);
  };

  // Handle input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(e.target.value.length >= 2);
  };

  // Handle key down
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Check if current page is blog
  const isBlogPage = location.pathname.startsWith('/blog');

  // Group categories by parent for mega menu (keep same 4-column layout)
  const megaMenuCategories = useMemo(() => {
    if (!categories) return [];

    // Find parent categories
    const huCau = categories.find(c => c.name === 'Hư cấu');
    const phiHuCau = categories.find(c => c.name === 'Phi hư cấu');
    const thieuNhi = categories.find(c => c.name === 'Thiếu nhi');

    // Get ALL children for each parent
    const huCauChildren = categories
      .filter(c => c.parent_id === huCau?.category_id);
    
    const phiHuCauChildren = categories
      .filter(c => c.parent_id === phiHuCau?.category_id);
    
    const thieuNhiChildren = categories
      .filter(c => c.parent_id === thieuNhi?.category_id);

    return [
      {
        title: 'Hư cấu',
        items: huCauChildren
      },
      {
        title: 'Phi hư cấu',
        items: phiHuCauChildren
      },
      {
        title: 'Thiếu nhi',
        items: thieuNhiChildren
      },
      {
        title: 'Phân loại khác',
        items: [
          { category_id: -1, name: 'Sách mới phát hành' },
          { category_id: -2, name: 'Sách bán chạy' }
        ]
      }
    ];
  }, [categories]);

  const handleCategoryClick = (categoryId: number) => {
    setShowMegaMenu(false);
    if (categoryId > 0) {
      // Normal category
      navigate(`/books?category=${categoryId}`);
    } else if (categoryId === -1) {
      // Sách mới phát hành
      navigate('/books?sort=newest');
    } else if (categoryId === -2) {
      // Sách bán chạy
      navigate('/books?sort=bestseller');
    } else {
      // All books
      navigate('/books');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
      {/* Desktop Header */}
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <h3 className="text-[#1B5E20] mb-1">UIT</h3>
            <p className="text-xs text-gray-600">Bởi vì sách là thế giới</p>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => navigate('/')} className="hover:text-[#1B5E20] transition-colors">
              Trang chủ
            </button>

            {/* Tin sách Menu */}
            <div
              className="relative"
              onMouseEnter={() => setShowNewsMenu(true)}
              onMouseLeave={() => setShowNewsMenu(false)}
            >
              <button className={`hover:text-[#1B5E20] transition-colors flex items-center gap-1 whitespace-nowrap ${isBlogPage ? 'text-[#1B5E20]' : ''}`}>
                Tin sách
                <ChevronDown size={16} />
              </button>
              
              {/* News Dropdown Menu */}
              {showNewsMenu && (
                <div className="absolute left-0 top-full pt-2">
                  <div className="bg-white border border-gray-200 shadow-lg rounded-lg w-[240px] py-2">
                    <button 
                      onClick={() => { navigate('/blog?category=tin-nha-nam'); setShowNewsMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#1B5E20] transition-colors whitespace-nowrap"
                    >
                      Tin Nhã Nam
                    </button>
                    <button 
                      onClick={() => { navigate('/blog?category=review'); setShowNewsMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#1B5E20] transition-colors whitespace-nowrap"
                    >
                      Review sách của độc giả
                    </button>
                    <button 
                      onClick={() => { navigate('/blog?category=bao-chi'); setShowNewsMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#1B5E20] transition-colors whitespace-nowrap"
                    >
                      Tin sách trên báo chí
                    </button>
                    <button 
                      onClick={() => { navigate('/blog?category=bien-tap-vien'); setShowNewsMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#1B5E20] transition-colors whitespace-nowrap"
                    >
                      Biên tập viên giới thiệu
                    </button>
                    <button 
                      onClick={() => { navigate('/blog?category=doc-gia'); setShowNewsMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#1B5E20] transition-colors whitespace-nowrap"
                    >
                      Đọc giả
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div
              className="relative"
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
            >
              <button className="hover:text-[#1B5E20] transition-colors flex items-center gap-1">
                Sách UIT
                <ChevronDown size={16} />
              </button>
              
              {/* Mega Menu */}
              {showMegaMenu && (
                <div 
                  className="absolute left-0 top-full pt-2"
                  onMouseEnter={() => setShowMegaMenu(true)}
                  onMouseLeave={() => setShowMegaMenu(false)}
                >
                  <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-6 w-[600px]">
                    <div className="grid grid-cols-4 gap-6">
                      {megaMenuCategories.map((category) => (
                        <div key={category.title}>
                          <h5 className="text-[#1B5E20] mb-3">{category.title}</h5>
                          <ul className="space-y-2">
                            {category.items.map((item: any) => (
                              <li key={item.category_id}>
                                <button 
                                  onClick={() => handleCategoryClick(item.category_id)}
                                  className="text-sm hover:text-[#1B5E20] transition-colors text-left w-full"
                                >
                                  {item.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => navigate('/authors')} className="hover:text-[#1B5E20] transition-colors">
              Tác giả
            </button>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search - Desktop */}
            <div className="hidden md:flex relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 w-64">
                <Search size={20} className="text-gray-400" />
                <Input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  value={query}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                  className="border-0 p-0 focus-visible:ring-0"
                />
              </form>
              
              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && (suggestions.length > 0 || isSuggestionsLoading) && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                >
                  {isSuggestionsLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Đang tìm kiếm...</div>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${suggestion.text}-${index}`}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                      >
                        {suggestion.type === 'title' ? (
                          <BookOpen size={16} className="text-gray-400 flex-shrink-0" />
                        ) : (
                          <UserCircle size={16} className="text-gray-400 flex-shrink-0" />
                        )}
                        <span className="truncate">{suggestion.text}</span>
                        <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                          {suggestion.type === 'title' ? 'Sách' : 'Tác giả'}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden md:inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                <User size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem disabled className="font-medium">
                      {user?.email || 'Tài khoản'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>Tài khoản của tôi</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>Đơn hàng</DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>Đăng xuất</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/login')}>Đăng nhập</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/register')}>Đăng ký</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hidden md:flex"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#1B5E20]">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="lg:hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                <Menu size={24} />
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 mt-8">
                  <form onSubmit={(e) => { handleSearchSubmit(e); setMobileOpen(false); }} className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                    <Search size={20} className="text-gray-400" />
                    <Input 
                      type="text" 
                      placeholder="Tìm kiếm..." 
                      value={query}
                      onChange={handleSearchInputChange}
                      className="border-0 p-0 focus-visible:ring-0"
                    />
                  </form>
                  
                  <nav className="flex flex-col gap-4">
                    <button onClick={() => { navigate('/'); setMobileOpen(false); }} className="text-left hover:text-[#1B5E20]">
                      Trang chủ
                    </button>
                    <button onClick={() => { navigate('/books'); setMobileOpen(false); }} className="text-left hover:text-[#1B5E20]">
                      Sách UIT
                    </button>
                    <button onClick={() => { navigate('/authors'); setMobileOpen(false); }} className="text-left hover:text-[#1B5E20]">
                      Tác giả
                    </button>
                    {isAuthenticated ? (
                      <>
                        <button onClick={() => { navigate('/profile'); setMobileOpen(false); }} className="text-left hover:text-[#1B5E20]">
                          Tài khoản của tôi
                        </button>
                        <button onClick={() => { navigate('/orders'); setMobileOpen(false); }} className="text-left hover:text-[#1B5E20]">
                          Đơn hàng
                        </button>
                        <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left hover:text-[#1B5E20]">
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { navigate('/login'); setMobileOpen(false); }} className="text-left hover:text-[#1B5E20]">
                        Đăng nhập
                      </button>
                    )}
                    <button onClick={() => { navigate('/cart'); setMobileOpen(false); }} className="text-left hover:text-[#1B5E20] flex items-center gap-2">
                      Giỏ hàng
                      {totalItems > 0 && (
                        <Badge className="bg-[#1B5E20]">{totalItems}</Badge>
                      )}
                    </button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Icons */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#1B5E20]">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
