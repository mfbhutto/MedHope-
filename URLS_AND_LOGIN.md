# MedHope - All URLs and Login Information

## 🔐 Login Information

### Unified Login Page
**URL:** `/auth/login`  
**Description:** Single login page for all user types (Donor, Needy Person, Admin, Superadmin)

**How it works:**
- Enter email and password
- System automatically detects user type from database
- Routes based on role:
  - `donor` → `/medhope/pages/donorprofile`
  - `accepter` (needy person) → `/medhope/pages/needyprofile`
  - `admin` → `/superadmin/pages/dashboard`
  - `superadmin` → `/superadmin/pages/dashboard`

**Note:** The `/auth/admin-login` page now redirects to `/auth/login` (unified login)

---

## 📍 All Application URLs

### 🌐 Public Pages (No Login Required)

#### Home & Main Pages
- `/` - **Home Page** (Public - No login required)
  - Main landing page with Hero, Services, Cases, How It Works, Why Choose Us
  - Shows verified cases for public viewing
- `/medhope/pages/home` - **Home Page** (Alternative route - same content)

#### Public Information Pages
- `/medhope/pages/about` - **About Us** page
- `/medhope/pages/services` - **Services** page
- `/medhope/pages/contact` - **Contact** page
- `/medhope/pages/privacy-policy` - **Privacy Policy** page
- `/medhope/pages/terms-of-service` - **Terms of Service** page

**Note:** Footer links to `/privacy-policy` and `/terms-of-service` - these may need route setup or redirect

---

### 🔑 Authentication Pages

#### Login & Registration
- `/auth/login` - **Unified Login Page** (for all user types)
- `/auth/register` - **Registration Selection** page
- `/auth/register/donor` - **Donor Registration** page
- `/auth/register/accepter` - **Needy Person Registration** page
- `/auth/admin-login` - **Admin Login** (redirects to `/auth/login`)

---

### 👤 User Dashboard Pages (Login Required)

#### Donor Pages
- `/medhope/pages/donorprofile` - **Donor Profile/Dashboard**
- `/medhope/pages/needypersons` - **Browse Needy Persons** (all cases)
- `/medhope/pages/needypersons/[id]` - **Needy Person Detail** page (view specific case)
- `/medhope/pages/cases` - **Cases Page** (with service filters)
  - `/medhope/pages/cases?service=medicine` - Medicine cases
  - `/medhope/pages/cases?service=laboratory` - Lab test cases
  - `/medhope/pages/cases?service=chronic` - Chronic disease cases

#### Needy Person (Accepter) Pages
- `/medhope/pages/needyprofile` - **Needy Person Profile/Dashboard**
  - Submit new cases
  - View submitted cases
  - Track donations

---

### 🛡️ Superadmin Pages (Admin/Superadmin Only)

#### Admin Dashboard
- `/superadmin/pages/dashboard` - **Superadmin Dashboard**
  - View pending cases
  - Approve/reject cases
  - View case statistics
  - Filter by status (pending, accepted, rejected, all)

#### Admin Utility Pages
- `/admin/create-admin` - **Create Admin Account** (one-time setup)
- `/admin/reset-password` - **Reset Admin Password**
- `/admin/update-priorities` - **Update Case Priorities** (utility)

---

## 🔌 API Endpoints

### Authentication APIs
- `POST /api/auth/login` - **Unified Login API** (for all user types)
- `POST /api/auth/admin-login` - **Admin Login API** (legacy, still works)
- `POST /api/auth/register/donor` - **Donor Registration API**
- `POST /api/auth/register/accepter` - **Needy Person Registration API**

### Admin APIs
- `POST /api/admin/create` - **Create Admin Account**
- `GET /api/admin/pending-cases` - **Get Pending Cases** (with filters)
- `POST /api/admin/reset-password` - **Reset Admin Password**
- `POST /api/admin/test-login` - **Test Admin Login**

### Cases APIs
- `GET /api/cases` - **Get All Cases** (public/verified cases)
- `POST /api/cases/submit` - **Submit New Case**
- `POST /api/cases/approve` - **Approve/Reject Case** (admin only)
- `GET /api/cases/my-cases` - **Get My Cases** (for needy person)
- `POST /api/cases/update-priorities` - **Update Case Priorities**

### Donations APIs
- `GET /api/donations` - **Get Donations**
- `POST /api/donations` - **Create Donation**

### Needy Persons APIs
- `GET /api/needypersons` - **Get All Needy Persons**
- `GET /api/needypersons/[id]` - **Get Needy Person by ID**

### User APIs
- `GET /api/users/me` - **Get Current User Info**

### Stats APIs
- `GET /api/stats` - **Get Statistics**

---

## 👥 User Roles & Access

### Role Types in Database:
1. **`donor`** - Can donate to cases
2. **`accepter`** - Can submit medical cases
3. **`admin`** - Can approve/reject cases
4. **`superadmin`** - Same as admin (for future distinction)

### Role-Based Routing After Login:

| Role | Redirects To |
|------|-------------|
| `donor` | `/medhope/pages/donorprofile` |
| `accepter` | `/medhope/pages/needyprofile` |
| `admin` | `/superadmin/pages/dashboard` |
| `superadmin` | `/superadmin/pages/dashboard` |

---

## 📝 Quick Reference

### For Donors:
1. Register: `/auth/register/donor`
2. Login: `/auth/login`
3. Browse Cases: `/medhope/pages/needypersons`
4. View Profile: `/medhope/pages/donorprofile`

### For Needy Persons:
1. Register: `/auth/register/accepter`
2. Login: `/auth/login`
3. Submit Case: `/medhope/pages/needyprofile`
4. View Profile: `/medhope/pages/needyprofile`

### For Admins/Superadmins:
1. Login: `/auth/login` (use admin email/password)
2. Dashboard: `/superadmin/pages/dashboard`
3. Create Admin: `/admin/create-admin` (one-time setup)
4. Reset Password: `/admin/reset-password`

---

## 🔗 Important Notes

1. **Unified Login:** All users (donor, needy person, admin, superadmin) use the same login page at `/auth/login`

2. **Role Detection:** The system automatically detects the user's role from the database and routes accordingly

3. **Admin Login:** The `/auth/admin-login` page now redirects to `/auth/login` for unified access

4. **Protected Routes:** 
   - User dashboards require login
   - Superadmin dashboard requires `admin` or `superadmin` role
   - Cases page requires `donor` role

5. **Public Pages:** Home, About, Services, Contact, Privacy Policy, and Terms of Service are accessible without login

---

## 🛠️ Development URLs

- Base URL: `http://localhost:3000` (development)
- API Base: `http://localhost:3000/api`

---

## 📧 Contact Information (from pages)

- **Email:** medhope74@gmail.com
- **Phone/WhatsApp:** +92 300 1234567
- **Location:** Karachi, Pakistan

