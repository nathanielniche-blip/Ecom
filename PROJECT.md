# E-Commerce Backend Project

## 1. Project Overview

This project is a security-focused e-commerce backend built with:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT authentication
* bcryptjs password hashing
* Zod request validation
* Helmet
* CORS
* express-rate-limit
* Razorpay integration preparation

The backend is being developed with an **OWASP-oriented security mindset**. The goal is to protect against common web/API vulnerabilities rather than claiming the application is completely vulnerability-free.

---

# 2. Development Environment

* OS: Windows
* Editor: VS Code
* MongoDB Server: 9.0.2
* MongoDB Shell: Mongosh 2.13.0
* MongoDB replica set: `rs0`
* Database: `ecommerce`
* API port: `5000`

MongoDB connection:

```text
mongodb://127.0.0.1:27017/ecommerce?replicaSet=rs0
```

MongoDB is configured as a single-member replica set so MongoDB transactions can be used.

---

# 3. Installed Packages

## Runtime dependencies

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install helmet express-rate-limit
npm install zod
npm install razorpay
```

## Development dependency

```bash
npm install --save-dev nodemon
```

## Package scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

# 4. Environment Variables

Current `.env` structure:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/ecommerce?replicaSet=rs0

JWT_SECRET=replace_this_with_a_long_random_secret
JWT_ISSUER=ecommerce-api
JWT_AUDIENCE=ecommerce-client

CLIENT_URL=http://localhost:3000

RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

Actual secrets must remain in the local `.env` file.

They must never be:

* committed to Git
* placed in frontend code
* returned through an API
* included in screenshots
* shared publicly

`.gitignore`:

```text
node_modules/
.env
```

---

# 5. Project Structure

```text
ecommerce-backend/
│
├── src/
│   │
│   ├── app.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── addressController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── productController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── validateMiddleware.js
│   │
│   ├── models/
│   │   ├── Address.js
│   │   ├── Cart.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Product.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── addressRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── productRoutes.js
│   │
│   ├── services/
│   │   └── razorpayService.js
│   │
│   └── validators/
│       ├── addressValidator.js
│       ├── authValidator.js
│       ├── cartValidator.js
│       ├── orderValidator.js
│       └── paymentValidator.js
│
├── .env
├── .gitignore
├── package.json
└── server.js
```

---

# 6. Server

`server.js`:

* Loads `.env`
* Connects to MongoDB
* Starts Express
* Uses port `5000` by default

Startup:

```text
MongoDB connected successfully
Server running on http://localhost:5000
```

The server waits for MongoDB connection before listening.

---

# 7. Express Application

Main file:

```text
src/app.js
```

Implemented middleware:

## Helmet

```javascript
app.use(helmet());
```

Adds common security-related HTTP headers.

## CORS

Current configuration:

```javascript
cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
})
```

## JSON body limit

```javascript
app.use(express.json({ limit: "10kb" }));
```

Limits incoming JSON payload size.

## General rate limiting

```javascript
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false
});
```

Applied to:

```text
/api/*
```

---

# 8. API Routes

Current route groups:

```text
/api/auth
/api/categories
/api/products
/api/cart
/api/orders
/api/addresses
/api/payments
```

---

# 9. Authentication

## User model

File:

```text
src/models/User.js
```

Fields:

```text
name
email
password
role
createdAt
updatedAt
```

Roles:

```text
user
admin
```

Password:

* minimum 8 characters
* hashed with bcrypt
* `select: false`
* never returned in normal user queries

---

# 10. Registration

Registration performs:

1. Request validation
2. Email uniqueness checking
3. Password hashing
4. User creation
5. Safe response

The password is never returned to the client.

---

# 11. Login

Login performs:

1. Request validation
2. User lookup
3. Explicit password selection
4. bcrypt comparison
5. JWT generation
6. Safe user response

Password is loaded only when required:

```javascript
.select("+password")
```

JWT uses:

```text
JWT_SECRET
JWT_ISSUER
JWT_AUDIENCE
```

Access tokens currently have a short lifetime of approximately 15 minutes.

---

# 12. JWT Authentication Middleware

File:

```text
src/middleware/authMiddleware.js
```

The `protect` middleware:

1. Requires `Authorization`
2. Requires:

```text
Bearer <token>
```

3. Verifies JWT signature
4. Verifies issuer
5. Verifies audience
6. Requires `userId`
7. Loads the current user from MongoDB
8. Stores the user in:

```javascript
req.user
```

The role is loaded from the database rather than trusted from the JWT.

---

# 13. Role Authorization

The `authorize()` middleware supports:

```javascript
authorize("admin")
```

Admin permissions are checked against the current database user.

This prevents an old JWT from permanently granting admin privileges after a user's role changes.

---

# 14. Zod Validation

File:

```text
src/middleware/validateMiddleware.js
```

Validation covers:

```text
body
params
query
```

Invalid requests return:

```text
HTTP 400
```

with structured validation errors.

Strict schemas prevent unexpected fields from reaching business logic.

For example, clients cannot supply server-controlled order values such as:

```text
priceInPaise
totalAmountInPaise
user
```

---

# 15. Categories

Categories support CRUD operations.

Administrative operations require admin authorization.

Security protections include:

* Authentication
* Admin authorization
* Zod validation
* Object ID validation
* Server-side database operations

Test category:

```text
Consumer Electronics
slug: electronics
```

---

# 16. Products

Products support CRUD operations.

Important fields:

```text
name
description
sku
category
priceInPaise
stock
image
```

## Currency

Prices are stored as integer paise.

Example:

```text
₹1,599.00
=
159900 paise
```

This avoids floating-point currency problems.

## Product authorization

Product management operations are admin-only.

Clients cannot control the price used when an order is created.

The server reads the current product price from MongoDB.

---

# 17. Cart

Cart data belongs to the authenticated user.

The user is determined from:

```javascript
req.user._id
```

rather than from a client-supplied user ID.

This protects against cart IDOR attacks.

The server resolves product information and validates:

* product existence
* current price
* stock
* quantity
* ownership

---

# 18. Orders

Orders use strong server-side controls.

## Order creation

Checkout uses a MongoDB transaction.

Process:

```text
Authenticate user
      ↓
Load user's cart
      ↓
Validate address ownership
      ↓
Load products
      ↓
Read current prices
      ↓
Calculate total
      ↓
Check stock
      ↓
Atomically decrement stock
      ↓
Create order
      ↓
Snapshot shipping address
      ↓
Clear cart
      ↓
Commit transaction
```

The client cannot determine:

```text
user
price
total amount
stock
```

---

# 19. Inventory Protection

Stock decrement uses an atomic condition equivalent to:

```text
stock >= requested quantity
```

This prevents negative inventory.

MongoDB transactions are used for checkout-related multi-document operations.

This provides a foundation for protection against concurrent purchases.

---

# 20. Order IDOR Protection

User order queries are scoped to:

```text
order ID
+
authenticated user ID
```

Conceptually:

```javascript
Order.findOne({
    _id: req.params.id,
    user: req.user._id
})
```

Changing an order ID therefore does not allow a user to retrieve another user's order.

---

# 21. Shipping Address Snapshot

When an order is created, the shipping address is copied into the order.

If the user later changes their saved address, the historical order address remains unchanged.

This preserves historical order integrity.

---

# 22. Order State Machine

Current allowed transitions:

```javascript
const allowedTransitions = {
    pending: ["confirmed"],
    confirmed: ["processing"],
    processing: ["shipped"],
    shipped: ["delivered"]
};
```

Normal lifecycle:

```text
pending
   ↓
confirmed
   ↓
processing
   ↓
shipped
   ↓
delivered
```

Invalid transitions are rejected.

Example:

```text
delivered → confirmed
```

is rejected.

Order status management is admin-only.

---

# 23. Order Cancellation

Cancellation uses a MongoDB transaction.

The system:

1. Checks order ownership/authorization
2. Checks current order status
3. Restores stock
4. Changes cancellation state
5. Commits the transaction

Double cancellation is prevented.

---

# 24. Addresses

Addresses belong to users.

Address access uses:

```text
address ID
+
req.user._id
```

This prevents IDOR attacks.

Example development address:

```text
Full name: Test User
City: Nagercoil
State: Tamil Nadu
Postal code: 629251
Country: India
```

---

# 25. Payment Model

File:

```text
src/models/Payment.js
```

Fields:

```text
order
user
amountInPaise
currency
provider
providerPaymentId
providerOrderId
status
failureReason
createdAt
updatedAt
```

Payment statuses:

```text
created
pending
paid
failed
refunded
```

Supported providers:

```text
razorpay
stripe
manual
```

Supported currency:

```text
INR
```

---

# 26. Payment State Machine

Current transitions:

```javascript
const allowedPaymentTransitions = {
    created: ["pending", "failed"],
    pending: ["paid", "failed"],
    paid: ["refunded"],
    failed: [],
    refunded: []
};
```

Valid:

```text
created → pending
pending → paid
paid → refunded
created → failed
pending → failed
```

Invalid:

```text
paid → failed
refunded → paid
failed → paid
refunded → pending
```

Payment status is controlled by trusted server-side logic.

---

# 27. Payment/Order Synchronization

Payment state changes use a MongoDB transaction.

Internal helpers:

```javascript
markPaymentPending()
markPaymentPaid()
markPaymentFailed()
markPaymentRefunded()
```

The transaction updates:

```text
Payment.status
Order.paymentStatus
```

together.

The intention is that these two states never diverge during a valid transition.

---

# 28. Payment Consistency Protection

Before changing payment state, the backend checks:

```javascript
if (payment.status !== order.paymentStatus) {
    throw new Error(
        `Payment and order payment status are inconsistent: payment=${payment.status}, order=${order.paymentStatus}`
    );
}
```

This catches pre-existing inconsistent payment/order records instead of silently making them worse.

---

# 29. Duplicate Provider Payment Protection

A unique partial database index exists for:

```text
provider
providerPaymentId
```

Conceptually:

```javascript
paymentSchema.index(
    { provider: 1, providerPaymentId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            providerPaymentId: {
                $exists: true,
                $type: "string"
            }
        }
    }
);
```

This prevents the same provider payment ID from being stored against multiple payment records.

The partial index allows payments that don't yet have a provider payment ID.

---

# 30. Payment API

Current endpoints:

```text
POST /api/payments
GET  /api/payments/:id
```

Authentication is required.

Payment creation accepts only:

```json
{
    "orderId": "..."
}
```

The server determines:

```text
user
amount
currency
provider
status
```

The client cannot choose these.

---

# 31. Payment Ownership

Payment retrieval uses the authenticated user:

```javascript
Payment.findOne({
    _id: req.params.id,
    user: req.user._id
})
```

This protects against payment IDOR attacks.

---

# 32. Razorpay Preparation

Razorpay package has been installed:

```bash
npm install razorpay
```

Service:

```text
src/services/razorpayService.js
```

The service is designed to initialize Razorpay with:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Razorpay order amount is obtained from:

```text
Order.totalAmountInPaise
```

not from the client.

Intended flow:

```text
Client
   ↓
POST /api/payments
   ↓
Authenticate
   ↓
Find user's order
   ↓
Read trusted order amount
   ↓
Create Razorpay order
   ↓
Store providerOrderId
   ↓
Return Razorpay order information
```

Still pending:

```text
Razorpay end-to-end testing
Razorpay checkout
Payment signature verification
Webhook signature verification
Webhook idempotency
Provider event processing
Refund integration
```

The Razorpay credentials are not documented here.

---

# 33. Test Data

Development/test records included:

```text
User A:
6ac35fab3571917691d1cc37

Category:
6ac37054062a25e997649063

Product:
6ac382cdefe3d41c3ab01c71

Address:
6ac4cf94796731ba8ba9d9ba

First test order:
6ac48862e6bfcd0ae247d4d4

Second test order:
6ac4c93634b36dd6c36b9d60

Payment test record:
6ac5db4193419253150181d7
```

These are development records and should not be treated as production data.

---

# 34. Payment Testing Performed

The payment state machine was tested with the development payment.

Tested:

```text
created → pending       PASS
pending → paid          PASS
paid → failed           REJECTED
paid → refunded         PASS
```

A temporary test-status endpoint was used during development and subsequently removed.

The payment was left in:

```text
refunded
```

state.

The associated test order was repaired so:

```text
Payment.status      = refunded
Order.paymentStatus = refunded
```

This was necessary because the original order had been created before the transactional payment synchronization was implemented.

---

# 35. Temporary Development Endpoint

A temporary endpoint was created:

```text
/api/payments/:id/test-status
```

It was used only for payment state-machine testing.

It has been removed.

The associated temporary validator and controller functionality were also removed.

The production design uses internal server-side payment helpers instead.

---

# 36. Security Controls Already Implemented

Current protections include:

```text
✓ bcrypt password hashing
✓ JWT authentication
✓ JWT issuer validation
✓ JWT audience validation
✓ Short-lived access tokens
✓ Database-backed user lookup
✓ Role-based authorization
✓ Admin-only management operations
✓ Zod validation
✓ Strict request schemas
✓ Object ID validation
✓ Helmet
✓ CORS restrictions
✓ JSON body-size limit
✓ Rate limiting
✓ Server-side price calculation
✓ Integer paise currency representation
✓ Server-side stock checking
✓ Atomic stock decrement
✓ MongoDB transactions
✓ Cart ownership protection
✓ Order ownership protection
✓ Address ownership protection
✓ Payment ownership protection
✓ Shipping address snapshots
✓ Order state machine
✓ Payment state machine
✓ Payment/order transaction synchronization
✓ Provider payment ID uniqueness
✓ Client cannot control payment amount
✓ Client cannot control order ownership
✓ Client cannot control payment status
✓ Password excluded from normal user queries
```

---

# 37. Security Testing Already Performed

## Authentication

Tested:

* Registration
* Login
* Invalid token handling
* Expired token handling
* Current-user lookup
* Admin role checking

## Validation

Tested rejection of unexpected server-controlled fields such as:

```text
priceInPaise
totalAmountInPaise
user
```

## Orders

Tested:

* Order ownership
* Invalid order IDs
* Invalid order transitions
* Order cancellation
* Stock restoration
* Duplicate cancellation protection
* Shipping-address snapshots

## Addresses

Tested:

* Address ownership
* Address lookup/update behavior

## Payments

Tested:

* Payment creation
* Server-derived payment amount
* Duplicate payment behavior
* Payment state transitions
* Invalid payment transitions
* Payment/order synchronization
* Refunded state
* Provider payment ID uniqueness design

---

# 38. Remaining Authentication Work

The current JWT implementation uses short-lived access tokens.

Recommended next additions:

```text
Refresh tokens
Logout/token revocation
Password change
Forgot password
Password reset
Authentication-specific rate limiting
```

Recommended architecture:

```text
Login
  ↓
Short-lived access token
  +
Longer-lived refresh token
  ↓
Access token expires
  ↓
Refresh token used
  ↓
New access token
```

Refresh tokens should be securely revocable.

---

# 39. Remaining Authorization Work

Perform a complete endpoint-by-endpoint IDOR audit.

Review:

```text
Users
Categories
Products
Cart
Orders
Addresses
Payments
Admin endpoints
```

For every protected resource, verify that the authenticated user is actually authorized to access that specific resource.

---

# 40. Remaining API Hardening

Recommended:

```text
Central error-handling middleware
More specific authentication rate limits
Payment-specific rate limits
Production CORS configuration
Secure production configuration
Structured security logging
No stack traces in production responses
No sensitive information in error messages
Dependency vulnerability scanning
```

---

# 41. Inventory Testing

Concurrency testing is still required.

Example:

```text
Stock = 1

User A ──────┐
             ├── Purchase
User B ──────┘
```

The system must guarantee that only one successful purchase can consume the final unit.

The current atomic stock update and MongoDB transaction provide a strong foundation, but automated race-condition tests should still be added.

---

# 42. Automated Testing

A complete automated API security suite should eventually test:

```text
Authentication
Authorization
IDOR
Validation
Rate limiting
Cart
Inventory
Orders
Payments
Admin operations
Malformed input
Concurrency
```

Negative tests are especially important.

Examples:

```text
Invalid JWT
Expired JWT
Missing JWT
Wrong user
Wrong order ID
Wrong address ID
Wrong payment ID
Invalid MongoDB ObjectId
Extra JSON fields
Negative quantity
Zero quantity
Invalid price
Invalid order transition
Invalid payment transition
Insufficient stock
Duplicate payment
```

---

# 43. Recommended Development Roadmap

```text
1. Refresh-token authentication
        ↓
2. Logout/token revocation
        ↓
3. Password change
        ↓
4. Forgot/reset password
        ↓
5. Complete IDOR audit
        ↓
6. Complete admin security audit
        ↓
7. Cart/order edge cases
        ↓
8. Inventory concurrency testing
        ↓
9. Central error handling
        ↓
10. API security hardening
        ↓
11. Automated security tests
        ↓
12. Razorpay integration
        ↓
13. Razorpay signature verification
        ↓
14. Razorpay webhooks
        ↓
15. Webhook idempotency
        ↓
16. Refund integration
        ↓
17. Production deployment hardening
```

---

# 44. Core Security Principles

## Never trust the client

The client must never decide:

```text
user identity
user role
product price
order total
payment amount
payment status
stock availability
```

## Validate at the boundary

Requests are validated before reaching business logic.

## Authorize every protected resource

Ownership must be checked against the authenticated user.

## Use transactions for multi-document state changes

Checkout, cancellation, and payment/order synchronization use MongoDB transactions where appropriate.

## Store money as integers

Use paise rather than floating-point rupees.

## Use state machines

Orders and payments cannot arbitrarily jump between states.

## Keep secrets server-side

JWT and Razorpay secrets remain in `.env`.

## Use database constraints as an additional security layer

Application validation should be reinforced with database indexes and constraints where appropriate.

---

# 45. Current Project Status

## Completed

```text
[✓] Express server
[✓] MongoDB connection
[✓] MongoDB replica set
[✓] Environment configuration
[✓] User model
[✓] Registration
[✓] Login
[✓] bcrypt password hashing
[✓] JWT authentication
[✓] Role-based authorization
[✓] Zod validation
[✓] Helmet
[✓] CORS
[✓] Rate limiting
[✓] Categories
[✓] Products
[✓] Cart
[✓] Orders
[✓] Atomic inventory handling
[✓] MongoDB checkout transactions
[✓] Address management
[✓] Order state machine
[✓] Order cancellation
[✓] Payment model
[✓] Payment state machine
[✓] Payment/order transaction synchronization
[✓] Payment ownership protection
[✓] Provider payment ID protection
[✓] Razorpay package installed
[✓] Razorpay service structure
[✓] Razorpay order-creation structure
```

## Pending

```text
[ ] Refresh tokens
[ ] Logout/token revocation
[ ] Password change
[ ] Password reset
[ ] Full IDOR audit
[ ] Full admin security audit
[ ] Central error handler
[ ] Authentication/payment-specific rate limiting
[ ] Inventory concurrency test suite
[ ] Automated API security tests
[ ] Razorpay end-to-end testing
[ ] Razorpay signature verification
[ ] Razorpay webhooks
[ ] Webhook idempotency
[ ] Refund provider integration
[ ] Production deployment hardening
```

---

# 46. Important Security Disclaimer

The project follows OWASP-oriented security practices, but no application should be described as completely "OWASP-free" or guaranteed vulnerability-free.

Production security requires ongoing:

* Code review
* Dependency updates
* Automated testing
* Security testing
* Penetration testing
* Logging and monitoring
* Secret management
* Secure deployment
* Vulnerability assessment

The current project provides a strong security-focused backend foundation, but the remaining work should be completed before production deployment.
