# JBE Commerce — Frontend

React + Vite single-page application for the JBE Commerce e-commerce platform.

| | |
|---|---|
| **Live URL** | https://jbe-commerceapp.netlify.app |
| **Backend API** | https://ecom-backend-3sh8.onrender.com |
| **Repo** | https://github.com/Jayabharathreddys/E-com-Frontend-Project |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build tool | Vite |
| Routing | React Router v6 |
| HTTP client | Axios |
| Icons | react-icons |
| State | React Context API (Auth + Cart) |
| Testing | Vitest + React Testing Library |
| Payments | Razorpay Checkout.js |
| Deployment | Netlify |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env`
```env
VITE_BASE_URL=http://localhost:3001
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
```

### 3. Run development server
```bash
npm run dev
```

### 4. Run tests
```bash
npm test
```

### 5. Build for production
```bash
npm run build
```

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_BASE_URL` | Yes | Backend API base URL (no trailing slash) | `https://ecom-backend-3sh8.onrender.com` |
| `VITE_RAZORPAY_KEY_ID` | Yes | Razorpay public key (baked in at build time) | `rzp_test_xxx` |

> **Note:** Vite bakes env vars at **build time**. After adding/changing a Netlify env var, trigger a manual redeploy.

---

## Pages & Routes

| Route | Page | Auth Required | Notes |
|-------|------|:---:|-------|
| `/` | Product listing (all) | No | Paginated, 6 per page |
| `/products/:categoryName` | Product listing by category | No | |
| `/signup` | Register | No | Full field validation |
| `/login` | Login | No | Returns to original page after login |
| `/forgot-password` | Forgot Password | No | Email → OTP sent in background |
| `/reset-password/:userId` | Reset Password | No | OTP + new password form |
| `/cart` | Cart + Checkout | Yes | Redirects to `/login` if not authenticated |
| `/unauthorized` | 401 error page | No | |
| `*` | 404 Not Found | No | |

---

## Project Structure

```
src/
├── components/
│   ├── addToCart/       # +/- quantity controls; Add to Cart button
│   ├── cartItem/        # Single cart row (image, name, price, total)
│   ├── header/          # Site header wrapping Navbar
│   ├── loader/          # Spinner component
│   ├── navbar/          # Nav links, Hi [name] greeting, Logout, cart badge
│   ├── pagination/      # Page buttons, prev/next arrows, active highlight
│   ├── product/         # Product card with star rating + image fallback
│   └── requireAuth/     # Route guard — redirects to /login with return URL
├── context/
│   ├── auth/            # AuthContext, AuthProvider (sessionStorage), useAuth
│   └── cart/            # CartContext, CartProvider, useCart, clearCart
├── hooks/
│   └── useFetchData.js  # Generic fetch hook — data / error / isLoading
├── pages/
│   ├── cartItems/       # Cart page + Razorpay payment + verify + clear cart
│   ├── login/           # Email + password validation; stores token
│   ├── notFound/        # 404 page
│   ├── productListing/  # Product grid, empty state, error state, pagination
│   ├── signup/          # Name/email/password/confirm validation
│   └── unauthorized/    # 401 page
├── routes/
│   └── AppRoutes.jsx    # All route definitions including RequireAuth guard
├── test/                # Vitest test suites
├── utils/
│   └── urlConfig.js     # Centralised API endpoints
└── index.css            # CSS custom properties (global theme)
```

---

## Key Features

| Feature | Detail |
|---------|--------|
| Auth persistence | Login survives page refresh via `sessionStorage` |
| Bearer token auth | JWT stored in sessionStorage, sent as `Authorization: Bearer` header — works cross-origin without cookie issues |
| Protected routes | `RequireAuth` redirects unauthenticated users to `/login`; return URL preserved |
| Field validation | Instant error messages on all form fields (Login + Signup) |
| Pagination | Active-page highlight, prev/next arrows, aria labels, auto-scroll to top |
| Product cards | Star rating (★½☆), image `onError` fallback, hover effects |
| Cart badge | Live item count; resets to 0 on logout |
| User greeting | "Hi, Jay!" shown in navbar when logged in |
| Full payment flow | Razorpay order creation → checkout modal → backend signature verify → success |
| Cart clear | Cart empties automatically after successful payment |
| Custom error pages | 401 Unauthorized and 404 Not Found |
| Global theming | CSS custom properties: colours, spacing, radius, shadows |
| Categories from FakeStore | Nav categories loaded from `fakestoreapi.com/products/categories` |

---

## Payment Flow

```
1. Click Pay Now
2. POST /api/booking/:productId  { priceAtThatTime, quantity }  → order_id
3. Razorpay modal opens
4. User completes payment
5. handler() receives { razorpay_order_id, razorpay_payment_id, razorpay_signature }
6. POST /api/booking/verify  → backend verifies HMAC signature
7. Booking marked 'confirmed' in MongoDB
8. Email receipt sent in background (non-blocking)
9. Cart cleared, success screen shown
```

---

## Deployment (Netlify)

1. Push to GitHub — Netlify auto-deploys on push
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `public/_redirects` with `/* /index.html 200` for SPA routing
5. Set environment variables in Netlify → Site Settings → Environment Variables:
   - `VITE_BASE_URL`
   - `VITE_RAZORPAY_KEY_ID`
6. Trigger a manual redeploy after changing env vars

---

## Running Tests

```bash
npm test                                        # all suites
npx vitest run src/test/Login.test.jsx          # single file
npx vitest run --reporter=verbose               # detailed output
```

| Test File | Tests | What it covers |
|-----------|------:|----------------|
| `Login.test.jsx` | 8 | Email/password validation, server error, redirect |
| `Signup.test.jsx` | 7 | All field validations, server error, redirect to login |
| `ForgotPassword.test.jsx` | 10 | Email validation, user-not-found, success screen, OTP sent |
| `ResetPassword.test.jsx` | 13 | OTP/password validation, wrong OTP error, redirect on success |
| `ErrorPages.test.jsx` | 9 | 404 code/heading/link, 401 code/heading/links |
| `RequireAuth.test.jsx` | 3 | Auth guard redirects and allows access |
| `Pagination.test.jsx` | 11 | Active state, arrows, disabled states, aria |
| `Product.test.jsx` | 8 | Title, price, image, rating present/absent |
| `CartItems.test.jsx` | 11 | Unauth state, empty cart, items, total, pay flow |
| `CartItem.test.jsx` | 7 | Price rendering (Rs.), string price guard, total, image |
| `Navbar.test.jsx` | 6 | Login link, logout button, category links, cart badge |
| `CartProvider.test.jsx` | 5 | Add, remove, clear cart operations |
| `useFetchData.test.jsx` | 4 | Loading state, data, error, fallback to initialData |
| `AddToCart.test.jsx` | 4 | Add button, quantity display, remove |
