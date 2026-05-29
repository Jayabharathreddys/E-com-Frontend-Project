# JBE Commerce — Frontend

React + Vite single-page application for the JBE Commerce e-commerce platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build tool | Vite |
| Routing | React Router v6 |
| HTTP client | Axios |
| Icons | react-icons |
| State | React Context API |
| Testing | Vitest + React Testing Library |
| Payments | Razorpay Checkout.js |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` from the example
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

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BASE_URL` | Backend API URL (no trailing slash) | `https://ecom-backend.onrender.com` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key | `rzp_test_xxx` |

---

## Pages & Routes

| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Product listing (all products) | No |
| `/products/:categoryName` | Product listing (by category) | No |
| `/signup` | Sign Up form | No |
| `/login` | Sign In form | No |
| `/cart` | Cart & Checkout | Yes |
| `/unauthorized` | 401 error page | No |
| `*` | 404 Not Found | No |

---

## Project Structure

```
src/
├── components/
│   ├── addToCart/       # Add to Cart button with quantity controls
│   ├── cartItem/        # Single cart row (image, price, total)
│   ├── header/          # Site header wrapping Navbar
│   ├── loader/          # Spinner component
│   ├── navbar/          # Navigation with Login/Logout + cart badge
│   ├── pagination/      # Page navigator with active-state + arrows
│   ├── product/         # Product card with rating stars
│   └── requireAuth/     # Route guard — redirects to /login
├── context/
│   ├── auth/            # AuthContext, AuthProvider, useAuth hook
│   └── cart/            # CartContext, CartProvider, useCart hook
├── hooks/
│   └── useFetchData.js  # Data-fetching hook with loading/error states
├── pages/
│   ├── cartItems/       # Cart page + Razorpay payment flow
│   ├── login/           # Login form with field validation
│   ├── notFound/        # 404 page
│   ├── productListing/  # Product grid with pagination + empty state
│   ├── signup/          # Signup form with password match validation
│   └── unauthorized/    # 401 page
├── routes/
│   └── AppRoutes.jsx    # All route definitions
├── test/                # All Vitest test files
├── utils/
│   └── urlConfig.js     # Centralised API endpoint config
└── index.css            # Global CSS variables (theme)
```

---

## Key Features

- **Auth persistence** — login survives page refresh via `sessionStorage`
- **Protected routes** — unauthenticated users redirected to `/login` with return URL
- **Field-level validation** — instant feedback on Signup and Login forms
- **Pagination** — active-page highlight, previous/next arrows, auto-scroll to top
- **Product cards** — star rating display, image fallback on error
- **Cart badge** — live item count on the cart icon
- **Razorpay** — full checkout modal integration
- **Custom error pages** — 401 Unauthorized and 404 Not Found
- **Global theming** — CSS custom properties for colours, spacing, typography

---

## Deployment (Netlify)

1. Push to GitHub
2. Create a new Netlify site from the repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variables in Netlify dashboard
6. Add `public/_redirects` containing `/* /index.html 200` for SPA routing

---

## Running Tests Locally

```bash
npm test                                   # run all tests
npx vitest run src/test/Login.test.jsx     # run specific file
```

**Test coverage includes:**
- Login validation (8 tests)
- Signup validation (7 tests)
- Pagination active state + arrows (11 tests)
- Product card with/without rating (8 tests)
- Error pages 401 + 404 (9 tests)
- RequireAuth redirect (3 tests)
- Cart operations (11 tests)
- useFetchData hook (4 tests)
- AddToCart + CartItem components (9 tests)
- CartProvider state (5 tests)
