# MongoDB Deployment Guide

## MongoDB Atlas Setup for Production

### Prerequisites
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
- Expense Tracker API repository

---

## Step 1: Create MongoDB Atlas Cluster

### 1.1 Create Organization and Project
- Sign in to MongoDB Atlas
- Create a new project (e.g., "Expense Tracker")
- Note your project ID

### 1.2 Create a Cluster
- Click "Create Deployment"
- Choose "M0 Free" tier for development/testing
- Select your preferred region (choose closest to your users)
- Click "Create Deployment"

### 1.3 Wait for Cluster to Deploy
- Takes 2-5 minutes
- You'll see a notification when ready

---

## Step 2: Create Database User

### 2.1 Add Database User
- In Atlas Dashboard, go to **Security** > **Database Access**
- Click "Add New Database User"
- Choose **Password** authentication
- **Username**: `sujaymachawork_db_user` (or your preferred name)
- **Password**: Generate a Strong Password
  - Click "Autogenerate Secure Password"
  - Copy the password to a secure location (you'll need it now)
- **User Privileges**: Select "Read and write to any database"
- Click "Add User"

### 2.2 Important: URL Encode Password
If your password contains special characters (@, !, #, $, %, etc.):
- Use this tool to encode: https://www.urlencoder.org/
- Example: `P@ss#word!` → `P%40ss%23word%21`
- Use the encoded version in your connection string

---

## Step 3: Setup Network Access

### 3.1 Add IP Whitelist
- Go to **Security** > **Network Access**
- Click "Add IP Address"
- For **Vercel**: Allow **0.0.0.0/0** (Allow all IPs)
  - Click "Allow access from anywhere"
  - Confirm by clicking "Add IP Address"

### 3.2 For Local Development
- Add your local machine IP or use **0.0.0.0/0**

---

## Step 4: Get Connection String

### 4.1 Connect to Your Cluster
- In Atlas Dashboard, click "Connect" button next to your cluster
- Choose "Applications"
- Select "Node.js" driver
- Copy the connection string

### 4.2 Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://sujaymachawork_db_user:MySecureP%40ssword@cluster-resume.xa9j7iy.mongodb.net/expense_tracker?retryWrites=true&w=majority
```

---

## Step 5: Configure Environment Variables

### 5.1 Local Development (.env)
```bash
MONGODB_URI=mongodb+srv://sujaymachawork_db_user:***REMOVED***@cluster-resume.xa9j7iy.mongodb.net/expense_tracker?retryWrites=true&w=majority&appName=Cluster-resume
```

### 5.2 Vercel Deployment

#### Set Environment Variables on Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add the following variables:

| Name | Value |
|------|-------|
| `MONGODB_URI` | Your connection string (with encoded password) |
| `JWT_SECRET` | Generate a new strong secret key (e.g., `openssl rand -base64 32`) |
| `FRONTEND_URL` | https://yourdomain.vercel.app (your frontend URL) |
| `NODE_ENV` | `production` |

⚠️ **NEVER expose credentials in code. ONLY use Vercel environment variables!**

---

## Step 6: Database Connection Verification

### 6.1 Test Local Connection
```bash
npm run dev
```

Should see:
```
✅ MongoDB Connected: cluster-resume.xa9j7iy.mongodb.net
📊 Database: expense_tracker
🚀 Server running in development mode on port 3000
```

### 6.2 Test Connection String
```bash
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
"
```

---

## Step 7: Create Initial Database and Collections

### 7.1 Using MongoDB Atlas UI
1. Go to your cluster
2. Click "Collections"
3. Click "Create Database"
4. **Database name**: `expense_tracker`
5. **Collection name**: Start with `users` (schema will auto-create others)

### 7.2 Collections Structure

**users**
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password": "hashed_password",
  "createdAt": ISODate()
}
```

**expenses**
```json
{
  "_id": ObjectId,
  "user": ObjectId,
  "amount": 100.50,
  "category": "food",
  "description": "Lunch at cafe",
  "date": ISODate(),
  "createdAt": ISODate()
}
```

---

## Troubleshooting

### Connection Errors

#### "authentication failed" or "Invalid credentials"
- ✅ Verify username and password are correct
- ✅ Ensure password is URL-encoded if it has special characters
- ✅ Check that database user was created successfully in Atlas

#### "connect ECONNREFUSED" or "Network error"
- ✅ Check IP whitelist allows your IP (use 0.0.0.0/0 for development)
- ✅ Verify cluster is deployed and running
- ✅ Check internet connection

#### "MONGODB_URI is not set"
- ✅ Ensure .env file exists and has MONGODB_URI
- ✅ On Vercel, add environment variables in project settings
- ✅ Don't forget to redeploy after adding environment variables

#### "Timeout" or "Connection takes too long"
- ✅ Check MongoDB Atlas is running
- ✅ Verify cluster is in same region as your deployment
- ✅ For large queries, ensure you have proper indexes

### Common Fixes
1. **Fresh Deploy**: 
   ```bash
   git add .
   git commit -m "Fix: MongoDB configuration"
   git push
   ```

2. **Restart Vercel Deployment**:
   - Go to Vercel dashboard
   - Click "Deployments"
   - Click "..." on latest deployment
   - Click "Redeploy"

3. **Check Vercel Logs**:
   - Vercel dashboard → Deployments → Select deployment → Logs

---

## Security Best Practices

### ✅ DO
- ✅ Use strong, randomly generated passwords
- ✅ Store credentials only in environment variables
- ✅ Use MongoDB Atlas IP whitelist
- ✅ Enable MongoDB Atlas IP accesslist for Vercel (all IPs)
- ✅ Rotate credentials periodically
- ✅ Use JWT for API authentication

### ❌ DON'T
- ❌ Never commit .env files
- ❌ Never hardcode credentials in source code
- ❌ Never use same password for multiple services
- ❌ Never allow all IPs in production (MongoDB Atlas tip: use IP filtering)
- ❌ Never share connection strings in chat/email

---

## Database Upgrades

### Scaling from M0 (Free Tier)
When you need more capacity:
1. Go to your cluster
2. Click "Modify" cluster
3. Choose higher tier (M2, M5, M10, etc.)
4. No downtime with auto-scaling

### Backup Strategy
1. Enable **MongoDB Atlas backup** (automatic daily backups)
2. Test restore procedures regularly
3. Keep encrypted backups in secure location

---

## Additional Resources

- [MongoDB Atlas Tutorial](https://docs.mongodb.com/atlas/tutorial/)
- [MongoDB Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security-checklist/)
