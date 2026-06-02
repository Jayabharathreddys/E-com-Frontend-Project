# JBE Commerce — Frontend

React + Vite single-page application for the JBE Commerce e-commerce platform.

|                 |                                                             |
| --------------- | ----------------------------------------------------------- |
| **Live URL**    | https://e-com-frontend-project-eta.vercel.app               |
| **Backend API** | https://ecom-backend-3sh8.onrender.com                      |
| **Repo**        | https://github.com/Jayabharathreddys/E-com-Frontend-Project |

---

## Tech Stack

| Layer       | Technology                      |
| ----------- | ------------------------------- |
| Framework   | React 18                        |
| Build tool  | Vite                            |
| Routing     | React Router v6                 |
| HTTP client | Axios                           |
| Icons       | react-icons                     |
| State       | React Context API (Auth + Cart) |
| Testing     | Vitest + React Testing Library  |
| Payments    | Razorpay Checkout.js            |
| Deployment  | Netlify                         |

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

| Variable               | Required | Description                                  | Example                                  |
| ---------------------- | -------- | -------------------------------------------- | ---------------------------------------- |
| `VITE_BASE_URL`        | Yes      | Backend API base URL (no trailing slash)     | `https://ecom-backend-3sh8.onrender.com` |
| `VITE_RAZORPAY_KEY_ID` | Yes      | Razorpay public key (baked in at build time) | `rzp_test_xxx`                           |

> **Note:** Vite bakes env vars at **build time**. After adding/changing a Netlify env var, trigger a manual redeploy.
>
> **Security:** Never add server-side secrets (JWT signing key, Razorpay secret) to this repo — they are backend-only.

---

## Pages & Routes

| Route                     | Page                        | Auth Required | Notes                                               |
| ------------------------- | --------------------------- | :-----------: | --------------------------------------------------- |
| `/`                       | Product listing (all)       |      No       | Paginated, 6 per page                               |
| `/products/:categoryName` | Product listing by category |      No       | Page resets to 1 on category change                 |
| `/signup`                 | Register                    |      No       | Full field validation                               |
| `/login`                  | Login                       |      No       | Returns to original page after login                |
| `/forgot-password`        | Forgot Password             |      No       | Email → OTP sent in background                      |
| `/reset-password/:userId` | Reset Password              |      No       | OTP + new password form                             |
| `/cart`                   | Cart + Checkout             |      Yes      | Redirects to `/login` if not authenticated          |
| `/orders`                 | My Orders                   |      Yes      | Status tabs, search, pagination, My Account sidebar |
| `/orders/:orderId`        | Order Detail                |      Yes      | Timeline, payment summary, download invoice         |
| `/wishlist`               | Wishlist                    |      Yes      | Coming Soon page (v2.0)                             |
| `/dashboard`              | Dashboard                   |      Yes      | Coming Soon page (v2.0)                             |
| `/addresses`              | Saved Addresses             |      Yes      | Coming Soon page (v2.0)                             |
| `/profile`                | Profile Settings            |      Yes      | Coming Soon page (v2.0)                             |
| `/unauthorized`           | 401 error page              |      No       |                                                     |
| `*`                       | 404 Not Found               |      No       |                                                     |

---

## Project Structure

```
src/
├── components/
│   ├── addToCart/       # +/- quantity controls; Add to Cart button
│   ├── cartItem/        # Single cart row (image, name, price, total)
│   ├── header/          # Site header wrapping Navbar
│   ├── loader/          # Spinner component
│   ├── navbar/          # Nav links, Hi [name] greeting, dropdown menu, cart label+badge
│   ├── pagination/      # Page buttons, prev/next arrows, active highlight
│   ├── product/         # Product card with star rating + image fallback
│   └── requireAuth/     # Route guard — redirects to /login with return URL
├── context/
│   ├── auth/            # AuthContext, AuthProvider (sessionStorage), useAuth
│   └── cart/            # CartContext, CartProvider, useCart, clearCart
├── hooks/
│   └── useFetchData.js  # Generic fetch hook (withCredentials + auth scoped to own backend)
├── pages/
│   ├── cartItems/       # Cart + Razorpay payment + orphan rollback + PDF receipt
│   ├── comingSoon/      # Per-route "Feature Under Development" page (Wishlist, Dashboard, etc.)
│   ├── forgotPassword/  # Email → OTP flow
│   ├── login/           # Email + password validation; stores token
│   ├── notFound/        # 404 page
│   ├── orderDetail/     # Single order: timeline, payment summary, download invoice, buy again
│   ├── orders/          # My Orders: sidebar, status tabs, search, cards, pagination
│   ├── productListing/  # Product grid, empty state, error state, pagination
│   ├── resetPassword/   # OTP + new password form
│   ├── signup/          # Name/email/password/confirm validation + aria-describedby
│   └── unauthorized/    # 401 page
├── routes/
│   └── AppRoutes.jsx    # All routes — lazy-loaded non-critical pages, RequireAuth guard
├── test/                # Vitest + React Testing Library suites (187 tests)
└── utils/
    ├── generateReceipt.js  # jsPDF receipt generator
    ├── orderUtils.js       # STATUS_BADGE map, formatDate helper
    └── urlConfig.js        # Centralised API endpoints
```

---

## Key Features

| Feature                   | Detail                                                                          |
| ------------------------- | ------------------------------------------------------------------------------- |
| Auth persistence          | Login survives page refresh via `sessionStorage`                                |
| Bearer token auth         | JWT stored in sessionStorage, sent as `Authorization: Bearer` header            |
| Protected routes          | `RequireAuth` redirects unauthenticated users to `/login`; return URL preserved |
| Field validation          | Instant error messages on all form fields (Login + Signup)                      |
| Pagination                | Active-page highlight, prev/next arrows, aria labels, auto-scroll to top        |
| Product cards             | Star rating (★½☆), image `onError` fallback, hover effects                      |
| Cart badge                | Live item count + "Cart" text label; resets to 0 on logout                      |
| User dropdown             | Hi [name] → Dashboard, My Orders, Wishlist, Addresses, Profile Settings, Logout |
| Multi-item checkout       | All cart items booked in parallel before opening Razorpay modal                 |
| Orphan cleanup            | If any booking creation fails, succeeded bookings are rolled back (DELETE)      |
| Full payment flow         | Razorpay order → modal → backend HMAC verify → all bookings confirmed           |
| PDF receipt               | jsPDF receipt download after successful payment or from Order Detail            |
| My Orders page            | Account sidebar, status tabs, search, rich order cards, client-side pagination  |
| Order Detail page         | Status timeline, item summary, payment summary, download invoice, buy again     |
| Coming Soon pages         | Wishlist / Dashboard / Addresses / Profile show a feature roadmap page          |
| AbortController           | In-flight requests cancelled on unmount — no stale state updates                |
| Lazy loading              | 7 non-critical pages loaded with `React.lazy` + `Suspense`                      |
| Custom error pages        | 401 Unauthorized and 404 Not Found                                              |
| Global theming            | CSS custom properties: colours, spacing, radius, shadows                        |
| Categories from FakeStore | Nav categories loaded from `fakestoreapi.com/products/categories`               |

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

| Test File                 | What it covers                                                             |
| ------------------------- | -------------------------------------------------------------------------- |
| `Login.test.jsx`          | Email/password validation, server error, redirect                          |
| `Signup.test.jsx`         | All field validations, server error, redirect to login                     |
| `ForgotPassword.test.jsx` | Email validation, user-not-found, success screen                           |
| `ResetPassword.test.jsx`  | OTP/password validation, wrong OTP, redirect on success                    |
| `ErrorPages.test.jsx`     | 404 code/heading/link, 401 code/heading/links                              |
| `RequireAuth.test.jsx`    | Auth guard redirects and allows access                                     |
| `Pagination.test.jsx`     | Active state, arrows, disabled states, aria                                |
| `Product.test.jsx`        | Title, price, image, rating present/absent                                 |
| `CartItems.test.jsx`      | Unauth state, single-item flow, multi-item booking, verify with bookingIds |
| `CartItem.test.jsx`       | Price rendering (Rs.), string price guard, total, image                    |
| `Navbar.test.jsx`         | Login/Logout, category keys, LOGOUT_URL call, sessionStorage clear         |
| `CartProvider.test.jsx`   | Add, remove, clear, unknown-id guard, rapid-click stale-closure            |
| `useFetchData.test.jsx`   | Loading state, data, error, url-change re-fetch                            |
| `AddToCart.test.jsx`      | Add button, quantity display, remove                                       |
| `ProductListing.test.jsx` | Products render, empty state, error state, page reset on category change   |

---

## Scaler Curriculum Coverage

This frontend builds on the Node.js backend skills from `ec-1_Intro_to_nodeJS` by consuming the REST API taught across all three lectures.

| Backend Concept (lecture)                  | How Frontend Uses It                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `http` module → Express REST API (Lec-1/2) | All data fetched via `axios` in `useFetchData` and page components        |
| CRUD HTTP methods (Lec-2)                  | GET products/orders, POST login/signup/booking, DELETE cart rollback      |
| `req.query` filters (Lec-2)                | `?status=confirmed` tab filter on My Orders                               |
| JWT auth + cookies (Lec-3+)                | Token stored in sessionStorage; sent as `Authorization: Bearer`           |
| `withCredentials` for cookie auth          | `useFetchData` sends credentials only for own-backend URLs (origin check) |
| MongoDB ObjectId responses                 | Order IDs displayed in order cards and detail page                        |
| Mongoose `populate` (Lec-3)                | Product name/image shown in order cards from populated backend response   |
| Razorpay payment backend                   | Frontend initiates Razorpay checkout, calls `/verify` after success       |

### Frontend-only concepts (beyond Node.js lectures)

| Concept                   | Where                                                                |
| ------------------------- | -------------------------------------------------------------------- |
| React 18 + Vite           | Entire SPA                                                           |
| React Context API         | `AuthContext`, `CartContext`                                         |
| React Router v6           | `AppRoutes.jsx`, `RequireAuth`                                       |
| `React.lazy` + `Suspense` | 7 lazy-loaded pages                                                  |
| `AbortController`         | `useFetchData.js`                                                    |
| Vitest + RTL              | 187 tests across 19 test files                                       |
| jsPDF                     | `generateReceipt.js`                                                 |
| ARIA / accessibility      | `aria-describedby`, `role="tab"`, `aria-selected`, `role="menuitem"` |

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
