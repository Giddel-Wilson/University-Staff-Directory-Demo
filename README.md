# 🎓 University Staff Directory System

A modern, comprehensive web-based staff directory system built with SvelteKit, TypeScript, MongoDB, and Tailwind CSS. This system allows university faculty and staff to create profiles, enables public searchability, and provides administrators with powerful management tools.

## ✨ Features

### For Staff Members
- 🔐 **Secure Registration & Login** - JWT-based authentication with bcrypt password hashing
- 👤 **Profile Management** - Create and update detailed professional profiles
- 📸 **Photo Upload** - Add profile pictures to enhance visibility
- 🔍 **Public Profiles** - Shareable profile pages with academic information
- 📧 **Email Notifications** - Receive approval notifications

### For Students & Visitors
- 🔎 **Advanced Search** - Search by name, department, faculty, or expertise
- 🎯 **Smart Filters** - Filter by faculty, department, or designation
- 📄 **Pagination** - Browse through results efficiently
- 📱 **Responsive Design** - Works seamlessly on all devices

### For Administrators
- 📊 **Analytics Dashboard** - View comprehensive statistics and insights
- ✅ **Approval System** - Review and approve staff registrations
- 👥 **Staff Management** - Full CRUD operations on staff records
- 📝 **Action Logging** - Track all administrative actions
- 📈 **Data Export** - Export staff data in CSV/PDF format
- 🔐 **Role-Based Access** - Super admin and admin roles

## 🛠️ Tech Stack

### Frontend
- **SvelteKit 2** - Modern web framework with TypeScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **Shadcn-Svelte** - High-quality UI components
- **Lucide Icons** - Beautiful, consistent icons
- **Svelte Motion** - Smooth animations and transitions
- **Zod** - TypeScript-first schema validation
- **Superforms** - Enhanced form handling

### Backend
- **SvelteKit API Routes** - Server-side endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email notifications

### DevOps
- **Vercel** - Deployment platform
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ or **Bun** 1.2+
- **MongoDB** (local installation or Atlas cloud)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/university-staff-directory.git
   cd university-staff-directory
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   MONGODB_URI=mongodb://localhost:27017/university-staff-directory
   JWT_SECRET=your-super-secret-jwt-key
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ADMIN_EMAIL=admin@university.edu
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

### Creating the First Admin User

Since admins cannot self-register, create one manually:

**Option 1: Using MongoDB Shell**
```javascript
use university-staff-directory;

// First, hash your password using bcrypt (use an online tool or Node.js script)
db.admins.insertOne({
  username: "admin",
  email: "admin@university.edu",
  passwordHash: "$2a$12$YOUR_HASHED_PASSWORD_HERE",
  role: "super-admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

**Option 2: Create a Seeder Script**

Create `scripts/create-admin.ts`:
```typescript
import { connectDB } from '$lib/server/db/connection';
import { Admin } from '$lib/server/db/models';
import { hashPassword } from '$lib/server/auth';

async function createAdmin() {
  await connectDB();
  
  const admin = await Admin.create({
    username: 'admin',
    email: 'admin@university.edu',
    passwordHash: await hashPassword('SecurePassword123!'),
    role: 'super-admin',
    isActive: true
  });
  
  console.log('Admin created:', admin.email);
  process.exit(0);
}

createAdmin();
```

Run with: `bun run scripts/create-admin.ts`

## 📁 Project Structure

```
university-staff-directory/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable Svelte components
│   │   └── server/
│   │       ├── auth/            # Authentication utilities
│   │       ├── db/
│   │       │   ├── connection.ts
│   │       │   └── models/      # Mongoose schemas
│   │       ├── middleware/      # Auth middleware
│   │       └── utils/           # Email, logging, etc.
│   ├── routes/
│   │   ├── +layout.svelte       # Root layout
│   │   ├── +page.svelte         # Landing page
│   │   ├── api/                 # API endpoints
│   │   │   ├── auth/            # Authentication APIs
│   │   │   ├── staff/           # Staff APIs
│   │   │   └── admin/           # Admin APIs
│   │   ├── login/               # Staff login
│   │   ├── register/            # Staff registration
│   │   ├── dashboard/           # Staff dashboard
│   │   ├── directory/           # Search directory
│   │   ├── staff/[slug]/        # Public profile pages
│   │   └── admin/               # Admin portal
│   └── app.css                  # Global styles
├── static/                      # Static assets
├── .env.example                 # Environment template
├── package.json
├── svelte.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary:** White (#FFFFFF)
- **Secondary:** Academic Blue (#2563EB)
- **Accent:** Teal (#14B8A6)
- **Dark:** Navy (#1E293B)

### Typography
- **Headings:** Poppins (Bold)
- **Body:** Inter (Regular)
- **Monospace:** Roboto Mono

### UI Components
All components use utility classes from `src/app.css`:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-accent`
- `.card`, `.card-hover`
- `.input`, `.label`
- `.animate-fade-in`, `.animate-slide-up`

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new staff member.

**Request:**
```json
{
  "fullName": "John Doe",
  "staffId": "STAFF001",
  "faculty": "Engineering",
  "department": "Computer Science",
  "designation": "Professor",
  "email": "john@university.edu",
  "password": "SecurePass123!",
  "officeAddress": "Building A, Room 301",
  "contactNumber": "+1 555-123-4567",
  "researchInterests": "AI, Machine Learning",
  "biography": "Experienced professor..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Your account is pending admin approval.",
  "user": { ... }
}
```

#### POST `/api/auth/login`
Login as staff member.

**Request:**
```json
{
  "email": "john@university.edu",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": { ... }
}
```

### Staff Endpoints

#### GET `/api/staff/search`
Search for staff members.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)
- `search` - Search query
- `faculty` - Filter by faculty
- `department` - Filter by department
- `designation` - Filter by designation
- `sortBy` - Sort field (default: fullName)
- `sortOrder` - asc or desc

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Admin Endpoints

All admin endpoints require authentication via JWT token.

#### POST `/api/admin/auth/login`
Admin login.

#### GET `/api/admin/analytics`
Get dashboard analytics.

#### GET `/api/admin/staff`
List all staff with filters.

#### PATCH `/api/admin/staff`
Approve or reject staff registration.

**Request:**
```json
{
  "id": "staff-id",
  "action": "approve" // or "reject"
}
```

## 🔐 Security Features

- **Password Hashing** - bcrypt with 12 rounds
- **JWT Authentication** - Secure token-based auth
- **HTTP-Only Cookies** - Prevent XSS attacks
- **Input Validation** - Zod schema validation
- **CSRF Protection** - Built into SvelteKit
- **SQL Injection Prevention** - Mongoose ORM
- **Action Logging** - Track all admin actions
- **Role-Based Access Control** - Admin and super-admin roles

## 🧪 Testing

### Run Tests
```bash
bun test
# or
npm test
```

### E2E Tests with Playwright
```bash
bun test:e2e
# or
npx playwright test
```

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure Environment Variables**
   In Vercel dashboard, add all variables from `.env`

5. **Done!** Your app is now live.

### Environment Variables for Production

Make sure to set these in Vercel:
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong random secret
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Email config
- `ADMIN_EMAIL` - Admin notification email
- `PUBLIC_APP_URL` - Your production URL

## 📝 Development Notes

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write descriptive commit messages
- Add comments for complex logic

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature-name
```

### Database Backups

The system includes automatic backup functionality. Configure in `.env`:
```env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 0 * * 0  # Every Sunday at midnight
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **SvelteKit Team** - Amazing framework
- **Tailwind Labs** - Beautiful styling system
- **Shadcn** - Excellent component library
- **MongoDB** - Powerful database

## 📞 Support

For issues, questions, or contributions:
- **Email:** support@university.edu
- **GitHub Issues:** [Create an issue](https://github.com/yourusername/university-staff-directory/issues)

---

**Built with ❤️ for modern university administration**
