# Requirements Document

## Introduction

Chuyển đổi cơ chế lưu trữ JWT token từ localStorage sang HttpOnly Cookie để tăng cường bảo mật cho hệ thống bookstore-microservices. Hiện tại, JWT token đang được lưu trong localStorage và Zustand persist store, điều này tạo ra lỗ hổng bảo mật XSS (Cross-Site Scripting) vì JavaScript có thể đọc được token. Việc chuyển sang HttpOnly Cookie sẽ ngăn chặn JavaScript truy cập token, giảm thiểu rủi ro bị đánh cắp token qua XSS attacks.

## Glossary

- **JWT (JSON Web Token)**: Token xác thực được mã hóa chứa thông tin user
- **HttpOnly Cookie**: Cookie với flag HttpOnly, ngăn JavaScript truy cập
- **Secure Cookie**: Cookie chỉ được gửi qua HTTPS
- **SameSite Cookie**: Cookie attribute ngăn chặn CSRF attacks
- **CORS (Cross-Origin Resource Sharing)**: Cơ chế cho phép request từ domain khác
- **user-service**: Microservice xử lý authentication và user management
- **api-gateway**: Service trung gian proxy requests đến các microservices
- **frontend_service**: React frontend application

## Requirements

### Requirement 1

**User Story:** As a developer, I want the backend to set JWT token in HttpOnly cookie instead of returning it in response body, so that the token cannot be accessed by JavaScript.

#### Acceptance Criteria

1. WHEN a user successfully logs in THEN the user-service SHALL set a cookie named `auth_token` with flags HttpOnly, Secure (in production), and SameSite=Lax
2. WHEN a user successfully verifies OTP THEN the user-service SHALL set the same HttpOnly cookie with the JWT token
3. WHEN a user successfully authenticates via OAuth (Google) THEN the user-service SHALL set the HttpOnly cookie before redirecting to frontend
4. WHEN setting the auth cookie THEN the user-service SHALL set cookie expiration matching JWT expiration time
5. WHEN in development environment THEN the user-service SHALL set Secure=false to allow HTTP connections

### Requirement 2

**User Story:** As a developer, I want the backend to provide a logout endpoint that clears the auth cookie, so that users can securely log out.

#### Acceptance Criteria

1. WHEN a user calls the logout endpoint THEN the user-service SHALL clear the auth_token cookie by setting it with an expired date
2. WHEN clearing the auth cookie THEN the user-service SHALL use the same cookie options (path, domain) as when setting it

### Requirement 3

**User Story:** As a developer, I want the api-gateway to read JWT from cookie instead of Authorization header, so that authentication works with HttpOnly cookies.

#### Acceptance Criteria

1. WHEN a request contains the auth_token cookie THEN the api-gateway SHALL extract the JWT from the cookie
2. WHEN the api-gateway extracts JWT from cookie THEN the api-gateway SHALL add user headers (x-user-id, x-user-email, x-user-role) to proxied requests
3. WHEN a request contains both cookie and Authorization header THEN the api-gateway SHALL prioritize the cookie
4. WHEN the cookie contains an invalid or expired JWT THEN the api-gateway SHALL return 401 Unauthorized

### Requirement 4

**User Story:** As a developer, I want the frontend to send credentials with every API request, so that cookies are automatically included.

#### Acceptance Criteria

1. WHEN the frontend makes an API request THEN the api client SHALL include `withCredentials: true` option
2. WHEN the frontend receives a successful login response THEN the frontend SHALL NOT store token in localStorage
3. WHEN the frontend receives a successful login response THEN the frontend SHALL only store user info (not token) in Zustand store

### Requirement 5

**User Story:** As a developer, I want the frontend to check authentication status via an API endpoint, so that the app can determine if user is logged in without accessing the token.

#### Acceptance Criteria

1. WHEN the frontend needs to check auth status THEN the frontend SHALL call GET /api/auth/me endpoint
2. WHEN the auth cookie is valid THEN the /api/auth/me endpoint SHALL return user information
3. WHEN the auth cookie is invalid or missing THEN the /api/auth/me endpoint SHALL return 401 Unauthorized
4. WHEN the frontend receives 401 from /api/auth/me THEN the frontend SHALL clear local user state and redirect to login

### Requirement 6

**User Story:** As a developer, I want CORS to be properly configured for cookie-based authentication, so that cross-origin requests work correctly.

#### Acceptance Criteria

1. WHEN configuring CORS THEN the api-gateway SHALL set `Access-Control-Allow-Credentials: true`
2. WHEN configuring CORS THEN the api-gateway SHALL specify exact origin instead of wildcard `*`
3. WHEN in development THEN the api-gateway SHALL allow origin `http://localhost:5173` (Vite dev server)
4. WHEN in production THEN the api-gateway SHALL allow only the configured frontend domain

### Requirement 7

**User Story:** As a developer, I want the system to handle cookie-based auth in the OAuth flow, so that Google login works with HttpOnly cookies.

#### Acceptance Criteria

1. WHEN Google OAuth callback succeeds THEN the user-service SHALL set HttpOnly cookie before redirecting to frontend
2. WHEN redirecting after OAuth THEN the user-service SHALL redirect to frontend with a success indicator (not token in URL)
3. WHEN the frontend receives OAuth redirect THEN the frontend SHALL call /api/auth/me to get user info
