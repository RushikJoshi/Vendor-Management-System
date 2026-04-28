import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import VendorLayout from "./layouts/VendorLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
// Legacy Register removed in favor of RegistrationWizard

import VendorDashboard from "./pages/vendor/Dashboard";
import ChangePassword from "./pages/vendor/ChangePassword";
import MyRFQs from "./pages/vendor/MyRFQs";
import SubmitQuotation from "./pages/vendor/SubmitQuotation";
import Profile from "./pages/vendor/Profile";
import MyContracts from "./pages/vendor/MyContracts";
import ContractDetail from "./pages/vendor/ContractDetail";


import RegistrationWizard from "./pages/public/RegistrationWizard";
import RegistrationSuccess from "./pages/public/RegistrationSuccess";
import PublicFormPage from "./pages/public/PublicFormPage";
import SaaSDashboard from "./pages/admin/SaaSDashboard";
import RFQs from "./pages/admin/RFQs";
import Contracts from "./pages/admin/Contracts";
import DashboardAnalytics from "./pages/admin/DashboardAnalytics";
import UserManagement from "./pages/admin/UserManagement";
import RoleManagement from "./pages/admin/RoleManagement";
import Settings from "./pages/admin/Settings";
import AuditLogs from "./pages/admin/AuditLogs";
import Applications from "./pages/admin/Applications";
import Vendors from "./pages/admin/Vendors";
import AccessDenied from "./pages/AccessDenied";
import TreeFormBuilder from "./pages/admin/TreeFormBuilder";
import TreeSubmissions from "./pages/admin/TreeSubmissions";
import TreeSubmissionDetail from "./pages/admin/TreeSubmissionDetail";
import TreeFormRenderer from "./pages/public/TreeFormRenderer";
import QuotationsComparison from "./pages/admin/QuotationsComparison";
import AddVendor from "./pages/admin/AddVendor";
import ManageVendor from "./pages/admin/ManageVendor";
import CreateRFQ from "./pages/admin/CreateRFQ";
import CreateContract from "./pages/admin/CreateContract";
import CreateUser from "./pages/admin/CreateUser";
import Categories from "./pages/admin/Categories";
import CategoryForm from "./pages/admin/CategoryForm";
import CategoryDetail from "./pages/admin/CategoryDetail";




import { NotificationProvider } from "./context/NotificationContext";
import { ProcurementProvider } from "./context/ProcurementContext";
import { Toaster } from "react-hot-toast";
import ProcurementHub from "./pages/admin/ProcurementHub";
import VendorProcurementDesk from "./pages/vendor/VendorProcurementDesk";
import CreateInvoice from "./pages/vendor/CreateInvoice";
import UpdateShipment from "./pages/vendor/UpdateShipment";
import PurchaseOrderDetail from "./pages/admin/PurchaseOrderDetail";
import ServiceOrders from "./pages/admin/ServiceOrders";
import PaymentCheckout from "./pages/admin/PaymentCheckout";
import ProcurementSettings from "./pages/admin/ProcurementSettings";
import AdminDeliveries from "./pages/admin/AdminDeliveries";

import AboutUs from "./pages/public/AboutUs";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ProcurementProvider>
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
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegistrationWizard />} />
            <Route path="/register/:formId" element={<RegistrationWizard />} />
            <Route path="/vendor/register" element={<RegistrationWizard />} />
            <Route path="/vendor/register/:categoryId" element={<RegistrationWizard />} />
            <Route path="/onboarding" element={<RegistrationWizard />} />
            <Route path="/onboarding/:formId" element={<RegistrationWizard />} />
            <Route path="/success" element={<RegistrationSuccess />} />
            <Route path="/form/:id" element={<PublicFormPage />} />
            <Route path="/tree-form/:id" element={<TreeFormRenderer />} />
          </Route>

          {/* admin / internal — requires 'manager' level or higher to enter the layout */}
          {/* admin / internal — admin/hr/manager exclusively */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role={["admin", "hr", "sales", "finance", "procurement", "viewer"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ProtectedRoute module="dashboard"><SaaSDashboard /></ProtectedRoute>} />
            <Route path="vendor-forms" element={<ProtectedRoute module="vendor_forms"><TreeFormBuilder /></ProtectedRoute>} />
            <Route path="submissions" element={<ProtectedRoute module="submissions"><TreeSubmissions /></ProtectedRoute>} />
            <Route path="submissions/:id" element={<ProtectedRoute module="submissions"><TreeSubmissionDetail /></ProtectedRoute>} />
            <Route path="rfqs" element={<ProtectedRoute module="rfq"><RFQs /></ProtectedRoute>} />
            <Route path="rfqs/create" element={<ProtectedRoute module="rfq"><CreateRFQ /></ProtectedRoute>} />
            <Route path="rfqs/:id/compare" element={<ProtectedRoute module="rfq"><QuotationsComparison /></ProtectedRoute>} />
            <Route path="contracts" element={<ProtectedRoute module="contracts"><Contracts /></ProtectedRoute>} />
            <Route path="procurement" element={<ProtectedRoute module="procurement"><ProcurementHub /></ProtectedRoute>} />
            <Route path="procurement/service-orders" element={<ProtectedRoute module="procurement"><ServiceOrders /></ProtectedRoute>} />
            <Route path="procurement/settings" element={<ProtectedRoute module="procurement"><ProcurementSettings /></ProtectedRoute>} />
            <Route path="procurement/po/:id" element={<ProtectedRoute module="procurement"><PurchaseOrderDetail /></ProtectedRoute>} />
            <Route path="procurement/payment/:id" element={<ProtectedRoute module="procurement"><PaymentCheckout /></ProtectedRoute>} />
            <Route path="procurement/shipments" element={<ProtectedRoute module="procurement"><AdminDeliveries /></ProtectedRoute>} />
            <Route path="contracts/create" element={<ProtectedRoute module="contracts"><CreateContract /></ProtectedRoute>} />
            <Route path="contracts/:id/edit" element={<ProtectedRoute module="contracts"><CreateContract /></ProtectedRoute>} />
            <Route path="applications" element={<ProtectedRoute module="applications"><Applications /></ProtectedRoute>} />
            <Route path="vendors" element={<ProtectedRoute module="vendors"><Vendors /></ProtectedRoute>} />
            <Route path="vendors/add" element={<ProtectedRoute module="vendors"><AddVendor /></ProtectedRoute>} />
            <Route path="vendors/:id" element={<ProtectedRoute module="vendors"><ManageVendor /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute module="analytics"><DashboardAnalytics /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute module="users"><UserManagement /></ProtectedRoute>} />
            <Route path="users/create" element={<ProtectedRoute module="users"><CreateUser /></ProtectedRoute>} />
            <Route path="users/:id/edit" element={<ProtectedRoute module="users"><CreateUser /></ProtectedRoute>} />
            <Route path="roles" element={<ProtectedRoute module="roles"><RoleManagement /></ProtectedRoute>} />
            <Route path="categories" element={<ProtectedRoute module="vendor_forms"><Categories /></ProtectedRoute>} />
            <Route path="categories/create" element={<ProtectedRoute module="vendor_forms"><CategoryForm /></ProtectedRoute>} />
            <Route path="categories/:id" element={<ProtectedRoute module="vendor_forms"><CategoryDetail /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute module="users"><Settings /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute module="settings"><Settings /></ProtectedRoute>} />
            <Route path="audit-logs" element={<ProtectedRoute module="analytics"><AuditLogs /></ProtectedRoute>} />
            <Route path="vrs/form-builder" element={<Navigate to="/admin/vendor-forms" replace />} />
            <Route path="vrs/submissions" element={<Navigate to="/admin/submissions" replace />} />
            <Route path="vrs/submissions/:id" element={<Navigate to="/admin/submissions" replace />} />
            <Route path="tree-form-builder" element={<Navigate to="/admin/vendor-forms" replace />} />
            <Route path="tree-submissions" element={<Navigate to="/admin/submissions" replace />} />
            <Route path="tree-submissions/:id" element={<Navigate to="/admin/submissions" replace />} />
            <Route path="categories" element={<Navigate to="/admin/vendor-forms" replace />} />
            <Route path="form-builder" element={<Navigate to="/admin/vendor-forms" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />

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
            <Route path="rfqs" element={<ProtectedRoute anyPermission="vendor_rfq_view"><MyRFQs /></ProtectedRoute>} />
            <Route path="submit-quotation" element={<ProtectedRoute anyPermission="vendor_quote_submit"><SubmitQuotation /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute anyPermission="vendor_dashboard"><Profile /></ProtectedRoute>} />
            <Route path="contracts" element={<ProtectedRoute anyPermission="vendor_dashboard"><MyContracts /></ProtectedRoute>} />
            <Route path="contracts/:id" element={<ProtectedRoute anyPermission="vendor_dashboard"><ContractDetail /></ProtectedRoute>} />
            <Route path="procurement" element={<ProtectedRoute anyPermission="vendor_dashboard"><VendorProcurementDesk /></ProtectedRoute>} />
            <Route path="procurement/invoice/new" element={<ProtectedRoute anyPermission="vendor_dashboard"><CreateInvoice /></ProtectedRoute>} />
            <Route path="procurement/shipment/update" element={<ProtectedRoute anyPermission="vendor_dashboard"><UpdateShipment /></ProtectedRoute>} />
            <Route path="procurement/po/:id" element={<ProtectedRoute anyPermission="vendor_dashboard"><PurchaseOrderDetail /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/vendor/dashboard" replace />} />

          </Route>

          <Route path="/access-denied" element={<AccessDenied />} />


          {/* Change password — only needs valid token (not full vendor route guard) */}
          <Route path="/vendor/change-password" element={
            <ProtectedRoute requiredRole="vendor"><ChangePassword /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </ProcurementProvider>
        </NotificationProvider>
      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;
