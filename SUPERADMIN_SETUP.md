# Superadmin Setup Guide

## How to Create a Superadmin Account

### Option 1: Using the Script (Recommended)

1. Make sure your MongoDB connection is working and `.env.local` has `MONGODB_URI` set.

2. Run the create-admin script:
   ```bash
   node scripts/create-admin.js
   ```

3. Default credentials will be created:
   - **Email:** `admin@medhope.com`
   - **Password:** `admin123`

4. **⚠️ IMPORTANT:** Change the password immediately after first login!

### Option 2: Manual Creation via MongoDB

If you prefer to create the admin manually:

1. Connect to your MongoDB database
2. Insert a document in the `admins` collection:
   ```javascript
   db.admins.insertOne({
     name: "Super Admin",
     email: "admin@medhope.com",
     password: "<hashed_password>", // Use bcrypt to hash your password
     role: "admin",
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

## How to Login as Superadmin

1. Go to `/auth/admin-login` or click "Admin Login" link
2. Enter your admin email and password
3. You will be redirected to `/superadmin/dashboard`

## Superadmin Dashboard Features

- **View Pending Cases:** All newly registered cases appear here
- **Approve Cases:** Approve cases to make them visible to donors
- **Reject Cases:** Reject cases that don't meet criteria
- **Filter Cases:** Filter by status (Pending, Approved, Rejected, All)
- **View Case Details:** Expand any case to see full information

## Workflow

1. **Needy Person Registers:**
   - Case is created with `status: 'pending'`
   - Case is NOT visible on public pages

2. **Superadmin Reviews:**
   - Logs into `/superadmin/dashboard`
   - Sees all pending cases
   - Reviews case details

3. **Superadmin Approves/Rejects:**
   - Click "Approve" → Case status becomes `'accepted'`
   - Click "Reject" → Case status becomes `'rejected'`

4. **Approved Cases:**
   - Only cases with `status: 'accepted'` appear on public pages
   - Donors can now see and donate to these cases

## Security Notes

- Admin authentication is verified server-side
- Only users with `role: 'admin'` can access admin routes
- Admin email is verified in the database for each admin action
- Change default password immediately after setup

## API Endpoints

- `POST /api/auth/admin-login` - Admin login
- `GET /api/admin/pending-cases?status=<status>&adminEmail=<email>` - Get cases
- `POST /api/cases/approve` - Approve/reject case

## Troubleshooting

If you can't login:
1. Check that the admin account exists in MongoDB
2. Verify the email and password are correct
3. Ensure `isActive: true` in the admin document
4. Check browser console for errors

