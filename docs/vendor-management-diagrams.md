# Vendor Management System Diagrams

These diagrams are based on the current project structure in the `client/` and `server/` applications, especially the onboarding, RFQ, quotation, purchase order, delivery, invoice, and payment modules.

## 1. Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Vendor
    actor Admin
    participant UI as React Client
    participant API as Express API
    participant APP as VendorApplication
    participant WF as WorkflowService
    participant EL as EligibilityService
    participant V as Vendor
    participant U as User
    participant RFQ as RFQ Module
    participant Q as Quotation Module
    participant PO as PurchaseOrder Module
    participant INV as Invoice Module
    participant PAY as Payment Module
    participant N as Notification/Email
    participant DB as MongoDB

    Vendor->>UI: Open registration form
    UI->>API: Submit vendor application + documents
    API->>APP: Create or update application
    API->>WF: Initialize review workflow
    API->>EL: Calculate eligibility score and risk
    APP->>DB: Save application
    API->>N: Send submission email/alerts
    API-->>Vendor: Application submitted

    Admin->>UI: Review submitted application
    UI->>API: Approve or reject current stage
    API->>APP: Update workflow stage and status
    APP->>DB: Save approval history

    alt Application approved
        API->>V: Create vendor profile
        API->>U: Create vendor login account
        V->>DB: Save vendor master
        U->>DB: Save user account
        API->>N: Send approval email with credentials
        API-->>Admin: Vendor onboarding completed
    else Application rejected
        API->>N: Send rejection email
        API-->>Admin: Application closed as rejected
    end

    Admin->>UI: Create RFQ
    UI->>API: Submit RFQ with items, deadlines, approvals
    API->>RFQ: Create RFQ
    RFQ->>DB: Save RFQ

    alt RFQ requires approval
        Admin->>UI: Manager/Finance review RFQ
        UI->>API: Approve RFQ stage
        API->>RFQ: Update approval state
        RFQ->>DB: Save approval history
    end

    API->>N: Notify approved vendors
    N-->>Vendor: RFQ email/dashboard notification

    Vendor->>UI: Submit quotation
    UI->>API: Create quotation
    API->>Q: Save quotation
    Q->>DB: Store vendor pricing

    Admin->>UI: Compare quotations
    UI->>API: Select winning quotation
    API->>PO: Create purchase order
    PO->>DB: Save purchase order
    API->>N: Send PO to vendor

    Vendor->>UI: Update delivery / submit invoice
    UI->>API: Delivery and invoice data
    API->>DB: Save delivery status
    API->>INV: Save invoice
    INV->>DB: Store invoice

    Admin->>UI: Verify invoice and release payment
    UI->>API: Approve payment
    API->>PAY: Create payment record
    PAY->>DB: Save payment
    API->>N: Notify vendor of payment status
    API-->>Vendor: Procurement cycle completed
```

## 2. Agile Model

```mermaid
flowchart TD
    A[Business Need or Vendor Management Problem] --> B[Product Backlog]
    B --> C[Sprint Planning]
    C --> D[Design and Task Breakdown]
    D --> E[Development Sprint]
    E --> F[Testing and Review]
    F --> G[Sprint Demo]
    G --> H[Retrospective]
    H --> I[Backlog Refinement]
    I --> C

    E --> E1[Frontend Work<br/>Vendor portal, admin dashboard, forms]
    E --> E2[Backend Work<br/>APIs, workflow logic, notifications]
    E --> E3[Data Work<br/>MongoDB models, reports, audit logs]

    F --> F1[Functional testing]
    F --> F2[Role and permission testing]
    F --> F3[Workflow validation]

    G --> J[Release Increment]
    J --> K[User Feedback]
    K --> B
```

### Agile approach for this project

- `Sprint 1`: authentication, roles, vendor registration, form templates
- `Sprint 2`: application review workflow, approval stages, notifications
- `Sprint 3`: RFQ, quotation, vendor selection, purchase order generation
- `Sprint 4`: delivery tracking, invoice processing, payment monitoring, audit analytics
- `Continuous`: bug fixing, UI polish, security, performance, and reporting improvements

## 3. ER Diagram

```mermaid
erDiagram
    COMPANY ||--o{ USER : has
    COMPANY ||--o{ DEPARTMENT : owns
    COMPANY ||--o{ VENDOR : manages
    COMPANY ||--o{ RFQ : creates
    COMPANY ||--o{ PURCHASE_REQUEST : owns
    COMPANY ||--o{ PURCHASE_ORDER : owns
    COMPANY ||--o{ INVOICE : owns
    COMPANY ||--o{ DELIVERY : owns
    COMPANY ||--o{ PAYMENT : owns

    CATEGORY ||--o{ VENDOR : classifies
    CATEGORY ||--o{ VENDOR_APPLICATION : groups
    CATEGORY ||--o{ RFQ : scopes

    USER ||--o{ VENDOR : creates
    USER ||--o{ RFQ : creates
    USER ||--o{ PURCHASE_REQUEST : requests
    USER ||--o{ NOTIFICATION : receives

    FORM_TEMPLATE ||--o{ VENDOR_APPLICATION : drives
    VENDOR_APPLICATION ||--o| VENDOR : becomes

    DEPARTMENT ||--o{ RFQ : requests
    DEPARTMENT ||--o{ PURCHASE_REQUEST : raises

    PURCHASE_REQUEST ||--o| RFQ : converts_to
    RFQ ||--o{ QUOTATION : receives
    VENDOR ||--o{ QUOTATION : submits
    RFQ ||--o{ PURCHASE_ORDER : generates
    QUOTATION ||--o{ PURCHASE_ORDER : selected_for
    VENDOR ||--o{ PURCHASE_ORDER : fulfills

    VENDOR ||--o{ CONTRACT : signs
    RFQ ||--o{ CONTRACT : supports
    QUOTATION ||--o{ CONTRACT : based_on

    PURCHASE_ORDER ||--o{ DELIVERY : tracks
    PURCHASE_ORDER ||--o{ INVOICE : bills
    PURCHASE_ORDER ||--o{ PAYMENT : settles
    VENDOR ||--o{ INVOICE : submits
    VENDOR ||--o{ DELIVERY : ships

    COMPANY {
        ObjectId _id
        string name
        string email
        string domain
        string subscriptionPlan
    }

    USER {
        ObjectId _id
        string name
        string email
        string role
        string status
        ObjectId tenantId
    }

    CATEGORY {
        ObjectId _id
        string name
        string code
        string status
    }

    DEPARTMENT {
        ObjectId _id
        string name
        string description
        ObjectId tenantId
    }

    FORM_TEMPLATE {
        ObjectId _id
        string name
        number version
    }

    VENDOR_APPLICATION {
        ObjectId _id
        string applicationId
        string companyName
        string email
        string currentStage
        string status
        string eligibilityStatus
    }

    VENDOR {
        ObjectId _id
        string vendorId
        string name
        string email
        string companyName
        string lifecycleStatus
        number rating
        ObjectId tenantId
    }

    PURCHASE_REQUEST {
        ObjectId _id
        string requestNo
        string title
        number totalEstimate
        string status
        ObjectId tenantId
    }

    RFQ {
        ObjectId _id
        string title
        date quoteDeadline
        string status
        ObjectId tenantId
    }

    QUOTATION {
        ObjectId _id
        number totalAmount
        date validUntil
        string status
        ObjectId rfqId
        ObjectId vendorId
    }

    PURCHASE_ORDER {
        ObjectId _id
        string poNumber
        string orderType
        number totalAmount
        string status
        ObjectId vendorId
        ObjectId quotationId
    }

    CONTRACT {
        ObjectId _id
        string contractNumber
        string contractTitle
        number contractValue
        string status
        ObjectId vendorId
    }

    DELIVERY {
        ObjectId _id
        string deliveryNumber
        date expectedDate
        date deliveredDate
        string status
        ObjectId poId
        ObjectId vendorId
    }

    INVOICE {
        ObjectId _id
        string invoiceNumber
        date invoiceDate
        date dueDate
        number totalAmount
        string status
        ObjectId poId
        ObjectId vendorId
    }

    PAYMENT {
        ObjectId _id
        number amount
        date paymentDate
        string method
        string status
        ObjectId poId
        ObjectId tenantId
    }

    NOTIFICATION {
        ObjectId _id
        string title
        string type
        boolean isRead
        ObjectId recipientId
    }
```

## Notes

- The onboarding flow comes from `VendorApplication`, `WorkflowService`, `EligibilityService`, `Vendor`, and `User`.
- The procurement flow comes from `PurchaseRequest`, `RFQ`, `Quotation`, `PurchaseOrder`, `Delivery`, `Invoice`, and `Payment`.
- The system is multi-tenant, so `tenantId` links many records back to `Company`.

## 4. Process Diagram

```mermaid
flowchart TD
    A[Vendor Registration Starts] --> B[Fill Application Form]
    B --> C[Upload Required Documents]
    C --> D[Submit Application]
    D --> E[System Stores Application]
    E --> F[Eligibility Score and Risk Check]
    F --> G[Technical Review]

    G --> H{Approved by Technical Team?}
    H -- No --> I[Reject or Request Changes]
    I --> J[Vendor Updates and Resubmits]
    J --> F

    H -- Yes --> K[Finance Review]
    K --> L{Approved by Finance Team?}
    L -- No --> I
    L -- Yes --> M[Compliance Review]

    M --> N{Compliance Cleared?}
    N -- No --> I
    N -- Yes --> O[Final Approval]

    O --> P[Create Vendor Profile]
    P --> Q[Create Vendor Login Account]
    Q --> R[Vendor Becomes Active]

    R --> S[Admin Creates Purchase Request]
    S --> T[Convert PR to RFQ]
    T --> U[Publish RFQ to Vendors]
    U --> V[Vendor Submits Quotation]
    V --> W[Admin Compares Quotations]
    W --> X[Select Best Vendor]
    X --> Y[Generate Purchase Order]
    Y --> Z[Vendor Delivers Goods or Services]
    Z --> AA[Vendor Submits Invoice]
    AA --> AB[Invoice Verification]
    AB --> AC{Invoice Approved?}
    AC -- No --> AD[Reject or Rework Invoice]
    AD --> AA
    AC -- Yes --> AE[Release Payment]
    AE --> AF[Close Procurement Cycle]
```
