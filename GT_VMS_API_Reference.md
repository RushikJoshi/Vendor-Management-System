# GT Vendor Management System — Complete API Reference

> **Base URL:** `http://localhost:5000`  
> **Versioned Base:** `/api/v1` (or `/api` — both work, backward compatible)  
> **Auth Header:** `Authorization: Bearer <JWT_TOKEN>`  
> **Content-Type:** `application/json`

---

## 🔐 1. AUTH APIs
**Base:** `/api/auth`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | `POST` | `/api/auth/register` | ❌ Public | New user register |
| 2 | `POST` | `/api/auth/onboard` | ❌ Public | Company onboard karo |
| 3 | `POST` | `/api/auth/login` | ❌ Public | Login (JWT milega) |
| 4 | `POST` | `/api/auth/refresh` | ❌ Public | Token refresh |
| 5 | `POST` | `/api/auth/logout` | ❌ Public | Logout |
| 6 | `POST` | `/api/auth/change-password` | ✅ JWT | Password change karo |
| 7 | `GET` | `/api/auth/me` | ✅ JWT | Apna profile dekho |
| 8 | `GET` | `/api/auth/permissions` | ✅ JWT | Apni permissions dekho |

---

## 🏪 2. VENDOR APIs
**Base:** `/api/vendors`

| # | Method | Endpoint | Auth | Roles | Description |
|---|--------|----------|------|-------|-------------|
| 9 | `GET` | `/api/vendors/gst-profile/:gstNumber` | ✅ JWT | admin, hr | GST se vendor info lookup |
| 10 | `GET` | `/api/vendors/me` | ✅ JWT | vendor | Apna vendor profile |
| 11 | `GET` | `/api/vendors/me/stats` | ✅ JWT | vendor | Apna dashboard stats |
| 12 | `PUT` | `/api/vendors/me` | ✅ JWT | vendor | Apna profile update |
| 13 | `GET` | `/api/vendors` | ✅ JWT | admin, hr, manager | Saare vendors ki list |
| 14 | `POST` | `/api/vendors` | ✅ JWT | admin, hr | Naya vendor create |
| 15 | `GET` | `/api/vendors/:id` | ✅ JWT | admin, hr, manager, vendor | Single vendor dekho |
| 16 | `PATCH` | `/api/vendors/:id` | ✅ JWT | admin, hr | Vendor update |
| 17 | `DELETE` | `/api/vendors/:id` | ✅ JWT | admin, hr | Vendor delete |
| 18 | `GET` | `/api/vendors/:id/performance` | ✅ JWT | admin, hr, manager | Vendor performance |
| 19 | `POST` | `/api/vendors/:id/remind-payment` | ✅ JWT | admin, hr | Payment reminder email |
| 20 | `PUT` | `/api/vendors/:id/upload-gst` | ✅ JWT | admin, hr | GST certificate upload |
| 21 | `PUT` | `/api/vendors/:id/upload-agreement` | ✅ JWT | admin, hr | Agreement file upload |

---

## 👑 3. ADMIN APIs
**Base:** `/api/admin`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 22 | `GET` | `/api/admin/stats` | ✅ JWT | Dashboard stats |
| 23 | `GET` | `/api/admin/messages` | ✅ JWT | Messages list |
| 24 | `GET` | `/api/admin/vendors` | ✅ JWT | Vendor list (admin view) |
| 25 | `GET` | `/api/admin/vendors/export` | ✅ JWT | Vendors export |
| 26 | `POST` | `/api/admin/vendors/import` | ✅ JWT | Vendors import (file upload) |
| 27 | `PATCH` | `/api/admin/vendors/:id/status` | ✅ JWT | Vendor status update |
| 28 | `DELETE` | `/api/admin/vendors/:id` | ✅ JWT | Vendor delete |
| 29 | `POST` | `/api/admin/inquiry` | ✅ JWT | Inquiry bhejo |
| 30 | `GET` | `/api/admin/audit-logs` | ✅ JWT | Audit logs dekho |
| 31 | `GET` | `/api/admin/analytics` | ✅ JWT | Analytics data |

---

## 📋 4. RFQ APIs
**Base:** `/api/rfqs`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 32 | `GET` | `/api/rfqs` | ✅ JWT | RFQ list |
| 33 | `POST` | `/api/rfqs` | ✅ JWT | Naya RFQ banao |
| 34 | `GET` | `/api/rfqs/:id` | ✅ JWT | Single RFQ details |
| 35 | `PATCH` | `/api/rfqs/:id` | ✅ JWT | RFQ update |
| 36 | `PATCH` | `/api/rfqs/:id/status` | ✅ JWT | RFQ status change |
| 37 | `POST` | `/api/rfqs/:id/review` | ✅ JWT | RFQ review/approve |
| 38 | `POST` | `/api/rfqs/:id/send` | ✅ JWT | RFQ vendors ko bhejo |

---

## 💰 5. QUOTATION APIs
**Base:** `/api/quotations`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 39 | `POST` | `/api/quotations` | ✅ JWT | Quotation submit karo |
| 40 | `GET` | `/api/quotations/rfq/:rfqId` | ✅ JWT | RFQ ke liye quotations |
| 41 | `POST` | `/api/quotations/:id/accept` | ✅ JWT | Quotation accept |
| 42 | `POST` | `/api/quotations/:id/reject` | ✅ JWT | Quotation reject |

---

## 📦 6. PURCHASE ORDER APIs
**Base:** `/api/purchase-orders`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 43 | `GET` | `/api/purchase-orders` | ✅ JWT | PO list |
| 44 | `POST` | `/api/purchase-orders` | ✅ JWT | Naya PO banao |
| 45 | `GET` | `/api/purchase-orders/:id` | ✅ JWT | Single PO dekho |
| 46 | `GET` | `/api/purchase-orders/regenerate-all` | ✅ JWT | Saare PO regenerate |

---

## 🛠️ 7. SERVICE ORDER APIs
**Base:** `/api/service-orders`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 47 | `GET` | `/api/service-orders` | ✅ JWT | SO list |
| 48 | `POST` | `/api/service-orders` | ✅ JWT | Naya SO banao |

---

## 🛒 8. PROCUREMENT (Full Workflow) APIs
**Base:** `/api/procurement`

| # | Method | Endpoint | Auth | Roles | Description |
|---|--------|----------|------|-------|-------------|
| 49 | `GET` | `/api/procurement/overview` | ✅ JWT | admin, procurement, finance, hr | Dashboard overview stats |
| 50 | `GET` | `/api/procurement/purchase-requests` | ✅ JWT | admin, procurement, finance, hr | PR list |
| 51 | `POST` | `/api/procurement/purchase-requests` | ✅ JWT | admin, procurement, hr | Naya PR banao |
| 52 | `PATCH` | `/api/procurement/purchase-requests/:id/approve` | ✅ JWT | admin, procurement, finance | PR approve/reject |
| 53 | `POST` | `/api/procurement/purchase-requests/:id/convert-to-rfq` | ✅ JWT | admin, procurement | PR se RFQ banao |
| 54 | `GET` | `/api/procurement/rfqs/:rfqId/quotation-comparison` | ✅ JWT | admin, procurement, finance | Quotation comparison matrix |
| 55 | `POST` | `/api/procurement/quotations/:quotationId/select` | ✅ JWT | admin, procurement | Vendor select karo (PO auto-create) |
| 56 | `GET` | `/api/procurement/purchase-orders` | ✅ JWT | admin, procurement, finance, vendor | PO list |
| 57 | `GET` | `/api/procurement/service-orders` | ✅ JWT | admin, procurement, finance, vendor | SO list |
| 58 | `PATCH` | `/api/procurement/purchase-orders/:id/accept` | ✅ JWT | **vendor only** | PO accept karo |
| 59 | `PATCH` | `/api/procurement/purchase-orders/:id/reject` | ✅ JWT | **vendor only** | PO reject karo |
| 60 | `GET` | `/api/procurement/deliveries` | ✅ JWT | admin, procurement, finance, vendor | Deliveries list |
| 61 | `POST` | `/api/procurement/deliveries` | ✅ JWT | admin, procurement, vendor | Delivery create/update |
| 62 | `GET` | `/api/procurement/invoices` | ✅ JWT | admin, procurement, finance, vendor | Invoice list |
| 63 | `POST` | `/api/procurement/invoices` | ✅ JWT | admin, procurement, vendor | Naya invoice banao |
| 64 | `PATCH` | `/api/procurement/invoices/:invoiceId/review` | ✅ JWT | admin, finance | Invoice approve/reject |
| 65 | `POST` | `/api/procurement/invoices/:invoiceId/pay` | ✅ JWT | admin, finance | Invoice payment process |
| 66 | `GET` | `/api/procurement/payments` | ✅ JWT | admin, finance, procurement, vendor | Payments list |
| 67 | `GET` | `/api/procurement/sla-breaches` | ✅ JWT | admin, procurement, finance | SLA breaches list |
| 68 | `GET` | `/api/procurement/vendor-statement/:vendorId` | ✅ JWT | admin, procurement, finance | Vendor ka statement (admin) |
| 69 | `GET` | `/api/procurement/vendor-payments` | ✅ JWT | **vendor only** | Vendor ki apni payments |
| 70 | `GET` | `/api/procurement/vendor-statement` | ✅ JWT | **vendor only** | Vendor ka apna statement |
| 71 | `GET` | `/api/procurement/comments/all` | ✅ JWT | admin, procurement, finance | Saare comments |
| 72 | `POST` | `/api/procurement/comments` | ✅ JWT | admin, procurement, finance, vendor | Comment add karo |
| 73 | `GET` | `/api/procurement/comments/:targetModel/:targetId` | ✅ JWT | admin, procurement, finance, vendor | Entity ke comments |

---

## 📁 9. APPLICATIONS APIs
**Base:** `/api/applications`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 74 | `POST` | `/api/applications/submit` | ❌ Public | Application submit (file upload) |
| 75 | `POST` | `/api/applications/:id/finalize` | ❌ Public | Application finalize |
| 76 | `GET` | `/api/applications/state/:email` | ❌ Public | Email se application state |
| 77 | `GET` | `/api/applications/check-email` | ❌ Public | Email check |
| 78 | `GET` | `/api/applications` | ✅ JWT | admin, hr | Saari applications |
| 79 | `GET` | `/api/applications/:id` | ✅ JWT | admin, hr, vendor | Single application |
| 80 | `PATCH` | `/api/applications/:id/approve-stage` | ✅ JWT | admin, hr | Approval stage process |
| 81 | `POST` | `/api/applications/:id/approve` | ✅ JWT | admin, hr | Application approve |
| 82 | `POST` | `/api/applications/:id/reject` | ✅ JWT | admin, hr | Application reject |

---

## 📝 10. FORMS APIs
**Base:** `/api/forms`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 83 | `GET` | `/api/forms/master/public` | ❌ Public | Master form public |
| 84 | `GET` | `/api/forms/published` | ❌ Public | Published forms list |
| 85 | `GET` | `/api/forms/public/:categoryId` | ❌ Public | Category se public form |
| 86 | `GET` | `/api/forms/single/public/:id` | ❌ Public | Single public form |
| 87 | `GET` | `/api/forms/:formId/public` | ❌ Public | Form public view |
| 88 | `POST` | `/api/forms/:formId/submit` | ❌ Public | Form submit (file upload) |
| 89 | `GET` | `/api/forms` | ✅ JWT | admin | Form templates list |
| 90 | `GET` | `/api/forms/templates` | ✅ JWT | admin | Templates |
| 91 | `POST` | `/api/forms` | ✅ JWT | admin | Form save |
| 92 | `POST` | `/api/forms/builder` | ✅ JWT | admin | Form builder create |
| 93 | `GET` | `/api/forms/builder/all` | ✅ JWT | admin | All builder forms |
| 94 | `GET` | `/api/forms/builder/:formId` | ✅ JWT | admin | Single builder form |
| 95 | `PUT` | `/api/forms/builder/:formId` | ✅ JWT | admin | Builder form update |
| 96 | `POST` | `/api/forms/builder/:formId/publish` | ✅ JWT | admin | Form publish |
| 97 | `POST` | `/api/forms/builder/:formId/unpublish` | ✅ JWT | admin | Form unpublish |
| 98 | `POST` | `/api/forms/builder/:formId/copy` | ✅ JWT | admin | Form copy |
| 99 | `GET` | `/api/forms/builder/:formId/preview` | ✅ JWT | admin | Form preview |
| 100 | `POST` | `/api/forms/:id/publish` | ✅ JWT | admin | Form publish (legacy) |
| 101 | `PATCH` | `/api/forms/:id/archive` | ✅ JWT | admin | Form archive |
| 102 | `POST` | `/api/forms/seed/enterprise` | ✅ JWT | admin | Enterprise templates seed |

---

## 🌳 11. TREE FORM APIs
**Base:** `/api/form`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 103 | `POST` | `/api/form/create` | ✅ JWT | admin | Tree form create |
| 104 | `POST` | `/api/form/create-default` | ✅ JWT | admin | Default tree form |
| 105 | `PUT` | `/api/form/:id` | ✅ JWT | admin | Tree form update |
| 106 | `GET` | `/api/form/all` | ✅ JWT | admin | Saare tree forms |
| 107 | `POST` | `/api/form/submit` | ❌ Public | Form submit (file upload) |
| 108 | `POST` | `/api/form/autofill/gst` | ❌ Public | GST autofill |
| 109 | `POST` | `/api/form/autofill/ifsc` | ❌ Public | IFSC autofill |
| 110 | `GET` | `/api/form/:id` | ❌ Public | Form dekho by ID |

---

## 📬 12. TREE SUBMISSION APIs
**Base:** `/api/submission`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 111 | `GET` | `/api/submission/all` | ✅ JWT | admin, hr | Saari submissions |
| 112 | `GET` | `/api/submission/:id` | ✅ JWT | admin, hr | Single submission |
| 113 | `POST` | `/api/submission/approve` | ✅ JWT | admin | Submission approve |

---

## 📩 13. SUBMISSION APIs (Legacy)
**Base:** `/api/submissions`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 114 | `GET` | `/api/submissions/vendor/dashboard` | ✅ JWT | vendor | Vendor dashboard |
| 115 | `GET` | `/api/submissions` | ✅ JWT | admin | Saari submissions |
| 116 | `GET` | `/api/submissions/:id` | ✅ JWT | admin | Single submission |
| 117 | `PATCH` | `/api/submissions/:id/review` | ✅ JWT | admin | Submission review |

---

## 📂 14. CATEGORY APIs
**Base:** `/api/categories`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 118 | `GET` | `/api/categories/public-list` | ❌ Public | Public categories list |
| 119 | `GET` | `/api/categories` | ✅ JWT | Categories list |
| 120 | `POST` | `/api/categories` | ✅ JWT | Naya category |
| 121 | `GET` | `/api/categories/:id` | ✅ JWT | Single category |
| 122 | `PUT` | `/api/categories/:id` | ✅ JWT | Category update |
| 123 | `DELETE` | `/api/categories/:id` | ✅ JWT | Category delete |

---

## 📜 15. CONTRACT APIs
**Base:** `/api/contracts`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 124 | `GET` | `/api/contracts` | ✅ JWT | Contracts list |
| 125 | `POST` | `/api/contracts` | ✅ JWT | Naya contract |
| 126 | `GET` | `/api/contracts/stats` | ✅ JWT | Contract stats |
| 127 | `GET` | `/api/contracts/:id` | ✅ JWT | Single contract |
| 128 | `PATCH` | `/api/contracts/:id` | ✅ JWT | Contract update |
| 129 | `PATCH` | `/api/contracts/:id/terminate` | ✅ JWT | Contract terminate |
| 130 | `DELETE` | `/api/contracts/:id` | ✅ JWT | Contract delete |
| 131 | `GET` | `/api/contracts/vendor/:vendorId` | ✅ JWT | Vendor ke contracts |

---

## 🔔 16. NOTIFICATION APIs
**Base:** `/api/notifications`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 132 | `GET` | `/api/notifications` | ✅ JWT | Apni notifications |
| 133 | `GET` | `/api/notifications/unread-count` | ✅ JWT | Unread count |
| 134 | `PATCH` | `/api/notifications/:id/read` | ✅ JWT | Mark as read |
| 135 | `PATCH` | `/api/notifications/read-all` | ✅ JWT | Sab mark as read |

---

## 📊 17. SLM (Supplier Lifecycle Management) APIs
**Base:** `/api/slm`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 136 | `GET` | `/api/slm/contracts` | ✅ JWT | SLM contracts list |
| 137 | `GET` | `/api/slm/contracts/stats` | ✅ JWT | SLM contract stats |
| 138 | `GET` | `/api/slm/contracts/:id` | ✅ JWT | Single SLM contract |
| 139 | `POST` | `/api/slm/contracts` | ✅ JWT | Naya SLM contract |
| 140 | `GET` | `/api/slm/contracts/vendor/:vendorId` | ✅ JWT | Vendor ke SLM contracts |
| 141 | `PATCH` | `/api/slm/contracts/:id` | ✅ JWT | SLM contract update |
| 142 | `PATCH` | `/api/slm/contracts/:id/terminate` | ✅ JWT | Contract terminate |
| 143 | `DELETE` | `/api/slm/contracts/:id` | ✅ JWT | Contract delete |
| 144 | `POST` | `/api/slm/performance/review` | ✅ JWT | Performance review submit |
| 145 | `GET` | `/api/slm/performance/vendor/:vendorId` | ✅ JWT | Vendor performance dekho |
| 146 | `PATCH` | `/api/slm/vendors/:id/lifecycle` | ✅ JWT | Vendor lifecycle status change |

---

## 👥 18. USER MANAGEMENT APIs
**Base:** `/api/users`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 147 | `GET` | `/api/users` | ✅ JWT | Users list |
| 148 | `POST` | `/api/users` | ✅ JWT | Naya user banao |
| 149 | `GET` | `/api/users/:id` | ✅ JWT | Single user |
| 150 | `PUT` | `/api/users/:id` | ✅ JWT | User update |
| 151 | `DELETE` | `/api/users/:id` | ✅ JWT | User delete |
| 152 | `PATCH` | `/api/users/:id/role` | ✅ JWT | User role change |
| 153 | `PATCH` | `/api/users/:id/status` | ✅ JWT | User status change |

---

## 🎭 19. ROLE & PERMISSION APIs
**Base:** `/api/roles`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 154 | `GET` | `/api/roles` | ✅ JWT | admin | Roles list |
| 155 | `POST` | `/api/roles` | ✅ JWT | admin | Naya role banao |
| 156 | `GET` | `/api/roles/permissions` | ✅ JWT | admin | All permissions list |
| 157 | `PUT` | `/api/roles/:id` | ✅ JWT | admin | Role update |
| 158 | `DELETE` | `/api/roles/:id` | ✅ JWT | admin | Role delete |

---

## 📨 20. INVITATION APIs
**Base:** `/api/invitations`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 159 | `GET` | `/api/invitations/verify/:token` | ❌ Public | Invitation verify |
| 160 | `GET` | `/api/invitations` | ✅ JWT | admin, manager | Invitations list |
| 161 | `POST` | `/api/invitations/send` | ✅ JWT | admin, manager | Invitation bhejo |

---

## 🏢 21. DEPARTMENT APIs
**Base:** `/api/departments`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 162 | `GET` | `/api/departments` | ✅ JWT | Departments list |
| 163 | `POST` | `/api/departments` | ✅ JWT | Naya department |

---

## 📊 22. DASHBOARD APIs
**Base:** `/api/dashboard`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 164 | `GET` | `/api/dashboard/vendor-stats` | ✅ JWT | Vendor dashboard stats |

---

## 📋 23. ACTIVITY LOG APIs
**Base:** `/api/activity-logs`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 165 | `GET` | `/api/activity-logs` | ✅ JWT | admin | Activity logs list |

---

## ⚙️ 24. PROCUREMENT SETTINGS APIs
**Base:** `/api/procurement-settings`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 166 | `GET` | `/api/procurement-settings` | ✅ JWT | Settings dekho |
| 167 | `PUT` | `/api/procurement-settings` | ✅ JWT | admin, procurement | Settings update |
| 168 | `GET` | `/api/procurement-settings/history` | ✅ JWT | Settings history |
| 169 | `POST` | `/api/procurement-settings/restore/:historyId` | ✅ JWT | History restore |

---

## 🤖 25. AI APIs
**Base:** `/api/category`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 170 | `POST` | `/api/category/generate-ai` | ❌ Public | AI se category generate |

---

## 🔍 26. HEALTH CHECK
| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 171 | `GET` | `/health` | ❌ Public | Server health check |

---

## 📌 Quick Summary

| Module | APIs Count |
|--------|-----------|
| Auth | 8 |
| Vendors | 13 |
| Admin | 10 |
| RFQs | 7 |
| Quotations | 4 |
| Purchase Orders | 4 |
| Service Orders | 2 |
| Procurement (Full) | 25 |
| Applications | 9 |
| Forms | 20 |
| Tree Forms | 8 |
| Tree Submissions | 3 |
| Submissions (Legacy) | 4 |
| Categories | 6 |
| Contracts | 8 |
| Notifications | 4 |
| SLM | 11 |
| User Management | 7 |
| Roles & Permissions | 5 |
| Invitations | 3 |
| Departments | 2 |
| Dashboard | 1 |
| Activity Logs | 1 |
| Procurement Settings | 4 |
| AI | 1 |
| Health | 1 |
| **TOTAL** | **~171** |
