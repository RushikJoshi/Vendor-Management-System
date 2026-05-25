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
| 2 | `POST` | `/api/auth/onboard` | ❌ Public | Company onboard |
| 3 | `POST` | `/api/auth/login` | ❌ Public | Login (JWT milega) |
| 4 | `POST` | `/api/auth/refresh` | ❌ Public | Token refresh |
| 5 | `POST` | `/api/auth/logout` | ❌ Public | Logout |
| 6 | `POST` | `/api/auth/change-password` | ✅ JWT | Password change |
| 7 | `GET` | `/api/auth/me` | ✅ JWT | Apna profile |
| 8 | `GET` | `/api/auth/permissions` | ✅ JWT | Apni permissions |

---

## 🏪 2. VENDOR APIs
**Base:** `/api/vendors`

| # | Method | Endpoint | Auth | Roles | Description |
|---|--------|----------|------|-------|-------------|
| 9 | `GET` | `/api/vendors/gst-profile/:gstNumber` | ✅ JWT | admin, hr | GST se vendor info lookup |
| 10 | `GET` | `/api/vendors/me` | ✅ JWT | vendor | Apna vendor profile |
| 11 | `GET` | `/api/vendors/me/stats` | ✅ JWT | vendor | Apna dashboard stats |
| 12 | `PUT` | `/api/vendors/me` | ✅ JWT | vendor | Apna profile update |
| 13 | `GET` | `/api/vendors` | ✅ JWT | admin, hr, manager | Saare vendors |
| 14 | `POST` | `/api/vendors` | ✅ JWT | admin, hr | Naya vendor create |
| 15 | `GET` | `/api/vendors/:id` | ✅ JWT | admin, hr, manager, vendor | Single vendor |
| 16 | `PATCH` | `/api/vendors/:id` | ✅ JWT | admin, hr | Vendor update |
| 17 | `DELETE` | `/api/vendors/:id` | ✅ JWT | admin, hr | Vendor delete |
| 18 | `GET` | `/api/vendors/:id/performance` | ✅ JWT | admin, hr, manager | Performance report |
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
| 24 | `GET` | `/api/admin/vendors` | ✅ JWT | Vendor list |
| 25 | `GET` | `/api/admin/vendors/export` | ✅ JWT | Vendors export |
| 26 | `POST` | `/api/admin/vendors/import` | ✅ JWT | Vendors import (file) |
| 27 | `PATCH` | `/api/admin/vendors/:id/status` | ✅ JWT | Vendor status update |
| 28 | `DELETE` | `/api/admin/vendors/:id` | ✅ JWT | Vendor delete |
| 29 | `POST` | `/api/admin/inquiry` | ✅ JWT | Inquiry bhejo |
| 30 | `GET` | `/api/admin/audit-logs` | ✅ JWT | Audit logs |
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
| 39 | `POST` | `/api/quotations` | ✅ JWT | Quotation submit |
| 40 | `GET` | `/api/quotations/rfq/:rfqId` | ✅ JWT | RFQ ke quotations |
| 41 | `POST` | `/api/quotations/:id/accept` | ✅ JWT | Quotation accept |
| 42 | `POST` | `/api/quotations/:id/reject` | ✅ JWT | Quotation reject |

---

## 📦 6. PURCHASE ORDER APIs
**Base:** `/api/purchase-orders`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 43 | `GET` | `/api/purchase-orders` | ✅ JWT | PO list |
| 44 | `POST` | `/api/purchase-orders` | ✅ JWT | Naya PO banao |
| 45 | `GET` | `/api/purchase-orders/:id` | ✅ JWT | Single PO |
| 46 | `GET` | `/api/purchase-orders/regenerate-all` | ✅ JWT | Saare PO regenerate |

---

## 🛠️ 7. SERVICE ORDER APIs
**Base:** `/api/service-orders`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 47 | `GET` | `/api/service-orders` | ✅ JWT | SO list |
| 48 | `POST` | `/api/service-orders` | ✅ JWT | Naya SO banao |

---

## 🛒 8. PROCUREMENT — Full Workflow APIs
**Base:** `/api/procurement`

| # | Method | Endpoint | Auth | Roles | Description |
|---|--------|----------|------|-------|-------------|
| 49 | `GET` | `/api/procurement/overview` | ✅ JWT | admin, procurement, finance, hr | Overview stats |
| 50 | `GET` | `/api/procurement/purchase-requests` | ✅ JWT | admin, procurement, finance, hr | PR list |
| 51 | `POST` | `/api/procurement/purchase-requests` | ✅ JWT | admin, procurement, hr | Naya PR banao |
| 52 | `PATCH` | `/api/procurement/purchase-requests/:id/approve` | ✅ JWT | admin, procurement, finance | PR approve/reject |
| 53 | `POST` | `/api/procurement/purchase-requests/:id/convert-to-rfq` | ✅ JWT | admin, procurement | PR → RFQ convert |
| 54 | `GET` | `/api/procurement/rfqs/:rfqId/quotation-comparison` | ✅ JWT | admin, procurement, finance | Quotation comparison |
| 55 | `POST` | `/api/procurement/quotations/:quotationId/select` | ✅ JWT | admin, procurement | Vendor select (PO auto-create) |
| 56 | `GET` | `/api/procurement/purchase-orders` | ✅ JWT | admin, procurement, finance, vendor | PO list |
| 57 | `GET` | `/api/procurement/service-orders` | ✅ JWT | admin, procurement, finance, vendor | SO list |
| 58 | `PATCH` | `/api/procurement/purchase-orders/:id/accept` | ✅ JWT | **vendor only** | PO accept |
| 59 | `PATCH` | `/api/procurement/purchase-orders/:id/reject` | ✅ JWT | **vendor only** | PO reject |
| 60 | `GET` | `/api/procurement/deliveries` | ✅ JWT | admin, procurement, finance, vendor | Deliveries list |
| 61 | `POST` | `/api/procurement/deliveries` | ✅ JWT | admin, procurement, vendor | Delivery create/update |
| 62 | `GET` | `/api/procurement/invoices` | ✅ JWT | admin, procurement, finance, vendor | Invoice list |
| 63 | `POST` | `/api/procurement/invoices` | ✅ JWT | admin, procurement, vendor | Naya invoice |
| 64 | `PATCH` | `/api/procurement/invoices/:invoiceId/review` | ✅ JWT | admin, finance | Invoice approve/reject |
| 65 | `POST` | `/api/procurement/invoices/:invoiceId/pay` | ✅ JWT | admin, finance | Invoice payment |
| 66 | `GET` | `/api/procurement/payments` | ✅ JWT | admin, finance, procurement, vendor | Payments list |
| 67 | `GET` | `/api/procurement/sla-breaches` | ✅ JWT | admin, procurement, finance | SLA breaches |
| 68 | `GET` | `/api/procurement/vendor-statement/:vendorId` | ✅ JWT | admin, procurement, finance | Vendor statement (admin) |
| 69 | `GET` | `/api/procurement/vendor-payments` | ✅ JWT | **vendor only** | Vendor ki payments |
| 70 | `GET` | `/api/procurement/vendor-statement` | ✅ JWT | **vendor only** | Vendor ka statement |
| 71 | `GET` | `/api/procurement/comments/all` | ✅ JWT | admin, procurement, finance | Saare comments |
| 72 | `POST` | `/api/procurement/comments` | ✅ JWT | admin, procurement, finance, vendor | Comment add |
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
| 80 | `PATCH` | `/api/applications/:id/approve-stage` | ✅ JWT | admin, hr | Stage approve |
| 81 | `POST` | `/api/applications/:id/approve` | ✅ JWT | admin, hr | Approve |
| 82 | `POST` | `/api/applications/:id/reject` | ✅ JWT | admin, hr | Reject |

---

## 📝 10. FORMS APIs
**Base:** `/api/forms`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 83 | `GET` | `/api/forms/master/public` | ❌ Public | Master form |
| 84 | `GET` | `/api/forms/published` | ❌ Public | Published forms |
| 85 | `GET` | `/api/forms/public/:categoryId` | ❌ Public | Category se public form |
| 86 | `GET` | `/api/forms/single/public/:id` | ❌ Public | Single public form |
| 87 | `GET` | `/api/forms/:formId/public` | ❌ Public | Form public view |
| 88 | `POST` | `/api/forms/:formId/submit` | ❌ Public | Form submit |
| 89 | `GET` | `/api/forms` | ✅ JWT admin | Templates list |
| 90 | `POST` | `/api/forms` | ✅ JWT admin | Form save |
| 91 | `POST` | `/api/forms/builder` | ✅ JWT admin | Builder form create |
| 92 | `GET` | `/api/forms/builder/all` | ✅ JWT admin | All builder forms |
| 93 | `GET` | `/api/forms/builder/:formId` | ✅ JWT admin | Single builder form |
| 94 | `PUT` | `/api/forms/builder/:formId` | ✅ JWT admin | Builder form update |
| 95 | `POST` | `/api/forms/builder/:formId/publish` | ✅ JWT admin | Form publish |
| 96 | `POST` | `/api/forms/builder/:formId/unpublish` | ✅ JWT admin | Form unpublish |
| 97 | `POST` | `/api/forms/builder/:formId/copy` | ✅ JWT admin | Form copy |
| 98 | `GET` | `/api/forms/builder/:formId/preview` | ✅ JWT admin | Form preview |
| 99 | `POST` | `/api/forms/:id/publish` | ✅ JWT admin | Form publish (legacy) |
| 100 | `PATCH` | `/api/forms/:id/archive` | ✅ JWT admin | Form archive |
| 101 | `POST` | `/api/forms/seed/enterprise` | ✅ JWT admin | Enterprise templates seed |

---

## 🌳 11. TREE FORM APIs
**Base:** `/api/form`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 102 | `POST` | `/api/form/create` | ✅ JWT admin | Tree form create |
| 103 | `POST` | `/api/form/create-default` | ✅ JWT admin | Default tree form |
| 104 | `PUT` | `/api/form/:id` | ✅ JWT admin | Tree form update |
| 105 | `GET` | `/api/form/all` | ✅ JWT admin | Saare tree forms |
| 106 | `POST` | `/api/form/submit` | ❌ Public | Form submit |
| 107 | `POST` | `/api/form/autofill/gst` | ❌ Public | GST autofill |
| 108 | `POST` | `/api/form/autofill/ifsc` | ❌ Public | IFSC autofill |
| 109 | `GET` | `/api/form/:id` | ❌ Public | Form by ID |

---

## 📬 12. TREE SUBMISSION APIs
**Base:** `/api/submission`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 110 | `GET` | `/api/submission/all` | ✅ JWT admin, hr | Saari submissions |
| 111 | `GET` | `/api/submission/:id` | ✅ JWT admin, hr | Single submission |
| 112 | `POST` | `/api/submission/approve` | ✅ JWT admin | Approve |

---

## 📩 13. SUBMISSION APIs (Legacy)
**Base:** `/api/submissions`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 113 | `GET` | `/api/submissions/vendor/dashboard` | ✅ JWT vendor | Vendor dashboard |
| 114 | `GET` | `/api/submissions` | ✅ JWT admin | All submissions |
| 115 | `GET` | `/api/submissions/:id` | ✅ JWT admin | Single submission |
| 116 | `PATCH` | `/api/submissions/:id/review` | ✅ JWT admin | Review |

---

## 📂 14. CATEGORY APIs
**Base:** `/api/categories`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 117 | `GET` | `/api/categories/public-list` | ❌ Public | Public categories |
| 118 | `GET` | `/api/categories` | ✅ JWT | Categories list |
| 119 | `POST` | `/api/categories` | ✅ JWT | Naya category |
| 120 | `GET` | `/api/categories/:id` | ✅ JWT | Single category |
| 121 | `PUT` | `/api/categories/:id` | ✅ JWT | Update |
| 122 | `DELETE` | `/api/categories/:id` | ✅ JWT | Delete |

---

## 📜 15. CONTRACT APIs
**Base:** `/api/contracts`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 123 | `GET` | `/api/contracts` | ✅ JWT | Contracts list |
| 124 | `POST` | `/api/contracts` | ✅ JWT | Naya contract |
| 125 | `GET` | `/api/contracts/stats` | ✅ JWT | Stats |
| 126 | `GET` | `/api/contracts/:id` | ✅ JWT | Single contract |
| 127 | `PATCH` | `/api/contracts/:id` | ✅ JWT | Update |
| 128 | `PATCH` | `/api/contracts/:id/terminate` | ✅ JWT | Terminate |
| 129 | `DELETE` | `/api/contracts/:id` | ✅ JWT | Delete |
| 130 | `GET` | `/api/contracts/vendor/:vendorId` | ✅ JWT | Vendor ke contracts |

---

## 🔔 16. NOTIFICATION APIs
**Base:** `/api/notifications`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 131 | `GET` | `/api/notifications` | ✅ JWT | Apni notifications |
| 132 | `GET` | `/api/notifications/unread-count` | ✅ JWT | Unread count |
| 133 | `PATCH` | `/api/notifications/:id/read` | ✅ JWT | Mark as read |
| 134 | `PATCH` | `/api/notifications/read-all` | ✅ JWT | Sab read mark |

---

## 📊 17. SLM APIs
**Base:** `/api/slm`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 135 | `GET` | `/api/slm/contracts` | ✅ JWT | SLM contracts |
| 136 | `GET` | `/api/slm/contracts/stats` | ✅ JWT | Stats |
| 137 | `GET` | `/api/slm/contracts/:id` | ✅ JWT | Single contract |
| 138 | `POST` | `/api/slm/contracts` | ✅ JWT | Naya contract |
| 139 | `GET` | `/api/slm/contracts/vendor/:vendorId` | ✅ JWT | Vendor contracts |
| 140 | `PATCH` | `/api/slm/contracts/:id` | ✅ JWT | Update |
| 141 | `PATCH` | `/api/slm/contracts/:id/terminate` | ✅ JWT | Terminate |
| 142 | `DELETE` | `/api/slm/contracts/:id` | ✅ JWT | Delete |
| 143 | `POST` | `/api/slm/performance/review` | ✅ JWT | Performance review submit |
| 144 | `GET` | `/api/slm/performance/vendor/:vendorId` | ✅ JWT | Vendor performance |
| 145 | `PATCH` | `/api/slm/vendors/:id/lifecycle` | ✅ JWT | Vendor lifecycle status |

---

## 👥 18. USER MANAGEMENT APIs
**Base:** `/api/users`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 146 | `GET` | `/api/users` | ✅ JWT | Users list |
| 147 | `POST` | `/api/users` | ✅ JWT | Naya user |
| 148 | `GET` | `/api/users/:id` | ✅ JWT | Single user |
| 149 | `PUT` | `/api/users/:id` | ✅ JWT | Update |
| 150 | `DELETE` | `/api/users/:id` | ✅ JWT | Delete |
| 151 | `PATCH` | `/api/users/:id/role` | ✅ JWT | Role change |
| 152 | `PATCH` | `/api/users/:id/status` | ✅ JWT | Status change |

---

## 🎭 19. ROLE & PERMISSION APIs
**Base:** `/api/roles`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 153 | `GET` | `/api/roles` | ✅ JWT admin | Roles list |
| 154 | `POST` | `/api/roles` | ✅ JWT admin | Naya role |
| 155 | `GET` | `/api/roles/permissions` | ✅ JWT admin | All permissions |
| 156 | `PUT` | `/api/roles/:id` | ✅ JWT admin | Role update |
| 157 | `DELETE` | `/api/roles/:id` | ✅ JWT admin | Role delete |

---

## 📨 20. INVITATION APIs
**Base:** `/api/invitations`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 158 | `GET` | `/api/invitations/verify/:token` | ❌ Public | Invitation verify |
| 159 | `GET` | `/api/invitations` | ✅ JWT admin, manager | List |
| 160 | `POST` | `/api/invitations/send` | ✅ JWT admin, manager | Send |

---

## 🏢 21. DEPARTMENT APIs
**Base:** `/api/departments`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 161 | `GET` | `/api/departments` | ✅ JWT | List |
| 162 | `POST` | `/api/departments` | ✅ JWT | Naya department |

---

## 📊 22. DASHBOARD APIs
**Base:** `/api/dashboard`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 163 | `GET` | `/api/dashboard/vendor-stats` | ✅ JWT | Vendor dashboard stats |

---

## 📋 23. ACTIVITY LOG APIs
**Base:** `/api/activity-logs`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 164 | `GET` | `/api/activity-logs` | ✅ JWT admin | Activity logs |

---

## ⚙️ 24. PROCUREMENT SETTINGS APIs
**Base:** `/api/procurement-settings`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 165 | `GET` | `/api/procurement-settings` | ✅ JWT | Settings dekho |
| 166 | `PUT` | `/api/procurement-settings` | ✅ JWT admin, procurement | Update |
| 167 | `GET` | `/api/procurement-settings/history` | ✅ JWT | History |
| 168 | `POST` | `/api/procurement-settings/restore/:historyId` | ✅ JWT | Restore |

---

## 🤖 25. AI APIs
**Base:** `/api/category`

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 169 | `POST` | `/api/category/generate-ai` | ❌ Public | AI se category generate |

---

## 🔍 26. HEALTH CHECK

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 170 | `GET` | `/health` | ❌ Public | Server health check |

---

## 📌 Summary Table

| Module | APIs |
|--------|------|
| Auth | 8 |
| Vendors | 13 |
| Admin | 10 |
| RFQs | 7 |
| Quotations | 4 |
| Purchase Orders | 4 |
| Service Orders | 2 |
| **Procurement Full Workflow** | **25** |
| Applications | 9 |
| Forms | 19 |
| Tree Forms | 8 |
| Tree Submissions | 3 |
| Legacy Submissions | 4 |
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
| **TOTAL** | **~170** |
