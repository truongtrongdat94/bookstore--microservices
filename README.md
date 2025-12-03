# Bookstore Microservices

An e-commerce bookstore system built with microservices architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (React)                                │
│                              Port: 5173                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API Gateway (Express)                              │
│                              Port: 3000                                      │
│  Routes: /api/auth, /api/users, /api/books, /api/categories, /api/authors   │
│          /api/cart, /api/orders, /api/notifications, /api/blogs             │
└─────────────────────────────────────────────────────────────────────────────┘
          │              │              │              │              │
          ▼              ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ User Service │ │ Book Service │ │Order Service │ │ Notification │ │ Blog Service │
│  Port: 3001  │ │  Port: 3002  │ │  Port: 3003  │ │   Service    │ │  Port: 3004  │
│              │ │              │ │              │ │  Port: 3005  │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
       │               │               │               │               │
       ▼               ▼               ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   user-db    │ │   book-db    │ │   order-db   │ │notification- │ │   blog-db    │
│ PostgreSQL   │ │ PostgreSQL   │ │ PostgreSQL   │ │     db       │ │ PostgreSQL   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

                    ┌──────────────┐     ┌──────────────┐
                    │    Redis     │     │  RabbitMQ    │
                    │   Caching    │     │   Messaging  │
                    └──────────────┘     └──────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Zustand, React Query |
| API Gateway | Express.js, http-proxy-middleware, JWT |
| Backend Services | Node.js, Express.js, TypeScript |
| Database | PostgreSQL 15 |
| Caching | Redis 7 |
| Message Queue | RabbitMQ 3 |
| Containerization | Docker, Docker Compose |

## Services

### 1. API Gateway (Port 3000)
Entry point for all API requests:
- Routes requests to downstream services
- Rate limiting (1000 requests/minute)
- JWT authentication with user header propagation
- CORS handling
- Swagger UI (development mode only)

### 2. User Service (Port 3001)
User management and authentication:
- Registration with OTP email verification
- Email/password login
- OAuth (Google, Facebook)
- Profile and address management
- Avatar upload

**API Endpoints:**
```
POST /auth/register          - Register new account
POST /auth/verify-email      - Verify OTP code
POST /auth/resend-otp        - Resend OTP code
POST /auth/login             - Login
POST /auth/logout            - Logout
GET  /auth/verify            - Verify JWT token
GET  /auth/google            - Google OAuth
GET  /auth/facebook          - Facebook OAuth
GET  /users/profile          - Get user profile
PUT  /users/profile          - Update profile
GET  /users/addresses        - List addresses
POST /users/addresses        - Add address
POST /upload/image           - Upload image
```

### 3. Book Service (Port 3002)
Book catalog management:
- CRUD operations for books
- Categories (supports nested tree structure)
- Authors
- Full-text search
- Reviews and ratings

**API Endpoints:**
```
GET  /books                  - List books (pagination, filtering)
GET  /books/search           - Full-text search
GET  /books/search/suggestions - Search suggestions
GET  /books/bestsellers      - Bestselling books
GET  /books/:id              - Book details
GET  /books/:id/reviews      - Book reviews
POST /books/:id/reviews      - Add review
GET  /categories             - List categories
GET  /categories/tree        - Category tree
GET  /authors                - List authors
GET  /authors/:id            - Author details
GET  /authors/:id/books      - Books by author
```

### 4. Order Service (Port 3003)
Shopping cart and order management:
- Shopping cart (stored per user)
- Checkout with VietQR payment
- Order management
- Admin: payment confirmation

**API Endpoints:**
```
GET    /cart                 - Get cart
POST   /cart/items           - Add to cart
PUT    /cart/items/:bookId   - Update quantity
DELETE /cart/items/:bookId   - Remove from cart
DELETE /cart                 - Clear cart
POST   /orders/checkout      - Place order
GET    /orders/my-orders     - My orders
GET    /orders/:id           - Order details
GET    /orders/:id/qr        - Get payment QR code
DELETE /orders/:id/cancel    - Cancel order
GET    /orders/statistics    - Statistics
```

### 5. Notification Service (Port 3005)
Notification management:
- In-app notifications
- Email notifications (SMTP)
- Event-driven via RabbitMQ

**API Endpoints:**
```
GET  /notifications              - List notifications
POST /notifications/mark-read    - Mark as read
POST /notifications/mark-all-read - Mark all as read
GET  /notifications/statistics   - Statistics
```

### 6. Blog Service (Port 3004)
Blog/news management:
- Article listing
- Categories
- Featured posts
- Related posts

**API Endpoints:**
```
GET /blogs                   - List articles
GET /blogs/categories        - Blog categories
GET /blogs/featured          - Featured articles
GET /blogs/:id               - Article details
GET /blogs/slug/:slug        - Article by slug
GET /blogs/related/:id       - Related articles
```

### 7. Frontend (Port 5173)
Single Page Application with React:
- Home page, book listing, book details
- Book search
- Shopping cart and checkout
- Authors page
- Blog
- User profile
- OAuth callback

## Installation & Running

### Prerequisites
- Docker & Docker Compose
- Node.js >= 18 (for development)

### 1. Clone and Configure

```bash
cd bookstore-microservices

# Copy configuration file
cp .env.example .env

# Edit .env with your values
```

### 2. Run Development Mode

```bash
# Run all services with hot-reload
npm run dev

# Or
docker-compose -f docker-compose.dev.yml up --build
```

### 3. Run Production Mode

```bash
# Run production mode
npm start

# Or
docker-compose up --build
```

### 4. Run Frontend Separately

```bash
cd frontend_service
npm install
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | - |
| `JWT_SECRET` | JWT signing secret key | - |
| `REDIS_PASSWORD` | Redis password | - |
| `RABBITMQ_PASSWORD` | RabbitMQ password | - |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | - |
| `FACEBOOK_APP_ID` | Facebook App ID | - |
| `FACEBOOK_APP_SECRET` | Facebook App Secret | - |
| `SMTP_HOST` | SMTP server host | - |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `VIETQR_CLIENT_ID` | VietQR Client ID | - |
| `VIETQR_API_KEY` | VietQR API Key | - |
| `VIETQR_ACCOUNT_NO` | Bank account number | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost |
| `FRONTEND_URL` | Frontend URL | http://localhost:5173 |

## Database Schema

### users_db
- `users` - User information
- `otp_codes` - OTP verification codes
- `user_auth_providers` - OAuth providers (Google, Facebook)
- `user_addresses` - Shipping addresses

### books_db
- `categories` - Book categories (supports nested)
- `books` - Book information
- `authors` - Authors
- `reviews` - Book reviews

### orders_db
- `orders` - Orders
- `order_items` - Order line items
- `payment_sessions` - VietQR payment sessions

### notifications_db
- `notifications` - Notifications

### blogs_db
- `blog_categories` - Blog categories
- `blogs` - Blog posts

## Scripts

```bash
npm run dev          # Run development mode
npm run start        # Run production mode
npm run stop         # Stop services
npm run clean        # Remove containers and volumes
npm run logs         # View logs
npm run logs:dev     # View logs (dev mode)
```

## Ports

| Service | Development | Production |
|---------|-------------|------------|
| API Gateway | 3000 | 3000 |
| User Service | 3001 | 3001 |
| Book Service | 3002 | 3002 |
| Order Service | 3003 | 3003 |
| Blog Service | 3005 (host) → 3004 (container) | 3004 |
| Notification Service | 3004 | 3005 |
| Frontend | 5173 | - |
| PostgreSQL (user-db) | 5431 | internal |
| PostgreSQL (book-db) | 5432 | internal |
| PostgreSQL (order-db) | 5433 | internal |
| PostgreSQL (notification-db) | 5434 | internal |
| PostgreSQL (blog-db) | 5435 | internal |
| Redis | 6379 | internal |
| RabbitMQ | 5672, 15672 | 5672, 15672 |

## Health Check

Each service exposes a `/health` endpoint:

```bash
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # User Service
curl http://localhost:3002/health  # Book Service
curl http://localhost:3003/health  # Order Service
curl http://localhost:3005/health  # Notification Service
```

## API Documentation

Swagger UI available in development mode:
- API Gateway: http://localhost:3000/api-docs
- User Service: http://localhost:3001/api-docs
- Book Service: http://localhost:3002/api-docs
- Order Service: http://localhost:3003/api-docs

## Key Features

### Authentication
- Registration with OTP email verification
- Email/password login
- OAuth with Google and Facebook
- JWT-based authentication

### Payment
- VietQR integration for QR code payment
- QR codes expire after 15 minutes
- Manual payment confirmation by admin

### Search
- Full-text search with PostgreSQL
- Search suggestions
- Filter by category, price, author

### Caching
- Redis caching for book catalog
- Session storage

### Message Queue
- RabbitMQ for async notifications
- Event-driven architecture

## License

MIT
