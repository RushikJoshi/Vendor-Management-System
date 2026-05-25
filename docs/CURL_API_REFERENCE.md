# GT Vendor Management System — cURL API Reference

Use these pre-formatted cURL requests to test the APIs from any terminal (PowerShell, Command Prompt, or Bash).

> Replace `{{TOKEN}}` with your JWT Authorization token.
> Replace `http://localhost:5000` with the actual server host domain if running on dev/production.

---

## 🔐 1. AUTHENTICATION

### A. Login User
```bash
curl "http://localhost:5000/api/auth/login" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 69c239f01a11a0fe39b9d346" \
  -d '{"email": "admin@gmail.com", "password": "Admin@123"}'
```

### B. Register User
```bash
curl "http://localhost:5000/api/auth/register" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 69c239f01a11a0fe39b9d346" \
  -d '{"name": "Dharmik Jethvani", "email": "dharmik@gitakshmi.com", "password": "Password@123", "role": "employee"}'
```

---

## 🏪 2. VENDORS

### A. List All Vendors
```bash
curl "http://localhost:5000/api/vendors" \
  -X GET \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "X-Tenant-ID: 69c239f01a11a0fe39b9d346"
```

### B. Lookup GSTIN Details
```bash
curl "http://localhost:5000/api/vendors/gst-profile/24AAICG0391B1Z2" \
  -X GET \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "X-Tenant-ID: 69c239f01a11a0fe39b9d346"
```

---

## 📋 3. REQUEST FOR QUOTATION (RFQ)

### A. Create RFQ
```bash
curl "http://localhost:5000/api/rfqs" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "X-Tenant-ID: 69c239f01a11a0fe39b9d346" \
  -d '{"title": "Need 50 Office Chairs", "items": [{"name": "Ergonomic Chairs", "quantity": 50}], "quoteDeadline": "2026-12-31"}'
```

---

## 💰 4. PROCUREMENT WORKFLOW

### A. Submit Invoice (Vendor)
```bash
curl "http://localhost:5000/api/procurement/invoices" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "X-Tenant-ID: 69c239f01a11a0fe39b9d346" \
  -d '{"poId": "6a0bf0389f1716d298153126", "invoiceNumber": "INV-SO-030993-E3AE-8403", "lines": [{"itemName": "RAM Modules", "quantity": 4, "unitPrice": 12000}], "totalAmount": 48000}'
```

### B. Settle Payment / Release Funds (Admin)
```bash
curl "http://localhost:5000/api/procurement/invoices/6a0bf0389f1716d298153126/pay" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "X-Tenant-ID: 69c239f01a11a0fe39b9d346" \
  -d '{"amount": 48000, "method": "bank_transfer", "transactionRef": "UTR9876543210"}'
```
