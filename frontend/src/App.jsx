import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import VendorLayout from "./layouts/VendorLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
// Legacy Register removed in favor of RegistrationWizard

import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/admin/Vendors";
import Applications from "./pages/admin/Applications";
import FormBuilder from "./pages/admin/FormBuilder";
import AdminMessages from "./pages/admin/Messages";
import AuditLogs from "./pages/admin/AuditLogs";
import UserManagement from "./pages/admin/UserManagement";
import RoleManagement from "./pages/admin/RoleManagement";


import VendorDashboard from "./pages/vendor/Dashboard";
import VendorProfile from "./pages/vendor/Profile";
import VendorDocuments from "./pages/vendor/Documents";
import VendorMessages from "./pages/vendor/Messages";
import VendorApplications from "./pages/vendor/MyApplications";
import VendorFillForm from "./pages/vendor/FillForm";
import VendorRFQResponse from "./pages/vendor/RFQResponse";
import VendorContracts from "./pages/vendor/Contracts";
import ChangePassword from "./pages/vendor/ChangePassword";


import RegistrationWizard from "./pages/public/RegistrationWizard";
import RegistrationSuccess from "./pages/public/RegistrationSuccess";
import Categories from "./pages/admin/Categories";
import Invitations from "./pages/admin/Invitations";
import Contracts from "./pages/admin/Contracts";
import Settings from "./pages/admin/Settings";
import RFQs from "./pages/admin/RFQs";
import CreateRFQ from "./pages/admin/CreateRFQ";
import SaaSDashboard from "./pages/admin/SaaSDashboard";
import AccessDenied from "./pages/AccessDenied";


import { NotificationProvider } from "./context/NotificationContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'text-xs font-black uppercase tracking-widest',
              duration: 4000,
              style: {
                background: '#fff',
                color: '#363636',
                boxShadow: '0 20px 50px -15px rgba(0,0,0,0.15)',
                borderRadius: '16px',
                border: '1px solid #f3f4f6'
              },
            }}
          />
          <Routes>


          {/* public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegistrationWizard />} />
            <Route path="/vendor/register" element={<RegistrationWizard />} />
            <Route path="/vendor/register/:categoryId" element={<RegistrationWizard />} />
            <Route path="/onboarding" element={<RegistrationWizard />} />
            <Route path="/success" element={<RegistrationSuccess />} />
          </Route>

          {/* admin / internal — requires 'manager' level or higher to enter the layout */}
          {/* admin / internal — admin/hr/manager exclusively */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role={["admin", "hr", "manager"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<SaaSDashboard />} />
            <Route path="rfqs" element={<RFQs />} />
            <Route path="rfq/create" element={<CreateRFQ />} />
            <Route path="purchase-orders" element={<div>Purchase Orders</div>} />
            <Route path="departments" element={<div>Departments</div>} />
            <Route path="analytics" element={<Dashboard />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="categories" element={<Categories />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="applications" element={<Applications />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="form-builder" element={<FormBuilder />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="settings" element={<Settings />} />

          </Route>


          {/* vendor — vendor only exclusively */}
          <Route
            path="/vendor/*"
            element={
              <ProtectedRoute role="vendor">
                <VendorLayout />
              </ProtectedRoute>
            }
          >

            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="applications" element={<VendorApplications />} />
            <Route path="fill-form" element={<VendorFillForm />} />
            <Route path="rfqs" element={<VendorRFQResponse />} />
            <Route path="contracts" element={<VendorContracts />} />
            <Route path="profile" element={<VendorProfile />} />
            <Route path="documents" element={<VendorDocuments />} />
            <Route path="messages" element={<VendorMessages />} />

          </Route>

          <Route path="/access-denied" element={<AccessDenied />} />


          {/* Change password — only needs valid token (not full vendor route guard) */}
          <Route path="/vendor/change-password" element={
            <ProtectedRoute requiredRole="vendor"><ChangePassword /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </NotificationProvider>
      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;
