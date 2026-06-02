# JBE Commerce — Deployment & Architecture

> Full-stack e-commerce platform: React SPA on Vercel + Node.js/Express API on Render + MongoDB Atlas

---

## Live URLs

| Service              | URL                                           |
| -------------------- | --------------------------------------------- |
| Frontend (Vercel)    | https://e-com-frontend-project-eta.vercel.app |
| Backend API (Render) | https://ecom-backend-3sh8.onrender.com        |
| Database             | MongoDB Atlas — cloud-hosted cluster          |

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET / BROWSER                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTPS
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    VERCEL  (CDN + Edge)                          │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │               React SPA  (Vite build / dist/)            │  │
│   │                                                          │  │
│   │  Pages: ProductListing · Login · Signup · Cart           │  │
│   │         Orders · OrderDetail · ForgotPassword            │  │
│   │         ResetPassword · ComingSoon · NotFound            │  │
│   │                                                          │  │
│   │  State: AuthContext (sessionStorage) · CartContext       │  │
│   │  Routing: React Router v6  (vercel.json SPA rewrite)     │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   Build-time env vars baked in:                                  │
│     VITE_BASE_URL          → Render API base URL                 │
│     VITE_RAZORPAY_KEY_ID   → Razorpay public key                 │
└──────────────────────────┬───────────────────────────────────────┘
                           │  HTTPS  (Axios + withCredentials)
                           │  Authorization: Bearer <JWT>
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    RENDER  (Web Service)                         │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │           Node.js 18 + Express.js  API                   │  │
│   │                                                          │  │
│   │  Routers:  /api/auth      /api/product                   │  │
│   │            /api/booking   /api/user   /api/review        │  │
│   │                                                          │  │
│   │  Middleware stack (in order):                            │  │
│   │    helmet → cors → express.json → xss-sanitise           │  │
│   │    → rate-limit (auth routes) → JWT verify               │  │
│   │                                                          │  │
│   │  Integrations:                                           │  │
│   │    Razorpay SDK  (order create + HMAC verify)            │  │
│   │    Nodemailer → SendGrid SMTP (OTP + order emails)       │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   Runtime env vars set in Render dashboard:                      │
│     PORT · DB_USER · DB_PASSWORD · DB_CLUSTER                   │
│     JWT_SECRET · SECRET_KEY · ALLOWED_ORIGIN                    │
│     RAZORPAY_KEY_ID · RAZORPAY_KEY_SECRET                        │
│     SENDGRID_API_KEY · SENDER_EMAIL                              │
└──────────────────────────┬───────────────────────────────────────┘
                           │  TLS  (mongoose connection string)
                           │  mongodb+srv://
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                  MONGODB ATLAS  (Cloud DB)                       │
│                                                                  │
│   Collections:                                                   │
│     usermodels    → name, email, bcrypt-pw, role, bookings[]    │
│     productmodels → name, price, categories, images[]           │
│     bookingmodels → user, product, status, Razorpay IDs         │
│     reviewmodels  → user, product, rating, comment              │
└──────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌──────────────────────┐
│  RAZORPAY       │          │  SENDGRID (Email)     │
│  Order create   │          │  OTP reset emails     │
│  Checkout modal │          │  Order confirmations  │
│  HMAC verify    │          └──────────────────────┘
└─────────────────┘
```

---

## 2. Request Flow — Authenticated API Call

```
Browser (Vercel)                  Express (Render)           MongoDB Atlas
     │                                   │                        │
     │── GET /api/booking/my-orders ────►│                        │
     │   Authorization: Bearer <JWT>     │                        │
     │   Cookie: JWT=<token>             │                        │
     │                                   │                        │
     │                   protectRouteMiddleWare                   │
     │                   ├─ reads req.cookies.JWT                 │
     │                   └─ OR reads Authorization header         │
     │                   promisifiedJWTVerify(token, JWT_SECRET)  │
     │                                   │                        │
     │                   getMyOrdersController                    │
     │                   └─ BookingModel.find({ user: userId })──►│
     │                      .populate('product', ...)   ◄─────────│
     │                      .sort({ createdAt: -1 })              │
     │                                   │                        │
     │◄── 200 { status, data: [...] } ───│                        │
```

---

## 3. Payment Flow — Razorpay Multi-Item Checkout

```
Browser                    Express                    Razorpay         MongoDB
   │                          │                           │               │
   │  [1] POST /booking/:id ─►│                           │               │
   │       × N cart items     │── razorpay.orders.create──►│               │
   │                          │◄── { id, amount, ... } ───│               │
   │                          │── BookingModel.create() ──────────────────►│
   │◄── { bookingId, ... } ───│                           │               │
   │   (repeat per item)      │                           │               │
   │                          │                           │               │
   │  [2] Razorpay modal opens│                           │               │
   │      (SDK from CDN)      │                           │               │
   │                          │                           │               │
   │  [3] User completes pay  │                           │               │
   │◄── { order_id,           │                           │               │
   │      payment_id,         │                           │               │
   │      signature }         │                           │               │
   │                          │                           │               │
   │  [4] POST /booking/verify►│                           │               │
   │      { bookingIds:[...] } │── HMAC-SHA256 check       │               │
   │                          │   order_id|payment_id      │               │
   │                          │   signed w/ KEY_SECRET     │               │
   │                          │── updateMany confirmed ─────────────────►  │
   │◄── 200 { success } ──────│                           │               │
   │                          │── email in background ─────────────────►  │
   │  [5] Cart cleared        │                           │               │
   │      Success page shown  │                           │               │
```

---

## 4. Auth Flow — Login + JWT

```
Browser                    Express (Render)          MongoDB Atlas
   │                              │                        │
   │─ POST /api/auth/login ──────►│                        │
   │  { email, password }         │── findOne({ email }) ─►│
   │                              │◄── user document ───────│
   │                              │                        │
   │                 bcrypt.compare(password, user.password)
   │                 promisifiedJWTSign({ id }, JWT_SECRET, { expiresIn:'7d' })
   │                              │
   │◄─ 200 { token, user } ───────│
   │   Set-Cookie: JWT=<token>    │  (httpOnly, sameSite=none, secure=true)
   │                              │
   │  sessionStorage.setItem('auth_token', token)
   │                              │
   │─ All protected API calls ───►│
   │  Authorization: Bearer <JWT> │
   │  Cookie: JWT=<token>         │
```

---

## 5. Data Models (Entity-Relationship Diagram)

```
┌─────────────────┐           ┌─────────────────────┐
│   UserModel     │           │   ProductModel       │
│─────────────────│           │─────────────────────│
│ _id  [PK]       │           │ _id  [PK]            │
│ name            │           │ name                 │
│ email (unique)  │           │ price                │
│ password(bcrypt)│           │ categories[ ]        │
│ role            │           │ productImages[ ]     │
│ token (OTP)     │           │ createdAt            │
│ otpExpiry       │           │ updatedAt            │
│ bookings[ ] ────┼──┐        └──────────┬───────────┘
│ createdAt       │  │                   │
│ updatedAt       │  │ 1:N               │ 1:N
└─────────────────┘  │                   │
                     │ ┌─────────────────▼─────────────────┐
                     └─►          BookingModel              │
                       │──────────────────────────────────  │
                       │ _id  [PK]                          │
                       │ user        [FK → UserModel]       │
                       │ product     [FK → ProductModel]    │
                       │ priceAtThatTime                    │
                       │ quantity                           │
                       │ status  (pending|confirmed|        │
                       │          failed|success)           │
                       │ payment_order_id  [Razorpay]       │
                       │ payment_id        [Razorpay]       │
                       │ orderId                            │
                       │ createdAt                          │
                       │ updatedAt                          │
                       └────────────────────────────────────┘

       ┌──────────────────────────────────┐
       │          ReviewModel             │
       │──────────────────────────────────│
       │ _id  [PK]                        │
       │ user     [FK → UserModel]        │
       │ product  [FK → ProductModel]     │
       │ rating  (1–5)                    │
       │ comment                          │
       └──────────────────────────────────┘
```

---

## 6. Frontend Component Tree

```
main.jsx
└── <React.StrictMode>
    └── <AuthProvider>          (JWT + user in sessionStorage)
        └── <CartProvider>      (cart items + quantity badge)
            └── <AppRoutes>     (BrowserRouter)
                ├── <Header>    (rendered on all routes)
                │   └── <Navbar>
                │       ├── Category NavLinks (from fakestoreapi.com)
                │       ├── Cart Link  (label + badge)
                │       └── Account Dropdown
                │           ├── Dashboard
                │           ├── My Orders
                │           ├── Wishlist
                │           ├── Addresses
                │           ├── Profile Settings
                │           └── Logout
                └── <Suspense fallback={<Loader/>}>
                    ├── /                   ProductListing   [eager]
                    ├── /products/:cat      ProductListing   [eager]
                    ├── /login              Login            [eager]
                    ├── /signup             Signup           [eager]
                    ├── /forgot-password    ForgotPassword   [lazy]
                    ├── /reset-password/:id ResetPassword    [lazy]
                    ├── /unauthorized       Unauthorized     [lazy]
                    ├── <RequireAuth>       (JWT guard)
                    │   ├── /cart           CartItems        [lazy]
                    │   ├── /orders         Orders           [lazy]
                    │   ├── /orders/:id     OrderDetail      [lazy]
                    │   ├── /wishlist       ComingSoon       [lazy]
                    │   ├── /dashboard      ComingSoon       [lazy]
                    │   ├── /addresses      ComingSoon       [lazy]
                    │   └── /profile        ComingSoon       [lazy]
                    └── *                   NotFound         [lazy]
```

---

## 7. useFetchData Auth Scoping

```
useFetchData(url, initialData)
    │
    ├─ Parse URL.origin
    │   ├─ origin === VITE_BASE_URL.origin ?
    │   │       YES → attach withCredentials: true
    │   │             attach Authorization: Bearer <token>
    │   │
    │   └─ Different origin (e.g. fakestoreapi.com) ?
    │           NO  → plain GET (no credentials)
    │
    └─ Prevents credential leakage to third-party CDNs
       e.g. category fetch to fakestoreapi.com stays clean
```

---

## 8. Deployment Checklist

### Frontend — Vercel

```
[ ] Push branch to GitHub
[ ] Vercel auto-detects Vite project
    Build command:   npm run build
    Publish dir:     dist
[ ] vercel.json must contain:
    { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
[ ] Add env vars in Vercel → Project → Settings → Environment Variables:
    VITE_BASE_URL          https://ecom-backend-3sh8.onrender.com
    VITE_RAZORPAY_KEY_ID   rzp_test_xxx
[ ] Trigger redeploy after adding env vars
```

### Backend — Render

```
[ ] Push to GitHub
[ ] New Web Service → connect repo
    Build command:  npm install
    Start command:  node src/index.js  (or npm start)
[ ] Add env vars in Render → Environment:
    PORT                 3001
    DB_USER              <atlas-username>
    DB_PASSWORD          <atlas-password>
    DB_CLUSTER           <cluster>.mongodb.net
    JWT_SECRET           <random 32+ chars>
    SECRET_KEY           <legacy-aes-key>
    RAZORPAY_KEY_ID      rzp_test_xxx
    RAZORPAY_KEY_SECRET  xxx
    SENDGRID_API_KEY     SG.xxx
    SENDER_EMAIL         noreply@yourdomain.com
    ALLOWED_ORIGIN       https://e-com-frontend-project-eta.vercel.app
[ ] ALLOWED_ORIGIN must match frontend URL exactly — no trailing slash
```

### Database — MongoDB Atlas

```
[ ] Free cluster (M0 Sandbox)
[ ] Database Access → user with readWrite role
[ ] Network Access → 0.0.0.0/0 (allow all, or add Render IPs)
[ ] Connection string: mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority
[ ] npm run seed  (from backend project)
```

---

## 9. Environment Variables — Complete Reference

| Variable               | Where Used | Required | Notes                                          |
| ---------------------- | ---------- | :------: | ---------------------------------------------- |
| `VITE_BASE_URL`        | Frontend   |    ✅    | Backend API root, no trailing slash            |
| `VITE_RAZORPAY_KEY_ID` | Frontend   |    ✅    | Public key, baked into JS bundle at build time |
| `PORT`                 | Backend    |    —     | Default 3001                                   |
| `DB_USER`              | Backend    |    ✅    | MongoDB Atlas user                             |
| `DB_PASSWORD`          | Backend    |    ✅    | MongoDB Atlas password                         |
| `DB_CLUSTER`           | Backend    |    ✅    | Atlas cluster hostname                         |
| `JWT_SECRET`           | Backend    |    ✅    | Min 32 random chars — never share              |
| `SECRET_KEY`           | Backend    |  Legacy  | AES decrypt for old password migration         |
| `RAZORPAY_KEY_ID`      | Backend    |    ✅    | Same as frontend key                           |
| `RAZORPAY_KEY_SECRET`  | Backend    |    ✅    | HMAC signing — server-only, never in frontend  |
| `SENDGRID_API_KEY`     | Backend    |    ✅    | Starts with `SG.`                              |
| `SENDER_EMAIL`         | Backend    |    ✅    | Must be verified in SendGrid                   |
| `ALLOWED_ORIGIN`       | Backend    |    ✅    | Exact frontend URL for CORS                    |

---

## 10. Tech Stack Summary

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Vercel)            │  Backend (Render)        │
│───────────────────────────────┼──────────────────────────│
│  React 18                     │  Node.js 18              │
│  Vite (build tool)            │  Express.js              │
│  React Router v6              │  Mongoose (ODM)          │
│  Axios (HTTP client)          │  MongoDB Atlas           │
│  React Context (Auth + Cart)  │  JWT + bcrypt            │
│  Vitest + RTL (187 tests)     │  Razorpay SDK            │
│  jsPDF (receipt download)     │  Nodemailer + SendGrid   │
│  react-icons                  │  helmet (security hdrs)  │
│                               │  xss (sanitisation)      │
│                               │  express-rate-limit      │
├─────────────────────────────────────────────────────────┤
│  External Services                                       │
│  Razorpay (payments)  ·  SendGrid (email)                │
│  MongoDB Atlas (database)  ·  fakestoreapi.com (cats)    │
└─────────────────────────────────────────────────────────┘
```
