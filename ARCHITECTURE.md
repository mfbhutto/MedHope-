# Project Architecture

This document describes the new project structure following the charity-platform architecture.

## Folder Structure

```
frontend/
│
├── package.json
├── next.config.js
├── tailwind.config.js
├── .env.local
│
├── /public
│   ├── logo.png (TODO)
│   └── banner.jpg (TODO)
│
├── /lib
│   ├── db.ts                        # MongoDB connection file
│   ├── models/                      # Data models
│   └── controllers/                 # Business logic controllers
│
├── /app
│   ├── layout.tsx                   # Global layout (wrapper)
│   ├── globals.css
│   ├── page.tsx                     # Root page (main public site)
│
│   ├── main/                        # 🌍 Public-facing Charity Website
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Home page (alternative route: /main)
│   │   ├── cases/
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Case detail page
│   │   └── components/
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       ├── HeroSection.tsx
│   │       ├── CampaignCard.tsx
│   │       ├── DonationForm.tsx
│   │       └── Testimonials.tsx
│
│   ├── superadmin/                  # 🧑‍💼 Super Admin Panel
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Admin dashboard
│   │   ├── donations/
│   │   │   └── page.tsx             # Donations management
│   │   ├── campaigns/
│   │   │   ├── page.tsx             # Campaigns list
│   │   │   └── add/
│   │   │       └── page.tsx         # Add campaign
│   │   ├── users/
│   │   │   └── page.tsx              # Users management
│   │   └── components/
│   │       ├── Sidebar.tsx
│   │       ├── AdminNavbar.tsx
│   │       ├── StatCard.tsx
│   │       ├── DataTable.tsx
│   │       └── AdminHeader.tsx
│
│   ├── auth/                        # 🔐 Auth Pages
│   │   ├── login/
│   │   │   └── page.tsx             # Login page (route: /auth/login)
│   │   ├── register/
│   │   │   └── page.tsx             # Register page (route: /auth/register)
│   │   ├── forgot-password/
│   │   │   └── page.tsx             # Forgot password
│   │   └── reset-password/
│   │       └── page.tsx             # Reset password
│
│   ├── api/                         # ⚙️ Serverless API Routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts         # POST /api/auth/login
│   │   │   ├── register/
│   │   │   │   └── route.ts        # POST /api/auth/register
│   │   │   ├── logout/
│   │   │   │   └── route.ts        # POST /api/auth/logout
│   │   │   └── me/
│   │   │       └── route.ts        # GET /api/auth/me
│   │   ├── donations/
│   │   │   ├── route.ts            # POST/GET /api/donations
│   │   │   └── [id]/
│   │   │       └── route.ts        # GET/PUT /api/donations/[id]
│   │   └── users/
│   │       ├── route.ts            # GET /api/users
│   │       └── [id]/
│   │           └── route.ts        # GET/PUT /api/users/[id]
│
│   ├── login/                       # Legacy route (kept for backward compatibility)
│   │   └── page.tsx
│   ├── register/                    # Legacy route (kept for backward compatibility)
│   │   └── page.tsx
│   ├── cases/                       # Legacy route (kept for backward compatibility)
│   │   └── [id]/
│   │       └── page.tsx
│   └── dashboard/                   # Legacy route (kept for backward compatibility)
│       └── [role]/
│           └── page.tsx
│
└── /components                      # 🧩 Shared Components (used globally)
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── Loader.tsx
    ├── Navbar.tsx                   # Current navbar (shared)
    ├── Footer.tsx                   # Current footer (shared)
    ├── Hero.tsx                     # Current hero (shared)
    ├── Services.tsx                 # Current services (shared)
    ├── PatientCases.tsx             # Current patient cases (shared)
    └── dashboards/                  # Dashboard components
        ├── DonorDashboard.tsx
        ├── AccepterDashboard.tsx
        └── AdminDashboard.tsx
```

## Route Mapping

### Public Routes
- `/` → Main public homepage
- `/main` → Alternative route to main homepage
- `/cases/[id]` → Case detail page (legacy route)
- `/main/cases/[id]` → Case detail page (new route)

### Authentication Routes
- `/login` → Login page (legacy route)
- `/auth/login` → Login page (new route)
- `/register` → Register page (legacy route)
- `/auth/register` → Register page (new route)
- `/auth/forgot-password` → Forgot password page
- `/auth/reset-password` → Reset password page

### Admin Routes
- `/dashboard/[role]` → Dashboard page (legacy route)
- `/superadmin/dashboard` → Admin dashboard (new route)
- `/superadmin/donations` → Donations management
- `/superadmin/campaigns` → Campaigns management
- `/superadmin/campaigns/add` → Add campaign
- `/superadmin/users` → Users management

### API Routes
- `POST /api/auth/login` → Login API
- `POST /api/auth/register` → Register API
- `POST /api/auth/logout` → Logout API
- `GET /api/auth/me` → Get current user
- `GET /api/donations` → Get all donations
- `POST /api/donations` → Create donation
- `GET /api/donations/[id]` → Get donation by ID
- `PUT /api/donations/[id]` → Update donation
- `GET /api/users` → Get all users
- `GET /api/users/[id]` → Get user by ID
- `PUT /api/users/[id]` → Update user

## Notes

- Legacy routes are kept for backward compatibility
- New architecture routes are available alongside legacy routes
- All API routes are placeholders and need implementation
- Component placeholders are created in their respective folders
- Models and controllers folders are created but empty (need implementation)

