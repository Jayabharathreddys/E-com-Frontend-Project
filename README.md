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

### 2. Create `.env` (copy from `.env.example`)
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
>
> **Security:** Never add server-side secrets (JWT signing key, Razorpay secret) to this repo — they are backend-only.

---

## Pages & Routes

| Route | Page | Auth Required | Notes |
|-------|------|:---:|-------|
| `/` | Product listing (all) | No | Paginated, 6 per page |
| `/products/:categoryName` | Product listing by category | No | Page resets to 1 on category change |
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
└── index.css            # Global CSS reset and rem scale (html only)
```

---

## Key Features

| Feature | Detail |
|---------|--------|
| Auth persistence | Login survives page refresh via `sessionStorage` |
| Bearer token auth | JWT stored in sessionStorage, sent as `Authorization: Bearer` header |
| Protected routes | `RequireAuth` redirects unauthenticated users to `/login`; return URL preserved |
| Field validation | Instant error messages on all form fields (Login + Signup) |
| Pagination | Active-page highlight, prev/next arrows, aria labels, auto-scroll to top |
| Product cards | Star rating (★½☆), image `onError` fallback, hover effects |
| Cart badge | Live item count; resets to 0 on logout |
| User greeting | "Hi, Jay!" shown in navbar when logged in |
| Multi-item checkout | All cart items booked before opening Razorpay modal |
| Full payment flow | Razorpay order creation → checkout modal → backend signature verify → success |
| Cart clear | Cart empties automatically after successful payment |
| Custom error pages | 401 Unauthorized and 404 Not Found |
| Global theming | CSS custom properties: colours, spacing, radius, shadows |
| Categories from FakeStore | Nav categories loaded from `fakestoreapi.com/products/categories` |

---

## Payment Flow

```
1. Click Pay Now
2. For each cart item:
   POST /api/booking/:productId  { priceAtThatTime, quantity }  → bookingId
3. Combined Razorpay modal opens (sum of all item amounts)
4. User completes payment
5. handler() receives { razorpay_order_id, razorpay_payment_id, razorpay_signature }
6. POST /api/booking/verify  { bookingIds: [...] }  → backend verifies HMAC signature
7. All bookings marked 'confirmed' in MongoDB
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

| Test File | What it covers |
|-----------|----------------|
| `Login.test.jsx` | Email/password validation, server error, redirect |
| `Signup.test.jsx` | All field validations, server error, redirect to login |
| `ForgotPassword.test.jsx` | Email validation, user-not-found, success screen |
| `ResetPassword.test.jsx` | OTP/password validation, wrong OTP, redirect on success |
| `ErrorPages.test.jsx` | 404 code/heading/link, 401 code/heading/links |
| `RequireAuth.test.jsx` | Auth guard redirects and allows access |
| `Pagination.test.jsx` | Active state, arrows, disabled states, aria |
| `Product.test.jsx` | Title, price, image, rating present/absent |
| `CartItems.test.jsx` | Unauth state, single-item flow, multi-item booking, verify with bookingIds |
| `CartItem.test.jsx` | Price rendering (Rs.), string price guard, total, image |
| `Navbar.test.jsx` | Login/Logout, category keys, LOGOUT_URL call, sessionStorage clear |
| `CartProvider.test.jsx` | Add, remove, clear, unknown-id guard, rapid-click stale-closure |
| `useFetchData.test.jsx` | Loading state, data, error, url-change re-fetch |
| `AddToCart.test.jsx` | Add button, quantity display, remove |
| `ProductListing.test.jsx` | Products render, empty state, error state, page reset on category change |

---

## Changelog

### Bug Fixes (code review pass)

**Critical**
- **CartItems.jsx** — Checkout now creates one booking per cart item (loop over all items), then opens a single Razorpay modal for the combined amount. Previously only the first item was booked.
- **ProductListing.jsx** — Added `useEffect` to reset `currentPage` to 1 whenever `categoryName` route param changes. Previously landing on page 3 of one category kept you on page 3 after switching categories.
- **CartProvider.jsx** — `removeFromCart` now guards against unknown productId before accessing `.quantity` (prevented a TypeError crash). Also both `addToCart` and `removeFromCart` use functional state updates (`prev => ...`) to eliminate stale-closure bugs on rapid clicks.

**Important**
- **CartProvider.jsx** — All `setTotalQuantity` and `setCartState` calls now use functional updaters.
- **main.jsx** — Re-enabled `React.StrictMode` (was commented out).
- **.env.example** — Removed `SECRET_KEY` (backend-only, never frontend). Added `VITE_RAZORPAY_KEY_ID` which was missing.
- **Navbar.jsx** — Logout now calls `urlConfig.LOGOUT_URL` instead of a fragile `ORDR_URL.replace(...)` string hack.
- **index.css** — Moved `font-size: 62.5%` from `*` selector to `html` only. Applying it to `*` overrode every child element's inherited size, breaking the rem cascade.

**Code Quality**
- **urlConfig.js** — Renamed `ORDR_URL` → `ORDER_URL` and `FORGET_PASSWORD_URL` → `FORGOT_PASSWORD_URL`. Added `LOGOUT_URL`. Updated all call sites.
- **useFetchData.js** — Renamed `intialData` → `initialData`. Moved `fetchData` definition inside `useEffect` to satisfy `react-hooks/exhaustive-deps`.
- **Navbar.jsx** — Category list now uses the category name string as the React key instead of the array index.
- **useAuth.js** — Now imports `AuthContext` directly from `./AuthContext` instead of from `./AuthProvider` (where it was the default export — confusing pattern).
- **App.jsx** — Removed the redundant `<>` fragment wrapping a single root element.
- **index.html** — Updated `<title>` from generic "E-commerce App" to "JBE Commerce".
