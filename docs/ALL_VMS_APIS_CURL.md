# GT Vendor Management System — Complete cURL API List

> **X-Tenant-ID:** `69c239f01a11a0fe39b9d346`
> **Base URL:** `http://localhost:5000`
> **Headers:** Includes browser emulation headers, exact platform signature, and Bearer token placeholders.

---

## 📂 1. AUTH APIs

### ➡️ Register User (POST)
**Endpoint:** `/api/auth/register`

```bash
curl ^"http://localhost:5000/api/auth/register^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"name\":\"Test User\",\"email\":\"user@example.com\",\"password\":\"Password@123\",\"role\":\"employee\"}^"
```

---

### ➡️ Onboard Company (POST)
**Endpoint:** `/api/auth/onboard`

```bash
curl ^"http://localhost:5000/api/auth/onboard^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"companyName\":\"Gitakshmi Tech\",\"email\":\"admin@gitakshmi.com\"}^"
```

---

### ➡️ Login (POST)
**Endpoint:** `/api/auth/login`

```bash
curl ^"http://localhost:5000/api/auth/login^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"email\":\"admin@gmail.com\",\"password\":\"Admin@123\"}^"
```

---

### ➡️ Refresh Token (POST)
**Endpoint:** `/api/auth/refresh`

```bash
curl ^"http://localhost:5000/api/auth/refresh^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST
```

---

### ➡️ Logout (POST)
**Endpoint:** `/api/auth/logout`

```bash
curl ^"http://localhost:5000/api/auth/logout^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST
```

---

### ➡️ Change Password (POST)
**Endpoint:** `/api/auth/change-password`

```bash
curl ^"http://localhost:5000/api/auth/change-password^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"oldPassword\":\"OldPassword123\",\"newPassword\":\"NewPassword123\"}^"
```

---

### ➡️ Get Me (Profile) (GET)
**Endpoint:** `/api/auth/me`

```bash
curl ^"http://localhost:5000/api/auth/me^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Get Permissions (GET)
**Endpoint:** `/api/auth/permissions`

```bash
curl ^"http://localhost:5000/api/auth/permissions^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

## 📂 2. VENDOR APIs

### ➡️ Lookup GST Profile (GET)
**Endpoint:** `/api/vendors/gst-profile/24AAICG0391B1Z2`

```bash
curl ^"http://localhost:5000/api/vendors/gst-profile/24AAICG0391B1Z2^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Get Vendor Profile (Me) (GET)
**Endpoint:** `/api/vendors/me`

```bash
curl ^"http://localhost:5000/api/vendors/me^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Get Vendor Stats (Me) (GET)
**Endpoint:** `/api/vendors/me/stats`

```bash
curl ^"http://localhost:5000/api/vendors/me/stats^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Update Vendor Profile (Me) (PUT)
**Endpoint:** `/api/vendors/me`

```bash
curl ^"http://localhost:5000/api/vendors/me^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PUT ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"companyName\":\"Updated Name\",\"phone\":\"9876543210\"}^"
```

---

### ➡️ Get All Vendors (GET)
**Endpoint:** `/api/vendors`

```bash
curl ^"http://localhost:5000/api/vendors^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Create Vendor (POST)
**Endpoint:** `/api/vendors`

```bash
curl ^"http://localhost:5000/api/vendors^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"name\":\"Supplier Inc\",\"email\":\"supplier@example.com\",\"gstNumber\":\"24AAICG0391B1Z2\"}^"
```

---

### ➡️ Get Vendor by ID (GET)
**Endpoint:** `/api/vendors/6a0bf0389f1716d298153126`

```bash
curl ^"http://localhost:5000/api/vendors/6a0bf0389f1716d298153126^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Update Vendor by ID (PATCH)
**Endpoint:** `/api/vendors/6a0bf0389f1716d298153126`

```bash
curl ^"http://localhost:5000/api/vendors/6a0bf0389f1716d298153126^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PATCH ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"name\":\"Supplier Private Limited\"}^"
```

---

### ➡️ Delete Vendor by ID (DELETE)
**Endpoint:** `/api/vendors/6a0bf0389f1716d298153126`

```bash
curl ^"http://localhost:5000/api/vendors/6a0bf0389f1716d298153126^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X DELETE
```

---

### ➡️ Get Vendor Performance (GET)
**Endpoint:** `/api/vendors/6a0bf0389f1716d298153126/performance`

```bash
curl ^"http://localhost:5000/api/vendors/6a0bf0389f1716d298153126/performance^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Send Payment Reminder (POST)
**Endpoint:** `/api/vendors/6a0bf0389f1716d298153126/remind-payment`

```bash
curl ^"http://localhost:5000/api/vendors/6a0bf0389f1716d298153126/remind-payment^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST
```

---

### ➡️ Upload GST Certificate (PUT)
**Endpoint:** `/api/vendors/6a0bf0389f1716d298153126/upload-gst`

```bash
curl ^"http://localhost:5000/api/vendors/6a0bf0389f1716d298153126/upload-gst^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PUT
```

---

### ➡️ Upload Vendor Agreement (PUT)
**Endpoint:** `/api/vendors/6a0bf0389f1716d298153126/upload-agreement`

```bash
curl ^"http://localhost:5000/api/vendors/6a0bf0389f1716d298153126/upload-agreement^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PUT
```

---

## 📂 3. ADMIN APIs

### ➡️ Get Dashboard Overview Stats (GET)
**Endpoint:** `/api/admin/stats`

```bash
curl ^"http://localhost:5000/api/admin/stats^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Get Direct Messages (GET)
**Endpoint:** `/api/admin/messages`

```bash
curl ^"http://localhost:5000/api/admin/messages^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Get Vendors Admin List (GET)
**Endpoint:** `/api/admin/vendors`

```bash
curl ^"http://localhost:5000/api/admin/vendors^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Export Vendors CSV (GET)
**Endpoint:** `/api/admin/vendors/export`

```bash
curl ^"http://localhost:5000/api/admin/vendors/export^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Import Vendors (Bulk CSV) (POST)
**Endpoint:** `/api/admin/vendors/import`

```bash
curl ^"http://localhost:5000/api/admin/vendors/import^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST
```

---

### ➡️ Update Vendor Status (PATCH)
**Endpoint:** `/api/admin/vendors/6a0bf0389f1716d298153126/status`

```bash
curl ^"http://localhost:5000/api/admin/vendors/6a0bf0389f1716d298153126/status^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PATCH ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"status\":\"approved\"}^"
```

---

### ➡️ Blacklist Vendor (DELETE)
**Endpoint:** `/api/admin/vendors/6a0bf0389f1716d298153126`

```bash
curl ^"http://localhost:5000/api/admin/vendors/6a0bf0389f1716d298153126^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X DELETE
```

---

### ➡️ Send Inquiry Mail (POST)
**Endpoint:** `/api/admin/inquiry`

```bash
curl ^"http://localhost:5000/api/admin/inquiry^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"vendorId\":\"6a0bf0389f1716d298153126\",\"subject\":\"KYC Pending\",\"message\":\"Please upload your GST registration.\"}^"
```

---

### ➡️ Get Audit Logs (GET)
**Endpoint:** `/api/admin/audit-logs`

```bash
curl ^"http://localhost:5000/api/admin/audit-logs^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Get System Analytics (GET)
**Endpoint:** `/api/admin/analytics`

```bash
curl ^"http://localhost:5000/api/admin/analytics^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

## 📂 4. RFQ WORKFLOW APIs

### ➡️ Get RFQ List (GET)
**Endpoint:** `/api/rfqs`

```bash
curl ^"http://localhost:5000/api/rfqs^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Create RFQ (POST)
**Endpoint:** `/api/rfqs`

```bash
curl ^"http://localhost:5000/api/rfqs^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"title\":\"Procurement of Laptops\",\"items\":[{\"name\":\"Dell Latitude 5420\",\"quantity\":10,\"unit\":\"Nos\"}],\"quoteDeadline\":\"2026-12-31\"}^"
```

---

### ➡️ Get RFQ Details (GET)
**Endpoint:** `/api/rfqs/6a0bf0389f1716d298153126`

```bash
curl ^"http://localhost:5000/api/rfqs/6a0bf0389f1716d298153126^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Update RFQ (PATCH)
**Endpoint:** `/api/rfqs/6a0bf0389f1716d298153126`

```bash
curl ^"http://localhost:5000/api/rfqs/6a0bf0389f1716d298153126^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PATCH ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"title\":\"Updated Procurement Title\"}^"
```

---

### ➡️ Update RFQ Status (PATCH)
**Endpoint:** `/api/rfqs/6a0bf0389f1716d298153126/status`

```bash
curl ^"http://localhost:5000/api/rfqs/6a0bf0389f1716d298153126/status^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PATCH ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"status\":\"published\"}^"
```

---

### ➡️ Approve/Review RFQ (POST)
**Endpoint:** `/api/rfqs/6a0bf0389f1716d298153126/review`

```bash
curl ^"http://localhost:5000/api/rfqs/6a0bf0389f1716d298153126/review^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"approve\":true,\"remarks\":\"Approved for publishing\"}^"
```

---

### ➡️ Send RFQ to Targeted Vendors (POST)
**Endpoint:** `/api/rfqs/6a0bf0389f1716d298153126/send`

```bash
curl ^"http://localhost:5000/api/rfqs/6a0bf0389f1716d298153126/send^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"vendors\":[\"6a0bf0389f1716d298153126\"]}^"
```

---

## 📂 5. QUOTATION APIs

### ➡️ Submit Quotation (POST)
**Endpoint:** `/api/quotations`

```bash
curl ^"http://localhost:5000/api/quotations^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"rfqId\":\"6a0bf0389f1716d298153126\",\"items\":[{\"name\":\"Item 1\",\"quantity\":10,\"unitPrice\":25000}],\"totalAmount\":250000}^"
```

---

### ➡️ Get Quotations for RFQ (GET)
**Endpoint:** `/api/quotations/rfq/6a0bf0389f1716d298153126`

```bash
curl ^"http://localhost:5000/api/quotations/rfq/6a0bf0389f1716d298153126^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Accept Quotation (POST)
**Endpoint:** `/api/quotations/6a0bf0389f1716d298153126/accept`

```bash
curl ^"http://localhost:5000/api/quotations/6a0bf0389f1716d298153126/accept^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST
```

---

### ➡️ Reject Quotation (POST)
**Endpoint:** `/api/quotations/6a0bf0389f1716d298153126/reject`

```bash
curl ^"http://localhost:5000/api/quotations/6a0bf0389f1716d298153126/reject^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST
```

---

## 📂 6. PURCHASE ORDER (PO) APIs

### ➡️ List All POs (GET)
**Endpoint:** `/api/purchase-orders`

```bash
curl ^"http://localhost:5000/api/purchase-orders^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Create PO (POST)
**Endpoint:** `/api/purchase-orders`

```bash
curl ^"http://localhost:5000/api/purchase-orders^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"vendorId\":\"6a0bf0389f1716d298153126\",\"items\":[{\"name\":\"Goods\",\"quantity\":1,\"unitPrice\":50000}],\"totalAmount\":50000}^"
```

---

### ➡️ Get PO By ID (GET)
**Endpoint:** `/api/purchase-orders/6a0bf0389f1716d298153126`

```bash
curl ^"http://localhost:5000/api/purchase-orders/6a0bf0389f1716d298153126^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Regenerate All PO PDFs (GET)
**Endpoint:** `/api/purchase-orders/regenerate-all`

```bash
curl ^"http://localhost:5000/api/purchase-orders/regenerate-all^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

## 📂 7. SERVICE ORDER (SO) APIs

### ➡️ List All SOs (GET)
**Endpoint:** `/api/service-orders`

```bash
curl ^"http://localhost:5000/api/service-orders^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Create SO (POST)
**Endpoint:** `/api/service-orders`

```bash
curl ^"http://localhost:5000/api/service-orders^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"vendorId\":\"6a0bf0389f1716d298153126\",\"items\":[{\"name\":\"Consulting Service\",\"quantity\":1,\"unitPrice\":75000}],\"totalAmount\":75000}^"
```

---

## 📂 8. PROCUREMENT WORKSPACE APIs

### ➡️ Get Procurement Overview (GET)
**Endpoint:** `/api/procurement/overview`

```bash
curl ^"http://localhost:5000/api/procurement/overview^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ List Purchase Requests (PR) (GET)
**Endpoint:** `/api/procurement/purchase-requests`

```bash
curl ^"http://localhost:5000/api/procurement/purchase-requests^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Create Purchase Request (POST)
**Endpoint:** `/api/procurement/purchase-requests`

```bash
curl ^"http://localhost:5000/api/procurement/purchase-requests^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"title\":\"Server Hardware PR\",\"items\":[{\"description\":\"RAM 32GB DDR4\",\"quantity\":4,\"estimatedUnitPrice\":12000}],\"submit\":true}^"
```

---

### ➡️ Approve PR (PATCH)
**Endpoint:** `/api/procurement/purchase-requests/6a0bf0389f1716d298153126/approve`

```bash
curl ^"http://localhost:5000/api/procurement/purchase-requests/6a0bf0389f1716d298153126/approve^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PATCH ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"approve\":true,\"remarks\":\"Urgent purchase approved.\"}^"
```

---

### ➡️ Convert PR to RFQ (POST)
**Endpoint:** `/api/procurement/purchase-requests/6a0bf0389f1716d298153126/convert-to-rfq`

```bash
curl ^"http://localhost:5000/api/procurement/purchase-requests/6a0bf0389f1716d298153126/convert-to-rfq^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"title\":\"RFQ for Server Hardware\",\"quoteDeadline\":\"2026-10-10\"}^"
```

---

### ➡️ Get Quotation Comparison Matrix (GET)
**Endpoint:** `/api/procurement/rfqs/6a0bf0389f1716d298153126/quotation-comparison`

```bash
curl ^"http://localhost:5000/api/procurement/rfqs/6a0bf0389f1716d298153126/quotation-comparison^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Select Vendor & Auto-create PO (POST)
**Endpoint:** `/api/procurement/quotations/6a0bf0389f1716d298153126/select`

```bash
curl ^"http://localhost:5000/api/procurement/quotations/6a0bf0389f1716d298153126/select^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST
```

---

### ➡️ Accept PO (Vendor) (PATCH)
**Endpoint:** `/api/procurement/purchase-orders/6a0bf0389f1716d298153126/accept`

```bash
curl ^"http://localhost:5000/api/procurement/purchase-orders/6a0bf0389f1716d298153126/accept^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PATCH
```

---

### ➡️ Reject PO (Vendor) (PATCH)
**Endpoint:** `/api/procurement/purchase-orders/6a0bf0389f1716d298153126/reject`

```bash
curl ^"http://localhost:5000/api/procurement/purchase-orders/6a0bf0389f1716d298153126/reject^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PATCH ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"remarks\":\"Insufficient stock\"}^"
```

---

### ➡️ List Deliveries (GET)
**Endpoint:** `/api/procurement/deliveries`

```bash
curl ^"http://localhost:5000/api/procurement/deliveries^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Upsert Delivery Tracking (POST)
**Endpoint:** `/api/procurement/deliveries`

```bash
curl ^"http://localhost:5000/api/procurement/deliveries^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"poId\":\"6a0bf0389f1716d298153126\",\"status\":\"in_transit\",\"expectedDate\":\"2026-06-01\",\"tracking\":{\"carrier\":\"BlueDart\",\"trackingNumber\":\"BD9876543\"}}^"
```

---

### ➡️ List Invoices (GET)
**Endpoint:** `/api/procurement/invoices`

```bash
curl ^"http://localhost:5000/api/procurement/invoices^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Submit Invoice (POST)
**Endpoint:** `/api/procurement/invoices`

```bash
curl ^"http://localhost:5000/api/procurement/invoices^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"poId\":\"6a0bf0389f1716d298153126\",\"invoiceNumber\":\"INV-2026-001\",\"lines\":[{\"itemName\":\"Delivered RAM modules\",\"quantity\":4,\"unitPrice\":12000}],\"totalAmount\":48000}^"
```

---

### ➡️ Review/Approve Invoice (PATCH)
**Endpoint:** `/api/procurement/invoices/6a0bf0389f1716d298153126/review`

```bash
curl ^"http://localhost:5000/api/procurement/invoices/6a0bf0389f1716d298153126/review^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X PATCH ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"approve\":true,\"reason\":\"Verified with delivery notes.\"}^"
```

---

### ➡️ Process Payment & Settle Invoice (POST)
**Endpoint:** `/api/procurement/invoices/6a0bf0389f1716d298153126/pay`

```bash
curl ^"http://localhost:5000/api/procurement/invoices/6a0bf0389f1716d298153126/pay^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^" ^
  -X POST ^
  -H ^"Content-Type: application/json^" ^
  -d ^"{\"amount\":48000,\"method\":\"bank_transfer\",\"transactionRef\":\"UTR9876543210\"}^"
```

---

### ➡️ List Payments (GET)
**Endpoint:** `/api/procurement/payments`

```bash
curl ^"http://localhost:5000/api/procurement/payments^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Get SLA Breaches (GET)
**Endpoint:** `/api/procurement/sla-breaches`

```bash
curl ^"http://localhost:5000/api/procurement/sla-breaches^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Get Vendor Statement (Admin) (GET)
**Endpoint:** `/api/procurement/vendor-statement/6a0bf0389f1716d298153126`

```bash
curl ^"http://localhost:5000/api/procurement/vendor-statement/6a0bf0389f1716d298153126^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Get Vendor Payments (Vendor) (GET)
**Endpoint:** `/api/procurement/vendor-payments`

```bash
curl ^"http://localhost:5000/api/procurement/vendor-payments^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

### ➡️ Get Vendor Statement (Vendor) (GET)
**Endpoint:** `/api/procurement/vendor-statement`

```bash
curl ^"http://localhost:5000/api/procurement/vendor-statement^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
  -H ^"Authorization: Bearer {{jwt_token}}^" ^
  -H ^"Referer: http://localhost:5000/dashboard^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"146^\^", ^\^"Not-A.Brand^\^";v=^\^"24^\^"^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"X-Tenant-ID: 69c239f01a11a0fe39b9d346^"
```

---

