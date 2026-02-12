# VMS Staff Synchronization API Documentation

## Overview
This API allows the ERP system to automatically sync staff data to the Visitor Management System (VMS). The VMS uses the **Email Address** as the unique identifier to match records.
- If a staff member with the email exists, their details are **updated**.
- If no staff member matches the email, a **new account is created** and an invitation email is sent.

## Endpoint Details

- **Method:** `POST`
- **URL:** `https://api.theswiftentry.com/api/erp/staff/sync`
- **Authorization:** Custom Header

### Headers

| Header | Value | Description |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Required. |
| `X-ERP-API-KEY` | `[YOUR_SECURE_KEY]` | You will be provided with this secret key. |

### Request Body
The body must be a JSON object containing a `staff` array.

```json
{
  "staff": [
    {
      "email": "jane.doe@sydani.com",
      "name": "Jane Doe",
      "department": "Finance",
      "position": "Senior Accountant",
      "phone": "08012345678",
      "employee_id": "EMP2024001",
      "role": "staff",
      "status": "active"
    },
    {
      "email": "john.smith@sydani.com",
      "name": "John Smith",
      "department": "IT",
      "role": "admin",
      "status": "inactive"
    }
  ]
}
```

#### Field Descriptions

| Field | Type | Required? | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | **Yes** | Unique Identifier. Must be a valid email. |
| `name` | String | **Yes** | Full name of the staff member. |
| [role](file:///c:/xampp/htdocs/Sydani/vms-api-master/app/Models/Staff.php#72-76) | String | No | Default is `staff`. Options: `staff`, `admin`, `security`, `frontdesk`. |
| `department` | String | No | The department name (e.g., "Human Resources"). |
| `position` | String | No | The job title (e.g., "HR Manager"). |
| `employee_id` | String | No | The staff member's ID from the ERP. |
| `phone` | String | No | Phone number. |
| `status` | String | No | `active` or `inactive`. Default is active. |

---

### Success Response (200 OK)

```json
{
    "message": "Sync completed",
    "stats": {
        "total": 2,
        "created": 1,
        "updated": 1,
        "failed": 0,
        "errors": []
    }
}
```

### Error Responses

**401 Unauthorized**
*Cause:* Missing or invalid `X-ERP-API-KEY`.
```json
{
    "message": "Unauthorized. Invalid or missing API Key."
}
```

**422 Validation Error**
*Cause:* Missing required fields or invalid email format.
```json
{
    "message": "Validation failed",
    "errors": {
        "staff.0.email": [
            "The staff.0.email field is required."
        ]
    }
}
```
