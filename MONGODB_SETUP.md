# MongoDB Setup Guide

## Issue: MongoDB Connection Refused

The error `ECONNREFUSED` means MongoDB server is not running on your machine.

## Solution Options:

### Option 1: Install and Start MongoDB Locally (Windows)

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download and install

2. **Start MongoDB Service:**
   ```powershell
   # Check if MongoDB service exists
   Get-Service -Name MongoDB
   
   # Start MongoDB service
   Start-Service -Name MongoDB
   
   # Or start manually
   mongod --dbpath "C:\data\db"
   ```

3. **Verify MongoDB is Running:**
   ```powershell
   # Test connection
   mongosh mongodb://localhost:27017
   ```

### Option 2: Use MongoDB Atlas (Cloud - Recommended for Development)

1. **Create Free Account:**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free tier (512MB storage)

2. **Create a Cluster:**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a region close to you
   - Create cluster

3. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It will look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medhope?retryWrites=true&w=majority`

4. **Update .env.local:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medhope?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your Atlas credentials.

5. **Configure Network Access:**
   - In Atlas, go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP

### Option 3: Use MongoDB Docker (If you have Docker)

```powershell
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running
docker ps
```

## After Setup:

1. **Restart your Next.js dev server:**
   ```powershell
   npm run dev
   ```

2. **Check the console** for connection success message:
   ```
   ✅ MongoDB connected successfully
   📊 Database: medhope
   ```

## Current Connection String:

Your `.env.local` file should contain:
```
MONGODB_URI=mongodb://localhost:27017/medhope
```

Or for MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medhope?retryWrites=true&w=majority
```

## Troubleshooting:

- **Port 27017 in use:** Check if another application is using the port
- **Firewall blocking:** Allow MongoDB through Windows Firewall
- **Service not starting:** Check MongoDB logs in `C:\Program Files\MongoDB\Server\{version}\log\`

