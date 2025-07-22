# RBAC System - Role-Based Access Control Application

A comprehensive Role-Based Access Control (RBAC) system built with Next.js 15, Supabase, and TypeScript. This application demonstrates a three-tier user hierarchy with super users, admins, and employees.

## 🚀 Features

### User Roles

**Super User**
- Manage system-wide admins
- Create and manage modules that organizations can purchase
- Control module visibility and operations
- View all organizations and system analytics
- Complete system administration

**Admin**
- Set up and manage organizations
- Add and remove employees
- Purchase and manage organization modules
- Assign module access to employees
- Organization-level administration

**Employee**
- Access assigned modules for work
- View organization information
- Use purchased modules based on permissions

### Key Features

- 🔐 **Authentication & Authorization**: Complete auth system with role-based routing
- 🏢 **Multi-tenant Organization**: Each admin manages their own organization
- 📦 **Module System**: Modular functionality that can be purchased and assigned
- 🛡️ **Row Level Security**: Comprehensive RLS policies in Supabase
- 📱 **Responsive Design**: Modern UI with Tailwind CSS and Shadcn components
- ⚡ **Real-time Updates**: Live data synchronization with Supabase
- 🔄 **Middleware Protection**: Route protection based on user roles

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Styling**: Tailwind CSS v4, Shadcn UI, Radix UI
- **Forms**: React Hook Form, Zod validation
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- A Supabase account
- Git

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key from the project settings
   - Create a `.env.local` file based on `env.example`:
     ```bash
     cp env.example .env.local
     ```
   - Update the values in `.env.local` with your Supabase credentials

4. **Set up the database**
   - In your Supabase dashboard, go to the SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL to create tables, RLS policies, and sample data

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - You'll be redirected to the login page

## 👥 User Setup

### Creating Your First Super User

After setting up the database, you'll need to manually create your first super user:

1. **Register a new account** through the application
2. **Update the user role** in Supabase:
   - Go to your Supabase dashboard > Table Editor > users table
   - Find your user record and change the `role` from `employee` to `super_user`
3. **Log out and log back in** to access super user features

### Test Users

Once you have a super user account, you can:
- Create admin accounts through the super user dashboard
- Admins can create organizations and add employees
- Employees get module access assigned by their admin

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Role-based dashboards
│   │   ├── super/         # Super user pages
│   │   ├── admin/         # Admin pages
│   │   └── employee/      # Employee pages
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── auth/              # Authentication forms
│   ├── layout/            # Layout components
│   ├── modules/           # Module management
│   └── ui/               # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication helpers
│   ├── database.types.ts # TypeScript types
│   └── supabase/         # Supabase client setup
└── middleware.ts          # Route protection middleware
```

## 🗄️ Database Schema

### Core Tables

- **users**: Extended user profiles with roles and organization links
- **organizations**: Company/organization entities managed by admins  
- **modules**: Available system modules that can be purchased
- **organization_modules**: Purchased modules per organization
- **employees**: Employee records linking users to organizations
- **user_module_access**: Individual module access permissions

### Security

- Row Level Security (RLS) enabled on all tables
- Comprehensive policies ensuring users only access their data
- Role-based access control at the database level
- Secure user registration with automatic profile creation

## 🔐 Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access control with three user levels
- **Route Protection**: Middleware ensuring proper access to pages
- **Database Security**: RLS policies preventing unauthorized data access
- **Input Validation**: Form validation with Zod schemas

## 🎯 Key Functionality

### Module System
- Super users create modules with features and pricing
- Organizations purchase modules through admins
- Admins assign module access to specific employees
- Employees access only their assigned modules

### Organization Management
- Admins create and manage their organizations
- Employee invitation and role assignment
- Module purchasing and access control
- Organization-scoped data isolation

### Dashboard Analytics
- Role-specific dashboards with relevant metrics
- Real-time data updates
- Quick action panels for common tasks
- System status monitoring

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add your environment variables in Vercel settings
   - Deploy automatically

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Railway
- Heroku
- DigitalOcean
- AWS
- Google Cloud

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Functional components with hooks
- Server Components where possible for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the Supabase setup in `supabase-schema.sql`

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Shadcn UI](https://ui.shadcn.com) for beautiful components
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Lucide](https://lucide.dev) for icons
- [Next.js](https://nextjs.org) team for the amazing framework

---

Built with ❤️ using modern web technologies
