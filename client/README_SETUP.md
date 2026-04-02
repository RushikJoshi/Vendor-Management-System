# Vendor Management System - Frontend

A production-grade SaaS-style vendor management dashboard built with **React + Vite + Tailwind CSS + React Router**.

## ✨ Features

- **Role-Based Access Control**: Separate dashboards for Admin and Vendors
- **Modern UI**: Clean, professional SaaS-style design with Tailwind CSS
- **Responsive Layout**: Mobile-friendly sidebar navigation and grid layouts
- **Real-time Notifications**: Toast notifications for user feedback
- **JWT Authentication**: Secure token-based auth with localStorage
- **Form Validation**: Reusable form components with validation
- **File Upload**: Document upload with preview capability
- **Data Tables**: Responsive tables with badge status indicators

## 🗂️ Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── FormInput.jsx
│   │   ├── Loader.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Table.jsx
│   │   └── Badge.jsx
│   ├── context/
│   │   └── AuthContext.jsx  # Global auth state
│   ├── layouts/
│   │   ├── AdminLayout.jsx  # Admin dashboard layout
│   │   ├── VendorLayout.jsx # Vendor dashboard layout
│   │   └── PublicLayout.jsx # Public pages layout
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   └── VendorRegister.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Vendors.jsx
│   │   │   ├── Pending.jsx
│   │   │   ├── Messages.jsx
│   │   │   └── VendorDetailsModal.jsx
│   │   └── vendor/
│   │       ├── Dashboard.jsx
│   │       ├── Profile.jsx
│   │       ├── Documents.jsx
│   │       └── Messages.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── services/
│   │   └── api.js          # Axios instance with interceptors
│   ├── App.jsx             # Main routing
│   ├── index.css           # Global styles + Tailwind
│   └── main.jsx
├── .env                     # Environment variables
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

## 🔧 Configuration

### Environment Variables (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### API Integration

The frontend connects to the backend API at `http://localhost:5000/api`. All requests include JWT tokens via axios interceptors:

```javascript
// services/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## 📱 Pages & Routes

### Public Routes
- `/` - Landing page with hero and CTAs
- `/login` - Login page
- `/register` - Vendor registration

### Admin Routes (Protected)
- `/admin/dashboard` - Overview with stats
- `/admin/vendors` - Vendor list with approve/reject actions
- `/admin/pending` - Pending approvals
- `/admin/messages` - Inquiry messages

### Vendor Routes (Protected)
- `/vendor/dashboard` - Welcome & status overview
- `/vendor/profile` - Edit company profile
- `/vendor/documents` - Upload & manage documents
- `/vendor/messages` - View admin messages & replies

## 🎨 Tailwind CSS Setup

Tailwind is pre-configured with:
- Full responsive design support (mobile-first)
- Custom color palette
- Extended utilities
- Form styling with `@tailwindcss/forms`

## 🔐 Authentication Flow

1. User logs in with email/password
2. Backend returns JWT token + role
3. Token stored in localStorage
4. Token automatically added to API headers
5. ProtectedRoute checks role before rendering
6. On logout, token cleared and user redirected to login

```javascript
// context/AuthContext.jsx
const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  const { token, role } = res.data;
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  // redirect based on role
};
```

## 📊 Key Components

### FormInput
Reusable input component with labels and Tailwind styling:
```jsx
<FormInput 
  label="Email" 
  type="email" 
  value={email} 
  onChange={handleChange} 
/>
```

### Modal
Overlay modal for details and actions:
```jsx
<Modal open={isOpen} onClose={closeModal} title="Vendor Details">
  {/* Modal content */}
</Modal>
```

### Table
Responsive data table with custom row rendering:
```jsx
<Table 
  headers={["Company", "Email", "Status"]}
  data={vendors}
  renderRow={(vendor) => (
    <>
      <td>{vendor.companyName}</td>
      <td>{vendor.email}</td>
      <td><Badge type="success">{vendor.status}</Badge></td>
    </>
  )}
/>
```

### Badge
Status badge with color coding:
```jsx
<Badge type="success">Approved</Badge>  {/* green */}
<Badge type="pending">Pending</Badge>  {/* yellow */}
<Badge type="danger">Rejected</Badge>  {/* red */}
```

## 📢 Notifications

Using `react-toastify` for toast notifications:

```javascript
import { toast } from "react-toastify";

// Success
toast.success("Action completed!");

// Error
toast.error("Something went wrong");

// Info
toast.info("Please note this");

// Warning
toast.warning("Be careful");
```

## 🎯 Admin Dashboard Features

- **Stats Cards**: Total vendors, pending approvals, approved count
- **Vendor Table**: Search, filter, view details
- **Actions**: Approve, reject, send inquiry emails
- **Vendor Modal**: Full vendor information with document preview
- **Messages**: View and reply to vendor inquiries

## 🎯 Vendor Dashboard Features

- **Status Display**: Current approval status
- **Profile Management**: Edit company information
- **Document Upload**: Upload certificates and documents
- **Messaging**: Receive and reply to admin inquiries
- **Recent Activity**: Overview of recent messages

## 🛠️ Development Tips

### Hot Module Replacement (HMR)
Changes are automatically reflected in the browser during development.

### Debugging
Use browser DevTools to inspect components with React DevTools extension.

### API Testing
The `.env` file can be modified to point to different API endpoints for testing.

### Component Reusability
All components are designed to be reusable with props configuration:
```jsx
<Button className="bg-red-500 hover:bg-red-600">Delete</Button>
<Card className="border-2 border-blue-500">Custom Card</Card>
```

## 📦 Dependencies

- **React** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS
- **React Toastify** - Toast notifications
- **Vite** - Build tool

## 🚀 Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel
```

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is in use, Vite will use the next available port.

### API Connection Issues
- Verify backend is running on `http://localhost:5000`
- Check `.env` API_URL configuration
- Check browser console for network errors

### Token Issues
- Clear localStorage: `localStorage.clear()`
- Refresh the page
- Re-login

## 📄 License

MIT

---

**Built with ❤️ for production-grade vendor management**
