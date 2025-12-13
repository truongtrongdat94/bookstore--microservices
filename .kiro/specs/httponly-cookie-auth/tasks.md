# Implementation Plan

- [x] 1. Create Cookie Helper Module in User Service






  - [x] 1.1 Create `user-service/src/utils/cookieHelper.ts` with cookie configuration

    - Implement `getCookieOptions()` function returning HttpOnly, Secure, SameSite, Path, MaxAge
    - Implement `setAuthCookie(res, token)` function to set auth_token cookie
    - Implement `clearAuthCookie(res)` function to clear auth_token cookie
    - Use environment variable to determine Secure flag (true in production)
    - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.2_
  - [ ]* 1.2 Write property test for cookie helper
    - **Property 1: Auth cookie has correct security attributes**
    - **Validates: Requirements 1.1, 1.2, 1.4, 1.5**

- [x] 2. Update Auth Controller to Set Cookies




  - [x] 2.1 Update `login()` method in `authController.ts`


    - Import and use `setAuthCookie()` to set cookie
    - Remove token from response body
    - Keep user info in response body


    - _Requirements: 1.1_
  - [x] 2.2 Update `verifyEmail()` method in `authController.ts`


    - Import and use `setAuthCookie()` to set cookie after OTP verification
    - Remove token from response body
    - _Requirements: 1.2_
  - [x] 2.3 Update `logout()` method in `authController.ts`
    - Import and use `clearAuthCookie()` to clear cookie
    - _Requirements: 2.1, 2.2_
  - [ ]* 2.4 Write property test for logout cookie clearing
    - **Property 2: Logout clears auth cookie correctly**
    - **Validates: Requirements 2.1, 2.2**

- [x] 3. Create /auth/me Endpoint





  - [x] 3.1 Add `getMe()` method in `authController.ts`


    - Extract user info from JWT (already decoded by middleware)
    - Return user info in response


    - _Requirements: 5.2, 5.3_
  - [x] 3.2 Add route `GET /auth/me` in `auth.ts` routes
    - Apply auth middleware to protect the route
    - _Requirements: 5.2_
  - [ ]* 3.3 Write property test for /auth/me endpoint
    - **Property 6: /auth/me returns user info for valid cookie**
    - **Validates: Requirements 5.2, 5.3**

- [x] 4. Update OAuth Controller for Cookie-Based Auth






  - [x] 4.1 Update `googleCallback()` in `oauthController.ts`

    - Use `setAuthCookie()` instead of putting token in redirect URL
    - Redirect to frontend with success indicator only
    - _Requirements: 1.3, 7.1, 7.2_
  - [ ]* 4.2 Write property test for OAuth redirect
    - **Property 8: OAuth redirect does not expose token in URL**
    - **Validates: Requirements 7.2**

- [x] 5. Checkpoint - Backend Cookie Implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create Cookie Auth Middleware in API Gateway





  - [x] 6.1 Install cookie-parser package in api-gateway


    - Run `npm install cookie-parser @types/cookie-parser`


    - _Requirements: 3.1_
  - [x] 6.2 Create `api-gateway/src/middleware/cookieAuth.ts`
    - Parse auth_token from cookies
    - Verify JWT and extract payload


    - Add x-user-id, x-user-email, x-user-role headers
    - Return 401 for invalid/missing cookies on protected routes
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 6.3 Update `api-gateway/src/app.ts` to use cookie-parser and cookieAuth middleware
    - Add cookie-parser middleware
    - Apply cookieAuth middleware to protected routes
    - _Requirements: 3.1_
  - [ ]* 6.4 Write property test for cookie JWT extraction
    - **Property 3: Cookie JWT extraction produces correct user headers**
    - **Validates: Requirements 3.1, 3.2**
  - [ ]* 6.5 Write property test for invalid cookie handling
    - **Property 4: Invalid cookie returns 401**
    - **Validates: Requirements 3.4**

- [x] 7. Update CORS Configuration in API Gateway







  - [x] 7.1 Update `api-gateway/src/middleware/cors.ts`
    - Set `credentials: true` in CORS options
    - Use specific origin from environment variable instead of wildcard
    - Configure allowed origins for development (localhost:5173) and production
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]* 7.2 Write property test for CORS configuration
    - **Property 7: CORS configured for credentials**
    - **Validates: Requirements 6.1, 6.2**

- [x] 8. Checkpoint - API Gateway Implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update Frontend API Client










  - [x] 9.1 Update `frontend_service/src/api/client.ts`

    - Add `withCredentials: true` to axios instance config
    - Remove localStorage.getItem('auth_token') from request interceptor
    - Remove localStorage.removeItem('auth_token') from response interceptor
    - _Requirements: 4.1_

- [x] 10. Update Frontend Auth Store






  - [x] 10.1 Update `frontend_service/src/store/authStore.ts`

    - Remove `token` from state interface
    - Remove `localStorage.setItem('auth_token')` from `setAuth()`
    - Remove `localStorage.removeItem('auth_token')` from `clearAuth()`
    - Update `setAuth()` to only store user info
    - _Requirements: 4.2, 4.3_
  - [ ]* 10.2 Write property test for frontend token storage
    - **Property 5: Frontend does not store token in localStorage**
    - **Validates: Requirements 4.2, 4.3**

- [x] 11. Update Frontend Auth API and Hooks





  - [x] 11.1 Update `frontend_service/src/api/auth.ts`


    - Add `getMe()` function to call GET /api/auth/me
    - Update `logout()` to call backend logout endpoint
    - Update response types to not expect token in body
    - _Requirements: 5.1_


  - [x] 11.2 Update `frontend_service/src/hooks/useAuth.ts`
    - Use `getMe()` to check auth status on app load
    - Update login success handler to not store token
    - Update logout to call backend endpoint
    - _Requirements: 5.1, 5.4_

- [x] 12. Update Frontend Auth Components







  - [x] 12.1 Update `frontend_service/src/components/AuthPage.tsx`
    - Remove `localStorage.setItem('auth_token')` from OTP verification handler
    - Update to use new auth flow without token in response
    - _Requirements: 4.2_

- [x] 13. Update Frontend Types






  - [x] 13.1 Update `frontend_service/src/types/index.ts`

    - Update `AuthResponse` type to not include token
    - Add `MeResponse` type for /auth/me endpoint
    - _Requirements: 4.3_

- [x] 14. Final Checkpoint - Full Integration


  - Ensure all tests pass, ask the user if questions arise.
