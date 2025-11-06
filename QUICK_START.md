# 🚀 Quick Start Guide

Get your University Staff Directory running in **5 minutes**!

## Prerequisites Checklist
- [ ] Node.js 20+ or Bun 1.2+ installed
- [ ] MongoDB installed (local) OR MongoDB Atlas account
- [ ] Git installed

## Installation Steps

### 1️⃣ Install Dependencies (1 min)
```bash
cd /Users/maintenance/Documents/Online-Faculty-Staff-Directoy
bun install
```

### 2️⃣ Setup Environment (1 min)
```bash
# Copy example environment file
cp .env.example .env

# Edit .env - minimum required:
# - MONGODB_URI (your MongoDB connection)
# - JWT_SECRET (any random secret string)
```

**Quick MongoDB Options:**
- **Local:** `mongodb://localhost:27017/university-staff-directory`
- **Atlas:** Get free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)

### 3️⃣ Start MongoDB (if local)
```bash
# In a separate terminal
mongod
```

### 4️⃣ Create First Admin (2 min)
```bash
bun run create-admin
```

Follow the prompts to create your admin account.

### 5️⃣ Start Development Server (1 min)
```bash
bun run dev
```

## 🎉 You're Ready!

Open your browser to **http://localhost:5173**

### What You Can Do Now:

1. **View the landing page** → http://localhost:5173
2. **Register as staff** → http://localhost:5173/register
3. **Login** → http://localhost:5173/login
4. **Admin login** → http://localhost:5173/admin/login

## Testing the System

### Register a Staff Member
1. Go to `/register`
2. Fill in the form
3. Submit (account will be pending approval)

### Approve as Admin
1. Login at `/admin/login`
2. Use API to approve: `PATCH /api/admin/staff`
   ```bash
   curl -X PATCH http://localhost:5173/api/admin/staff \\
     -H "Content-Type: application/json" \\
     -H "Cookie: auth_token=YOUR_ADMIN_TOKEN" \\
     -d '{"id": "USER_ID", "action": "approve"}'
   ```

### Test Search
1. Go to browser
2. Use the search API: `GET /api/staff/search?search=john`

## Common Issues

### "Connection refused" error
- **Cause:** MongoDB not running
- **Fix:** Start MongoDB with `mongod`

### "JWT_SECRET is not defined"
- **Cause:** Missing .env file
- **Fix:** Copy .env.example to .env and add JWT_SECRET

### "Cannot find module"
- **Cause:** Dependencies not installed
- **Fix:** Run `bun install`

## Next Steps

### Recommended Order:
1. ✅ Test staff registration and login
2. ✅ Test admin approval workflow
3. ✅ Test search API
4. 🔨 Build staff dashboard page
5. 🔨 Build public profile pages
6. 🔨 Build directory/search page
7. 🔨 Build admin dashboard
8. 🚀 Deploy to Vercel

## Useful Commands

```bash
# Development
bun run dev              # Start dev server
bun run build            # Build for production
bun run preview          # Preview production build

# Database
bun run create-admin     # Create admin user
mongod                   # Start local MongoDB

# Code Quality
bun run lint             # Check code style
bun run format           # Format code
bun run check            # TypeScript check

# Testing (when implemented)
bun test                 # Run unit tests
bun test:e2e             # Run E2E tests
```

## API Testing

### Using curl:

**Register:**
```bash
curl -X POST http://localhost:5173/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "fullName": "John Doe",
    "staffId": "STAFF001",
    "email": "john@university.edu",
    "password": "SecurePass123!",
    "faculty": "Engineering",
    "department": "Computer Science",
    "designation": "Professor"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5173/api/auth/login \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{
    "email": "john@university.edu",
    "password": "SecurePass123!"
  }'
```

**Search:**
```bash
curl http://localhost:5173/api/staff/search?search=john&limit=10
```

## Environment Variables Reference

**Required:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens (use strong random string)

**Optional (Email):**
- `SMTP_HOST` - SMTP server (default: smtp.gmail.com)
- `SMTP_PORT` - SMTP port (default: 587)
- `SMTP_USER` - Email username
- `SMTP_PASS` - Email password or app password
- `ADMIN_EMAIL` - Where to send admin notifications

## File Structure Overview

```
src/
├── lib/server/           # Backend code
│   ├── auth/            # Authentication utilities
│   ├── db/              # Database models & connection
│   ├── middleware/      # Auth middleware
│   └── utils/           # Email, logging
├── routes/
│   ├── api/             # API endpoints
│   ├── +page.svelte     # Landing page
│   ├── login/           # Login page
│   └── register/        # Registration page
└── app.css              # Global styles
```

## Getting Help

1. **Check the full README:** `README.md`
2. **Implementation details:** `IMPLEMENTATION_SUMMARY.md`
3. **Project status:** `PROJECT_STATUS.md`
4. **API docs:** See README.md "API Documentation" section

## Pro Tips 💡

1. **Use Thunder Client or Postman** for easier API testing
2. **Check MongoDB Compass** to visualize your data
3. **Use the browser console** to debug frontend issues
4. **Enable MongoDB logs** for database debugging: `mongod --verbose`
5. **VS Code extensions** recommended:
   - Svelte for VS Code
   - Tailwind CSS IntelliSense
   - MongoDB for VS Code
   - Thunder Client (API testing)

## Deploy to Production

When ready to deploy:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Set environment variables in Vercel dashboard
# 5. Done! ✨
```

---

**Need more details?** Check the comprehensive [README.md](./README.md)

**Ready to code?** Start with `bun run dev` 🚀

---

*Last updated: November 2025*
