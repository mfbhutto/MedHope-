# MedHope - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Languages & Frameworks](#languages--frameworks)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Architecture](#api-architecture)
7. [Key Features & Workflows](#key-features--workflows)
8. [Environment Variables](#environment-variables)
9. [Deployment](#deployment)

---

## Project Overview

**MedHope** is a comprehensive medical assistance platform that connects needy persons (patients) with donors and volunteers. The platform facilitates case submissions, volunteer verification, admin review, and donation processing for medical cases in Karachi, Pakistan.

### Core Functionality
- **Case Management**: Needy persons can submit medical cases (medicine/test requests)
- **Volunteer Verification**: Volunteers verify case authenticity before admin review
- **Admin Review**: Superadmins and admins review and approve/reject cases
- **Donations**: Donors can contribute to approved cases via multiple payment methods
- **Notifications**: Real-time notifications for all stakeholders
- **Analytics**: Dashboard with statistics and charts

---

## Tech Stack

### Frontend
- **Next.js 14.0.4** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.3.3** - Type-safe JavaScript
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **Framer Motion 10.16.16** - Animation library
- **React Hook Form 7.49.2** - Form management
- **Axios 1.6.2** - HTTP client
- **React Hot Toast 2.4.1** - Toast notifications
- **Lucide React 0.553.0** - Icon library
- **Recharts 2.15.4** - Chart library
- **Lottie React 2.4.1** - Animation library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose 8.19.3** - MongoDB ODM
- **Node.js** - Runtime environment

### Third-Party Services
- **Cloudinary 2.8.0** - Image/file storage and CDN
- **Stripe** - Payment processing (via @stripe/stripe-js, @stripe/react-stripe-js)
- **Nodemailer 7.0.12** - Email service
- **bcryptjs 3.0.3** - Password hashing

### Development Tools
- **TypeScript** - Type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## Languages & Frameworks

### Primary Languages
- **TypeScript** - Main language for type safety
- **JavaScript** - Used in configuration files
- **JSON** - Configuration and data files
- **CSS** - Styling (via Tailwind)

### Framework & Runtime
- **Next.js** - Full-stack React framework
- **Node.js** - Server-side runtime
- **React** - UI framework

---

## Project Structure

```
MedHope/
├── app/                          # Next.js App Router directory
│   ├── about/                    # About page
│   ├── admin/                    # Admin pages
│   │   ├── create-admin/         # Create admin page
│   │   ├── reset-password/       # Reset password page
│   │   └── update-priorities/   # Update priorities page
│   ├── api/                      # API routes (Backend)
│   │   ├── admin/                # Admin API endpoints
│   │   │   ├── cases/            # Case management
│   │   │   ├── create/           # Create admin
│   │   │   ├── donors/           # Donor management
│   │   │   ├── pending-cases/    # Get pending cases
│   │   │   ├── reset-password/   # Reset password
│   │   │   ├── test-login/       # Test login
│   │   │   └── volunteers/       # Volunteer management
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── admin-login/      # Admin login
│   │   │   ├── login/            # User login
│   │   │   └── register/         # Registration (accepter/donor/volunteer)
│   │   ├── cases/                # Case endpoints
│   │   │   ├── [id]/             # Case by ID
│   │   │   ├── approve/          # Approve case
│   │   │   ├── my-cases/         # User's cases
│   │   │   ├── submit/           # Submit new case
│   │   │   └── update-priorities/# Update priorities
│   │   ├── contact/              # Contact form
│   │   ├── donations/            # Donation endpoints
│   │   ├── needypersons/         # Needy person endpoints
│   │   ├── notifications/         # Notification endpoints
│   │   ├── stats/                # Statistics endpoints
│   │   ├── users/                # User endpoints
│   │   └── volunteer/            # Volunteer endpoints
│   ├── auth/                     # Authentication pages
│   │   ├── admin-login/          # Admin login page
│   │   ├── login/                # User login page
│   │   └── register/             # Registration pages
│   │       ├── accepter/          # Needy person registration
│   │       ├── donor/             # Donor registration
│   │       └── volunteer/         # Volunteer registration
│   ├── contact/                  # Contact page
│   ├── medhope/                  # Main application pages
│   │   ├── cases/                # Case listing/details
│   │   ├── components/           # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── CaseSubmissionForm.tsx
│   │   │   ├── Collaborators.tsx
│   │   │   ├── DonationModal.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Loader.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NewCaseForm.tsx
│   │   │   ├── NotificationIcon.tsx
│   │   │   ├── PatientCases.tsx
│   │   │   ├── SectionHeading.tsx
│   │   │   ├── Services.tsx
│   │   │   └── WhyChooseUs.tsx
│   │   ├── pages/                # MedHope pages
│   │   │   ├── dashboard/         # User dashboard
│   │   │   ├── needypersons/      # Needy person details
│   │   │   └── [other pages]
│   │   └── layout.tsx            # MedHope layout
│   ├── privacy-policy/           # Privacy policy page
│   ├── services/                 # Services page
│   ├── superadmin/               # Superadmin pages
│   │   ├── components/           # Admin components
│   │   └── pages/                # Admin pages
│   │       ├── case-details/     # Case details page
│   │       └── dashboard/        # Admin dashboard
│   ├── terms-of-service/         # Terms of service page
│   ├── volunteer/                # Volunteer pages
│   │   └── dashboard/            # Volunteer dashboard
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── lib/                          # Shared library code
│   ├── api.ts                    # API client configuration
│   ├── auth.ts                   # Authentication utilities
│   ├── cloudinary.ts             # Cloudinary configuration
│   ├── controllers/              # Business logic controllers
│   │   ├── admin.ts              # Admin controller
│   │   ├── donor.ts              # Donor controller
│   │   ├── needyPerson.ts        # Needy person controller
│   │   ├── notification.ts       # Notification controller
│   │   └── volunteer.ts          # Volunteer controller
│   ├── db.ts                     # Database connection
│   ├── dummyData.ts              # Dummy data generator
│   ├── email.ts                  # Email service
│   ├── karachiData.ts            # Karachi area data
│   └── models/                   # Database models
│       ├── admin.ts              # Admin interface
│       ├── adminSchema.ts        # Admin schema
│       ├── donation.ts           # Donation interface
│       ├── donationSchema.ts    # Donation schema
│       ├── donor.ts              # Donor interface
│       ├── donorSchema.ts        # Donor schema
│       ├── needyPerson.ts        # Needy person interface
│       ├── needyPersonSchema.ts  # Needy person schema
│       ├── notification.ts       # Notification interface
│       ├── notificationSchema.ts # Notification schema
│       ├── volunteer.ts          # Volunteer interface
│       └── volunteerSchema.ts   # Volunteer schema
│
├── public/                       # Static assets
│   ├── uploads/                  # Uploaded files
│   └── [images/logos]            # Images and logos
│
├── scripts/                      # Utility scripts
│   ├── create-admin.js          # Create admin script
│   ├── fix-admin-password.js    # Fix admin password
│   ├── list-admins.js            # List admins
│   ├── test-priority.js          # Test priority
│   └── update-priorities.js     # Update priorities
│
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
└── [documentation files]         # MD files for setup
```

---

## Database Schema

### Database: MongoDB
**Connection**: Mongoose ODM with connection pooling and reuse

### Collections & Models

#### 1. **NeedyPerson** (Cases)
**Collection**: `needypersons`

```typescript
{
  // Personal Information
  name: String (required, trimmed)
  email: String (required, unique, lowercase, indexed)
  originalEmail: String (lowercase, indexed) // For case submissions
  cnic: String (required, unique, indexed)
  district: String (required, enum: ['Central', 'East', 'South', 'West', 'Malir', 'Korangi'])
  area: String (required, trimmed)
  manualArea: String (trimmed) // Custom area input
  address: String (required, trimmed)
  phone: String (required, trimmed)
  password: String (required, minlength: 6, hashed)

  // Financial Information
  age: Number (required, min: 1, max: 120)
  maritalStatus: String (required, enum: ['single', 'married'])
  numberOfChildren: Number (default: 0, min: 0)
  firstChildAge: Number (min: 0)
  lastChildAge: Number (min: 0)
  salaryRange: String (required)
  houseOwnership: String (required, enum: ['own', 'rent'])
  rentAmount: Number (min: 0)
  houseSize: String (required)
  utilityBill: String // Cloudinary URL
  zakatEligible: Boolean (default: false)

  // Disease Information
  diseaseType: String (required, enum: ['chronic', 'other'])
  chronicDisease: String
  otherDisease: String
  manualDisease: String
  testNeeded: Boolean (default: false)
  selectedTests: [String] // Array of test names
  description: String (required, trimmed)
  hospitalName: String (required, trimmed)
  doctorName: String (required, trimmed)
  amountNeeded: Number (required, min: 1)
  document: String // Cloudinary URL (PNG, JPG, JPEG only)

  // System Fields
  role: String (default: 'accepter', enum: ['accepter'], immutable)
  priority: String (default: 'Medium', enum: ['High', 'Medium', 'Low'])
  status: String (default: 'pending', enum: ['pending', 'accepted', 'rejected'])
  caseNumber: String (required, unique, indexed) // Format: CASE-YYYY-#####
  isVerified: Boolean (default: false)
  isActive: Boolean (default: true)
  totalDonations: Number (default: 0, min: 0)

  // Volunteer Assignment
  volunteerId: ObjectId (ref: 'Volunteer', default: null)
  volunteerApprovalStatus: String (enum: ['pending', 'approved', 'rejected'], default: null)
  volunteerRejectionReasons: [String] (enum: ['Personal information issue', 'Financial information issue', 'Disease information issue'])

  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:
- `email` (unique)
- `cnic` (unique)
- `caseNumber` (unique)
- `originalEmail` (indexed)

**Pre-save Hooks**:
- Auto-assigns priority based on area
- Auto-generates case number (CASE-YYYY-#####)

---

#### 2. **Donor**
**Collection**: `donors`

```typescript
{
  name: String (required, trimmed)
  email: String (required, unique, lowercase, indexed)
  address: String (required, trimmed)
  phone: String (required, trimmed)
  password: String (required, minlength: 6, hashed)
  role: String (default: 'donor', enum: ['donor'], immutable)
  isVerified: Boolean (default: false)
  isActive: Boolean (default: true)
  totalDonations: Number (default: 0, min: 0) // Count of donations
  totalAmountDonated: Number (default: 0, min: 0) // Total amount
  casesHelped: Number (default: 0, min: 0) // Number of cases helped

  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:
- `email` (unique)

---

#### 3. **Volunteer**
**Collection**: `volunteers`

```typescript
{
  name: String (required, trimmed)
  email: String (required, unique, lowercase, indexed)
  address: String (required, trimmed)
  phone: String (required, trimmed)
  cnic: String (required, unique, indexed, format: 12345-1234567-1)
  cnicFront: String (trimmed) // Cloudinary URL
  cnicBack: String (trimmed) // Cloudinary URL
  password: String (required, minlength: 6, hashed)
  role: String (default: 'volunteer', enum: ['volunteer'], immutable)
  isVerified: Boolean (default: false)
  isActive: Boolean (default: true)
  casesVerified: Number (default: 0, min: 0) // Count of verified cases

  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:
- `email` (unique)
- `cnic` (unique)

**Validation**:
- CNIC format: `12345-1234567-1` (5 digits, dash, 7 digits, dash, 1 digit)

---

#### 4. **Admin**
**Collection**: `admins`

```typescript
{
  name: String (required, trimmed)
  email: String (required, unique, lowercase, indexed)
  password: String (required, minlength: 6, hashed with bcrypt)
  role: String (default: 'admin', enum: ['admin', 'superadmin'], immutable)
  isActive: Boolean (default: true)

  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:
- `email` (unique)

**Pre-save Hooks**:
- Password hashing with bcrypt (salt rounds: 10)
- Skips hashing if already hashed

---

#### 5. **Donation**
**Collection**: `donations`

```typescript
{
  donorId: String (required, indexed) // Donor email or ID
  caseId: String (required, indexed) // Case ID
  amount: Number (required, min: 1)
  paymentMethod: String (required, enum: ['stripe', 'jazzcash', 'easypaisa', 'card'])
  paymentId: String // Payment gateway transaction ID
  transactionId: String // Custom transaction ID
  isZakatDonation: Boolean (default: false)
  status: String (default: 'completed', enum: ['pending', 'completed', 'failed'])

  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:
- `donorId` (indexed)
- `caseId` (indexed)

---

#### 6. **Notification**
**Collection**: `notifications`

```typescript
{
  userId: ObjectId (required, indexed, refPath: 'userModel')
  userModel: String (required, enum: ['Donor', 'NeedyPerson', 'Admin'])
  type: String (required, enum: [
    'case_submitted',      // Case submitted - notify superadmin
    'case_approved',       // Case approved - notify needy person
    'case_rejected',       // Case rejected - notify needy person
    'donation_received',   // Donation received - notify superadmin
    'donation_confirmed'  // Donation confirmed - notify donor
  ])
  title: String (required)
  message: String (required)
  relatedId: ObjectId // Case or donation ID
  relatedType: String (enum: ['case', 'donation'])
  isRead: Boolean (default: false, indexed)
  readAt: Date

  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:
- `userId` (indexed)
- `isRead` (indexed)
- Compound: `{ userId: 1, isRead: 1, createdAt: -1 }`
- Compound: `{ userId: 1, userModel: 1 }`

---

## API Architecture

### API Routes Structure

All API routes are in `/app/api/` using Next.js API Routes (App Router).

#### Authentication APIs (`/api/auth/`)

1. **POST `/api/auth/login`**
   - User login (donor, volunteer, needy person)
   - Returns JWT token and user data

2. **POST `/api/auth/admin-login`**
   - Admin/superadmin login
   - Returns admin data

3. **POST `/api/auth/register/accepter`**
   - Register needy person (accepter)
   - Creates case with personal, financial, and disease info

4. **POST `/api/auth/register/donor`**
   - Register donor account

5. **POST `/api/auth/register/volunteer`**
   - Register volunteer account
   - Requires CNIC upload

#### Case APIs (`/api/cases/`)

1. **POST `/api/cases/submit`**
   - Submit new case (for existing registered users)
   - Uploads document to Cloudinary
   - Creates notification for admins

2. **GET `/api/cases`**
   - Get all cases (with filters)

3. **GET `/api/cases/[id]`**
   - Get case by ID

4. **GET `/api/cases/my-cases`**
   - Get cases for logged-in user

5. **POST `/api/cases/approve`**
   - Approve case (admin only)

6. **POST `/api/cases/update-priorities`**
   - Update case priorities (admin only)

#### Admin APIs (`/api/admin/`)

1. **GET `/api/admin/pending-cases`**
   - Get pending cases for review
   - Supports filters: pending, accepted, rejected, verified-by-volunteer, all

2. **GET `/api/admin/cases/[id]`**
   - Get case details for admin review

3. **POST `/api/admin/cases/[id]/assign-volunteer`**
   - Assign volunteer to case

4. **GET `/api/admin/donors`**
   - Get all donors

5. **POST `/api/admin/donors/[id]/toggle-status`**
   - Toggle donor active status

6. **GET `/api/admin/volunteers`**
   - Get all volunteers

7. **POST `/api/admin/volunteers/[id]/toggle-status`**
   - Toggle volunteer active status

8. **POST `/api/admin/create`**
   - Create new admin account

9. **POST `/api/admin/reset-password`**
   - Reset admin password

#### Donation APIs (`/api/donations/`)

1. **POST `/api/donations`**
   - Create donation record
   - Updates case totalDonations
   - Updates donor statistics
   - Creates notifications

2. **POST `/api/donations/create-payment-intent`**
   - Create Stripe payment intent
   - Returns client secret

#### Notification APIs (`/api/notifications/`)

1. **GET `/api/notifications`**
   - Get notifications for user
   - Supports filters (unread, all)

2. **POST `/api/notifications/[id]/read`**
   - Mark notification as read

3. **POST `/api/notifications/read-all`**
   - Mark all notifications as read

#### Volunteer APIs (`/api/volunteer/`)

1. **GET `/api/volunteer/cases`**
   - Get cases assigned to volunteer

2. **POST `/api/volunteer/cases/approve`**
   - Approve/reject case (volunteer verification)

#### Stats APIs (`/api/stats/`)

1. **GET `/api/stats`**
   - Get dashboard statistics
   - Returns counts, totals, charts data

---

## Key Features & Workflows

### 1. User Registration Flow

#### Needy Person (Accepter) Registration
1. User fills 3-step form:
   - **Step 1**: Personal info (name, email, CNIC, district, area, address, phone, password)
   - **Step 2**: Financial info (age, marital status, children, salary, house, utility bill)
   - **Step 3**: Disease info (disease type, description, hospital, doctor, amount, document)
2. Document uploaded to Cloudinary (PNG, JPG, JPEG only)
3. Case created with status: `pending`
4. Priority auto-assigned based on area
5. Case number auto-generated: `CASE-YYYY-#####`
6. Notification sent to all admins

#### Donor Registration
1. Simple form: name, email, address, phone, password
2. Account created with role: `donor`
3. Can immediately start donating

#### Volunteer Registration
1. Form: name, email, address, phone, CNIC, CNIC front/back images, password
2. CNIC validated (format: 12345-1234567-1)
3. CNIC images uploaded to Cloudinary
4. Account created with role: `volunteer`
5. Requires admin verification (`isVerified: false`)

### 2. Case Submission Flow (Existing User)

1. Logged-in user submits new case via `NewCaseForm`
2. Form data sent to `/api/cases/submit`
3. Document uploaded to Cloudinary
4. New case created with:
   - Same personal/financial info from profile
   - New disease information
   - Unique case number
   - Status: `pending`
5. Notification sent to admins

### 3. Volunteer Verification Flow

1. Admin assigns volunteer to case
2. Volunteer receives notification
3. Volunteer reviews case details
4. Volunteer can:
   - **Approve**: Sets `volunteerApprovalStatus: 'approved'`
   - **Reject**: Sets `volunteerApprovalStatus: 'rejected'` with reasons
5. Admin reviews volunteer's decision
6. Admin makes final decision (approve/reject case)

### 4. Admin Review Flow

1. Admin views pending cases in dashboard
2. Admin can:
   - View case details
   - Assign volunteer
   - Approve case → Status: `accepted`
   - Reject case → Status: `rejected`
3. On approval:
   - Case becomes visible to donors
   - Notification sent to needy person
4. On rejection:
   - Notification sent to needy person with reason

### 5. Donation Flow

1. Donor browses approved cases
2. Donor clicks "Donate" on a case
3. Donation modal opens:
   - Enter amount (validated against remaining need)
   - Select payment method: Stripe, JazzCash, EasyPaisa
   - Mark as Zakat donation (optional)
4. For Stripe:
   - Payment intent created
   - Card payment processed
   - Payment confirmed
5. Donation record created:
   - Updates case `totalDonations`
   - Updates donor statistics
   - Creates notifications
6. Success message shown

### 6. Notification System

**Notification Types**:
- `case_submitted`: New case submitted → Notify all admins
- `case_approved`: Case approved → Notify needy person
- `case_rejected`: Case rejected → Notify needy person
- `donation_received`: Donation made → Notify superadmin
- `donation_confirmed`: Donation confirmed → Notify donor

**Notification Display**:
- Notification icon in navbar (badge with count)
- Dropdown shows unread notifications
- Click to mark as read
- "Mark all as read" option

### 7. Priority System

**Priority Assignment**:
- Auto-assigned based on area (Karachi districts)
- Can be manually updated by admin
- Values: `High`, `Medium`, `Low`

**Priority Logic**:
- Defined in `lib/models/needyPerson.ts`
- Function: `getPriorityByArea(area: string)`

### 8. File Upload System

**Cloudinary Integration**:
- All files uploaded to Cloudinary
- Document types: PNG, JPG, JPEG only (PDF removed)
- Resource type: `image` (auto-detected)
- Folder structure: `documents/`, `utility-bills/`, etc.
- Files stored with unique names: `timestamp-sanitized-filename`

**Upload Flow**:
1. File selected in form
2. File converted to Buffer
3. Uploaded to Cloudinary via `uploadFileToCloudinary()`
4. Secure URL returned and stored in database
5. URL used for display/download

---

## Environment Variables

Required environment variables (`.env.local` or Vercel):

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medhope
# OR for local: mongodb://localhost:27017/medhope

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# JWT Secret (if using JWT)
JWT_SECRET=your_jwt_secret_key
```

---

## Deployment

### Build Commands
```bash
npm run build    # Build for production
npm run start    # Start production server
npm run dev      # Development server
```

### Deployment Platforms
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS**
- **Docker**

### Database
- **MongoDB Atlas** (Recommended for production)
- **Local MongoDB** (Development)

### File Storage
- **Cloudinary** (Production)
- **Local storage** (Development - not recommended)

---

## Key Libraries & Their Usage

### Framer Motion
- Page transitions
- Component animations
- Modal animations
- Hover effects

### React Hook Form
- Form validation
- Form state management
- Multi-step forms
- Error handling

### Recharts
- Dashboard charts
- Statistics visualization
- Line charts, bar charts, pie charts

### Axios
- API calls
- Request/response interceptors
- Error handling

### bcryptjs
- Password hashing
- Password comparison
- Used in admin schema pre-save hook

### Mongoose
- Database connection
- Schema definition
- Model creation
- Query building
- Pre/post hooks

---

## Security Features

1. **Password Hashing**: bcrypt with salt rounds 10
2. **Input Validation**: TypeScript types + Mongoose validation
3. **Authentication**: Session-based (localStorage) + role-based access
4. **File Upload**: Type validation, size limits, Cloudinary security
5. **API Protection**: Role checks in API routes
6. **SQL Injection**: Not applicable (NoSQL)
7. **XSS Protection**: React's built-in escaping

---

## Future Enhancements (Potential)

1. Email verification
2. Two-factor authentication
3. SMS notifications
4. Real-time chat
5. Mobile app (React Native)
6. Advanced analytics
7. Payment gateway integration (JazzCash, EasyPaisa APIs)
8. Document OCR for automatic data extraction
9. Multi-language support
10. Advanced search and filters

---

## Support & Documentation

- **Architecture**: See `ARCHITECTURE.md`
- **MongoDB Setup**: See `MONGODB_SETUP.md`
- **Email Setup**: See `EMAIL_SETUP.md`
- **Superadmin Setup**: See `SUPERADMIN_SETUP.md`
- **URLs & Login**: See `URLS_AND_LOGIN.md`

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintained By**: MedHope Development Team
