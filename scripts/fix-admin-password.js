// Script to fix existing admin password (if it was double-hashed)
// Run with: node scripts/fix-admin-password.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function fixAdminPassword() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin
    const admin = await Admin.findOne({ email: 'admin@medhope.com' });
    
    if (!admin) {
      console.log('❌ Admin not found with email: admin@medhope.com');
      console.log('💡 You can create a new admin at: http://localhost:3000/admin/create-admin');
      process.exit(0);
    }

    console.log('📋 Found admin:', admin.email);
    console.log('📋 Current password hash length:', admin.password.length);
    console.log('📋 Password hash starts with:', admin.password.substring(0, 10));

    // Ask for new password
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter new password for admin (min 6 characters): ', async (newPassword) => {
      if (!newPassword || newPassword.length < 6) {
        console.log('❌ Password must be at least 6 characters');
        rl.close();
        process.exit(1);
      }

      // Hash the new password (only once)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update admin password
      admin.password = hashedPassword;
      await admin.save();

      console.log('✅ Admin password updated successfully!');
      console.log('📧 Email: admin@medhope.com');
      console.log('🔑 New password: ' + newPassword);
      console.log('\n💡 You can now login at: http://localhost:3000/auth/admin-login');
      
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
    process.exit(1);
  }
}

fixAdminPassword();

