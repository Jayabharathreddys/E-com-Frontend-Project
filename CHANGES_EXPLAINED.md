# JBE Commerce — What We Built and Why (Plain English Guide)

This document explains every concept and feature added to the project in simple terms,
with real-world examples, so anyone can understand — no coding experience needed.

---

## 1. Global Theming with CSS Variables

**Keyword:** CSS Custom Properties (Variables)

**What it means:**
Think of CSS variables like a paint palette for a house. Instead of writing "blue" in 100 
different places and then changing each one manually when you want to switch to navy, you 
define the colour once — `--color-primary: #2320cc` — and all 100 places update automatically.

**File changed:** `src/index.css`

**Example:**
```css
/* Define once at the top */
:root {
  --color-primary: #2320cc;   /* brand blue */
  --color-danger:  #c0392b;   /* error red */
}

/* Use everywhere */
button { background: var(--color-primary); }
.error  { color:      var(--color-danger); }
```

**Why it matters:** Want to change the whole app's colour? Change one line. Done.

---

## 2. Pagination — Active State and Arrows

**Keyword:** Active Page Highlight, Accessibility (aria-*)

**What it means:**
Before, pagination buttons all looked the same. Now the current page button turns blue 
(visually highlighted), and there are Previous/Next arrow buttons. It also has 
screen-reader labels so blind users know which page they're on.

**File changed:** `src/components/pagination/Pagination.jsx` + `pagination.css`

**Real-world analogy:**
Like a book index where the current chapter is underlined. The arrows are like "< Back" 
and "Next >" buttons on any website.

**Edge cases handled:**
- If there's only 1 page, pagination is hidden entirely (no point showing 1 button)
- Previous arrow is disabled on page 1
- Next arrow is disabled on the last page
- Invalid page numbers (like "abc") are ignored

---

## 3. Product Card — Star Rating Display

**Keyword:** Average Rating, Conditional Rendering

**What it means:**
Products now show ★★★★☆ style star ratings if the backend has calculated an average 
rating for that product. If no ratings exist yet, nothing is shown.

**File changed:** `src/components/product/Product.jsx`

**Real-world analogy:**
Like Amazon's 4.3 ★ rating shown under a product title.

**Edge cases handled:**
- No rating = no stars shown (no broken display)
- Rating of 0 = treated as "no rating" (avoids showing ☆☆☆☆☆ on new items)
- Broken product image = falls back to a placeholder image automatically

---

## 4. Product Listing — Empty State and Error State

**Keyword:** Empty State, Error Handling, User Feedback

**What it means:**
Before, if no products were found (e.g. wrong category filter), the page just showed 
nothing — confusing! Now it shows a friendly message: "No products found in Electronics."
And if the API fails entirely, it shows "Failed to load products. Please try again later."

**File changed:** `src/pages/productListing/ProductListing.jsx`

**Real-world analogy:**
Like Google showing "No results for 'xyz'" instead of a blank page.

---

## 5. Signup Form — Full Validation

**Keyword:** Client-side Validation, Field-level Errors

**What it means:**
Before, you could submit the signup form with an empty name and nothing helpful happened. 
Now, each field is checked before sending to the server:
- Name can't be blank
- Email must look like an email (has @ and .)
- Password must be at least 6 characters
- Confirm Password must match Password

Errors appear right below each field as you fix them, not all at once at the top.

**Real-world analogy:**
Like filling in a job application form online — it highlights the box in red and 
tells you "Email is invalid" right there, before you submit.

---

## 6. Login Form — Validation + Redirect to Original Page

**Keyword:** Form Validation, Protected Route Redirect, React Router state

**What it means:**
- Same field validation as signup
- If you tried to visit /cart without being logged in, after login you're taken 
  directly back to /cart (not dumped on the home page)

**Real-world analogy:**
Like when you click "Add to Wishlist" on a shopping site, get redirected to login, 
then after login you end up back looking at the same product you wanted to wishlist.

---

## 7. Protected Routes — RequireAuth

**Keyword:** Route Guard, Authentication Check

**What it means:**
The /cart page is protected. If you're not logged in and try to visit /cart directly 
in the browser URL bar, you're automatically sent to /login instead of seeing a blank 
page or error.

**Real-world analogy:**
Like a hotel room door. You need your key card. Without it, you can't enter — you're 
directed back to reception.

---

## 8. Auth Persistence via SessionStorage

**Keyword:** SessionStorage, Persistent Login, State Hydration

**What it means:**
When you log in and then press F5 (refresh), you stay logged in. Before this fix, 
refreshing the page would forget who you are.

**How it works:**
When login succeeds, your user info is saved in the browser's sessionStorage (a small 
local memory that survives page refresh but clears when you close the tab).

**Real-world analogy:**
Like a theme park wristband — it stays on your wrist when you go on a ride (page refresh), 
but when you leave the park (close the tab) it's removed.

---

## 9. Navbar — Login/Logout Button

**Keyword:** Conditional Rendering, Context Consumer

**What it means:**
The top navigation bar now shows a "Login" button when you're not logged in, and a 
"Logout" button when you are. Clicking Logout clears your session and sends you to /login.

---

## 10. Custom 404 Not Found Page

**Keyword:** Catch-all Route, 404 Error Page

**What it means:**
If someone types a URL that doesn't exist (like /banana), instead of a white screen, 
they see a styled "404 — Page Not Found" page with a "Go Home" button.

**Real-world analogy:**
Every website has these. Google's says "404. That's an error. The requested URL was not found."

---

## 11. Custom 401 Unauthorized Page

**Keyword:** HTTP 401, Access Denied, Error Page

**What it means:**
A dedicated page shown when a user tries to access something they don't have 
permission for. Shows a "Sign In" button and a "Go Home" button.

---

## 12. Reviews API — GET All Reviews with Pagination

**Keyword:** REST API, Mongoose .find(), Pagination (page + limit), .populate()

**What it means:**
The backend can now return all reviews for a product, page by page (10 per page 
by default). Each review also includes the reviewer's name (not just their ID).

**Example request:**
```
GET /api/review/abc123?page=2&limit=5
```
Returns reviews 6–10 for product abc123, plus total count and total pages.

**Edge cases handled:**
- Page "abc" → treated as page 1
- Limit 9999 → capped at 50 (to prevent overloading the server)
- Reviews sorted newest-first

---

## 13. Reviews API — POST (Create Review) Validation

**Keyword:** Input Validation, HTTP 400 Bad Request

**What it means:**
Before, you could submit a review with no text and no rating. Now the server checks:
- `review` text is required
- `rating` must be between 1 and 5
- Returns HTTP 400 with a clear error message if invalid

---

## 14. Rate Limiting on Auth Routes

**Keyword:** express-rate-limit, Brute-force Protection, HTTP 429

**What it means:**
The login endpoint is now rate-limited: maximum 2 attempts per IP per 2 minutes. 
If someone tries to guess passwords by sending thousands of requests, they'll be 
blocked with HTTP 429 "Too Many Requests".

**Real-world analogy:**
Like an ATM that locks your card after 3 wrong PIN attempts.

**Routes protected:**
- POST /api/auth/login (new)
- PATCH /api/auth/forgetpassword (existing)

---

## 15. Logout via POST (not just GET)

**Keyword:** HTTP Methods, Cookie Clearing

**What it means:**
The Navbar calls `POST /api/auth/logout` to log out (using fetch/axios). Before, 
only `GET /logout` existed. Now both work. Logout clears the JWT cookie with maxAge=0.

---

## 16. BookingRouter — Fixed and Cleaned

**Keyword:** Razorpay Orders API, Lazy Initialization

**What it means:**
The payment booking code was truncated and broken. It now:
- Creates a Razorpay order
- Saves booking to the database
- Returns the order ID to the frontend for the checkout modal
- Properly verifies webhook signatures for payment confirmation

---

## 17. Curl Test Script

**Keyword:** Shell Script, curl, Integration Testing, HTTP Status Codes

**What it means:**
A bash script (`api_tests.sh`) that automatically tests every API endpoint using 
`curl` (a command-line HTTP tool). It checks:
- Happy paths (valid input → expected success status)
- Error paths (bad input → expected error status)
- Edge cases (empty body, duplicate email, invalid IDs)
- Response body content (does it contain "success"? "failure"?)

**How to run:**
```bash
# Against local server:
./api_tests.sh

# Against production:
./api_tests.sh https://ecom-backend-3sh8.onrender.com
```

**Real-world analogy:**
Like a quality inspector who runs through a checklist of every feature before 
a product ships to stores.

---

## 18. Backend Tests (Jest + Supertest)

**Keyword:** Unit Tests, Integration Tests, Jest, Supertest

**What it means:**
Automated code tests that run against the real database to confirm every API 
endpoint works correctly. They run with `npm test`.

**Tests include:**
- Signup: missing password, mismatch, success, duplicate email
- Login: wrong creds, missing email, success
- Reviews: pagination, defaults, limit cap
- Logout: POST and GET both return 200 and clear cookie

---

## 19. Frontend Tests (Vitest + React Testing Library)

**Keyword:** Component Tests, Mocking, Vitest, @testing-library/react

**What it means:**
Tests that render React components in a virtual browser and check they behave correctly, 
without needing a real server running.

**56 tests total across 11 test files:**

| File | What's tested |
|------|--------------|
| Login.test.jsx | Field errors, server error, redirect after login |
| Signup.test.jsx | All 4 field validations, mismatch, duplicate, redirect |
| Pagination.test.jsx | Active state, arrows, edge cases (0 pages, 1 page) |
| Product.test.jsx | Title, price, rating stars, no-rating case, image fallback |
| ErrorPages.test.jsx | 404 and 401 pages — content and links |
| RequireAuth.test.jsx | Redirect when logged out, allow when logged in |
| CartItems.test.jsx | Empty cart, items, total, Razorpay flow |
| CartProvider.test.jsx | Add/remove/quantity cart operations |
| CartItem.test.jsx | Single cart row rendering |
| AddToCart.test.jsx | Button + quantity controls |
| useFetchData.test.jsx | Loading state, success, error fallback |

---

## Glossary of Keywords

| Keyword | Plain English |
|---------|--------------|
| **CSS Variables** | Reusable colour/size tokens defined once, used everywhere |
| **Pagination** | Splitting a long list into pages (like Google search results) |
| **Active State** | Visual highlight showing which item is currently selected |
| **Aria attributes** | HTML labels that help screen readers describe UI to blind users |
| **Empty State** | A friendly message shown when a list has no items |
| **Client-side Validation** | Checking form inputs in the browser before sending to server |
| **Field-level Errors** | Error message shown right below the specific field that's wrong |
| **Protected Route** | A page that requires login to access |
| **SessionStorage** | Browser memory that survives refresh but clears on tab close |
| **Rate Limiting** | Blocking too many requests from the same IP in a short time |
| **JWT (httpOnly cookie)** | A secure login token stored in a cookie JS cannot read |
| **Pagination (API)** | Server returns a chunk of results at a time (?page=1&limit=10) |
| **populate()** | MongoDB equivalent of a SQL JOIN — fills in related data |
| **HTTP 400** | Bad Request — you sent invalid data |
| **HTTP 401** | Unauthorized — you need to log in |
| **HTTP 404** | Not Found — the resource doesn't exist |
| **HTTP 429** | Too Many Requests — you've been rate-limited |
| **curl** | A command-line tool to send HTTP requests (like Postman but in terminal) |
| **Supertest** | A Node.js library for testing Express API endpoints |
| **Vitest** | A fast test runner for Vite/React projects |
