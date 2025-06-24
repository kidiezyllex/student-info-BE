Backend API build with Express, TypeScript, MVC, RESTful.

## Tutorial

Detailed documentation for all API endpoints available in the system.

### 1. Auth

#### 1.1. Register
- **Method:** POST
- **Path:** `/api/auth/register`
- **Access:** Public (3 role)
- **Payload:**
  ```json
  {
    "name": "string",
    "email": "string",s
    "password": "string",
    "role": "string" // Optional: "student" (default), "admin", "coordinator". Nếu sinh viên tự đăng ký tài khoản thì không truyền vào field "role"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "token": "string"
    }
  }
  ```

#### 1.2. Login
- **Method:** POST
- **Path:** `/api/auth/login`
- **Access:** Public (3 role)
- **Payload:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "data": {
      "_id": "string",
      "name": "string",
      "fullName": "string",
      "email": "string",
      "studentId": "string",
      "role": "string",
      "department": {
        "_id": "string",
        "name": "string",
        "code": "string"
      },
      "avatar": "string",
      "token": "string"
    }
  }
  ```
- **Example Accounts:**
  - Admin: `admin@gmail.com / Admin123456`
  - Quản trị ngành: `quantringanh1@gmail.com / Qtn123456`,  `admin2@gmail.com / Admin123456`
  - Student: `buitranthienan1111@gmail.com / kidiezyllex.1111`

#### 1.3. Get Profile
- **Method:** GET
- **Path:** `/api/auth/profile`
- **Access:** Private (3 role)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "User profile retrieved successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "fullName": "string",
      "email": "string",
      "studentId": "string",
      "role": "string",
      "department": {
        "_id": "string",
        "name": "string",
        "code": "string",
        "description": "string"
      },
      "phoneNumber": "string",
      "dateOfBirth": "date",
      "gender": "string",
      "avatar": "string",
      "address": {},
      "emergencyContact": {},
      "studentInfo": {},
      "coordinatorInfo": {},
      "profileSettings": {},
      "socialLinks": {},
      "savedNotifications": [],
      "lastLogin": "date",
      "lastProfileUpdate": "date",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```

### 2. Users

#### 2.1. Get All Users
- **Method:** GET
- **Path:** `/api/users`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Users retrieved successfully",
    "data": [
      {
        "_id": "string",
        "name": "string",
        "fullName": "string",
        "email": "string",
        "studentId": "string",
        "role": "string",
        "department": {
          "_id": "string",
          "name": "string",
          "code": "string"
        },
        "phoneNumber": "string",
        "avatar": "string",
        "active": "boolean",
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
  }
  ```

#### 2.2. Get User by ID
- **Method:** GET
- **Path:** `/api/users/:id`
- **Access:** Private (3 role)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "User retrieved successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "fullName": "string",
      "email": "string",
      "studentId": "string",
      "role": "string",
      "department": {
        "_id": "string",
        "name": "string",
        "code": "string",
        "description": "string"
      },
      "phoneNumber": "string",
      "dateOfBirth": "date",
      "gender": "string",
      "avatar": "string",
      "address": {
        "street": "string",
        "ward": "string",
        "district": "string",
        "city": "string",
        "zipCode": "string"
      },
      "emergencyContact": {
        "name": "string",
        "relationship": "string",
        "phoneNumber": "string"
      },
      "studentInfo": {
        "class": "string",
        "course": "string",
        "academicYear": "string",
        "semester": "string",
        "gpa": "number",
        "credits": "number",
        "admissionDate": "date",
        "expectedGraduationDate": "date",
        "status": "string",
        "scholarships": [],
        "achievements": []
      },
      "coordinatorInfo": {
        "position": "string",
        "officeLocation": "string",
        "officeHours": "string",
        "specialization": [],
        "qualifications": [],
        "experience": [],
        "researchInterests": [],
        "publications": []
      },
      "profileSettings": {
        "isPublic": "boolean",
        "showEmail": "boolean",
        "showPhone": "boolean",
        "allowMessages": "boolean",
        "emailNotifications": "boolean"
      },
      "socialLinks": {
        "facebook": "string",
        "linkedin": "string",
        "github": "string",
        "website": "string"
      },
      "savedNotifications": [],
      "lastLogin": "date",
      "lastProfileUpdate": "date",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```

#### 2.3. Get Users by Role
- **Method:** GET
- **Path:** `/api/users/role/:role`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Parameters:** role (student, coordinator, admin)
- **Response:**
  ```json
  {
    "message": "Students retrieved successfully",
    "count": 0,
    "data": [
      {
        "_id": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "department": {
          "_id": "string",
          "name": "string",
          "code": "string"
        }
      }
    ]
  }
  ```

#### 2.4. Get Users by Department
- **Method:** GET
- **Path:** `/api/users/department/:departmentId`
- **Access:** Private (3 role)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Department users retrieved successfully",
    "count": 0,
    "data": [
      {
        "_id": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "department": {
          "_id": "string",
          "name": "string",
          "code": "string"
        }
      }
    ]
  }
  ```

#### 2.5. Update User Basic Information
- **Method:** PUT
- **Path:** `/api/users/:id`
- **Access:** Private (own profile or admin)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string", // Optional
    "studentId": "string",
    "fullName": "string",
    "phoneNumber": "string",
    "avatar": "string",
    "role": "string", // Only admin can change this
    "department": "string", // Only admin can change this
    "active": "boolean" // Only admin can change this
  }
  ```
- **Response:**
  ```json
  {
    "message": "User updated successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "fullName": "string",
      "email": "string",
      "studentId": "string",
      "role": "string",
      "department": {
        "_id": "string",
        "name": "string",
        "code": "string"
      },
      "phoneNumber": "string",
      "avatar": "string",
      "profileSettings": {},
      "lastProfileUpdate": "date"
    }
  }
  ```

#### 2.6. Update User Profile (Comprehensive)
- **Method:** PUT
- **Path:** `/api/users/:id/profile`
- **Access:** Private (own profile or admin)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "fullName": "string",
    "dateOfBirth": "date",
    "gender": "string", // "male", "female", "other"
    "avatar": "string",
    "phoneNumber": "string",
    "address": {
      "street": "string",
      "ward": "string",
      "district": "string",
      "city": "string",
      "zipCode": "string"
    },
    "emergencyContact": {
      "name": "string",
      "relationship": "string",
      "phoneNumber": "string"
    },
    "studentInfo": {
      "class": "string",
      "course": "string",
      "academicYear": "string",
      "semester": "string",
      "gpa": "number",
      "credits": "number",
      "admissionDate": "date",
      "expectedGraduationDate": "date",
      "status": "string", // "active", "suspended", "graduated", "dropped_out"
      "scholarships": [
        {
          "name": "string",
          "amount": "number",
          "year": "string",
          "semester": "string"
        }
      ],
      "achievements": [
        {
          "title": "string",
          "description": "string",
          "date": "date",
          "category": "string"
        }
      ]
    },
    "coordinatorInfo": {
      "position": "string",
      "officeLocation": "string",
      "officeHours": "string",
      "specialization": ["string"],
      "qualifications": [
        {
          "degree": "string",
          "field": "string",
          "institution": "string",
          "year": "number"
        }
      ],
      "experience": [
        {
          "position": "string",
          "organization": "string",
          "startDate": "date",
          "endDate": "date",
          "description": "string"
        }
      ],
      "researchInterests": ["string"],
      "publications": [
        {
          "title": "string",
          "journal": "string",
          "year": "number",
          "authors": ["string"]
        }
      ]
    },
    "profileSettings": {
      "isPublic": "boolean",
      "showEmail": "boolean",
      "showPhone": "boolean",
      "allowMessages": "boolean",
      "emailNotifications": "boolean"
    },
    "socialLinks": {
      "facebook": "string",
      "linkedin": "string",
      "github": "string",
      "website": "string"
    }
  }
  ```
- **Response:**
  ```json
  {
    "message": "User profile updated successfully",
    "data": {
      // Complete user object with all fields
    }
  }
  ```

#### 2.7. Delete User
- **Method:** DELETE
- **Path:** `/api/users/:id`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "User removed successfully"
  }
  ```

### 3. Departments

#### 3.1. Get All Departments
- **Method:** GET
- **Path:** `/api/departments`
- **Access:** Public
- **Response:
  ```json
  {
    "message": "Departments retrieved successfully",
    "data": [
      {
        "_id": "string",
        "name": "string",
        "code": "string",
        "description": "string",
        "coordinatorId": "string"
      }
    ]
  }
  ```

#### 3.2. Get Department by ID
- **Method:** GET
- **Path:** `/api/departments/:id`
- **Access:** Public
- **Response:**
  ```json
  {
    "message": "Department retrieved successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "code": "string",
      "description": "string",
      "coordinatorId": "string"
    }
  }
  ```

#### 3.3. Create Department
- **Method:** POST
- **Path:** `/api/departments`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
  "name": "Công nghệ thông tin",
  "code": "CNTT",
  "description": "Ngành học về công nghệ thông tin và lập trình",
  "coordinatorId": "67f80cb9b5b273e272ae6f44"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Department created successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "code": "string",
      "description": "string",
      "coordinatorId": "string"
    }
  }
  ```

#### 3.4. Update Department
- **Method:** PUT
- **Path:** `/api/departments/:id`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "coordinatorId": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Department updated successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "code": "string",
      "description": "string",
      "coordinatorId": "string"
    }
  }
  ```

#### 3.5. Delete Department
- **Method:** DELETE
- **Path:** `/api/departments/:id`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Department deleted successfully"
  }
  ```

### 4. Events

#### 4.1. Get Upcoming Events
- **Method:** GET
- **Path:** `/api/events`
- **Access:** Private (Admin, Coordinator, Student)
- **Headers:** Authorization token required
- **Query Parameters:**
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "Events retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "startDate": "date",
        "endDate": "date",
        "location": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "organizer": "string"
      }
    ]
  }
  ```

#### 4.2. Get All Events (Including Past)
- **Method:** GET
- **Path:** `/api/events/all`
- **Access:** Private (Admin, Coordinator - only for their department)
- **Headers:** Authorization token required
- **Query Parameters:**
  - `department`: Filter by department ID (optional). Exmaple Id: 67f8d416b509cace3cc9d4ea
- **Response:**
  ```json
  {
    "message": "All events retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "startDate": "date",
        "endDate": "date",
        "location": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "organizer": "string"
      }
    ]
  }
  ```

#### 4.3. Get Event by ID
- **Method:** GET
- **Path:** `/api/events/:id`
- **Access:** Private (Admin, Coordinator, Student)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Event retrieved successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "startDate": "date",
      "endDate": "date",
      "location": "string",
      "department": {
        "_id": "string",
        "name": "string"
      },
      "organizer": "string"
    }
  }
  ```

#### 4.4. Create Event
- **Method:** POST
- **Path:** `/api/events`
- **Access:** Private (Admin, Coordinator - only for their department)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
  "title": "Hội thảo Công nghệ",
  "description": "Mô tả chi tiết về hội thảo",
  "startDate": "2025-05-06T09:00:00Z",
  "endDate": "2025-05-15T16:00:00Z",
  "location": "Hội trường A",
  "department": "67f8d416b509cace3cc9d4ea",
  "organizer": "Khoa Công nghệ thông tin"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Event created successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "startDate": "date",
      "endDate": "date",
      "location": "string",
      "department": "string",
      "organizer": "string"
    }
  }
  ```

#### 4.5. Update Event
- **Method:** PUT
- **Path:** `/api/events/:id`
- **Access:** Private (Admin, Coordinator - only for their department, cannot update general events)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "title": "string",
    "description": "string",
    "startDate": "date",
    "endDate": "date",
    "location": "string",
    "department": "string", // Department ID
    "organizer": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Event updated successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "startDate": "date",
      "endDate": "date",
      "location": "string",
      "department": "string",
      "organizer": "string"
    }
  }
  ```

#### 4.6. Delete Event
- **Method:** DELETE
- **Path:** `/api/events/:id`
- **Access:** Private (Admin, Coordinator - only for their department, cannot delete general events)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Event deleted successfully"
  }
  ```

### 5. Scholarships

#### 5.1. Get Active Scholarships
- **Method:** GET
- **Path:** `/api/scholarships`
- **Access:** Private (Admin, Coordinator, Student)
- **Headers:** Authorization token required
- **Query Parameters:**
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "Scholarships retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "requirements": "string",
        "value": "string",
        "applicationDeadline": "date",
        "provider": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "eligibility": "string",
        "applicationProcess": "string"
      }
    ]
  }
  ```

#### 5.2. Get All Scholarships (Including Expired)
- **Method:** GET
- **Path:** `/api/scholarships/all`
- **Access:** Private (Admin, Coordinator - only for their department)
- **Headers:** Authorization token required
- **Query Parameters:**
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "All scholarships retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "requirements": "string",
        "value": "string",
        "applicationDeadline": "date",
        "provider": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "eligibility": "string",
        "applicationProcess": "string"
      }
    ]
  }
  ```

#### 5.3. Get Scholarship by ID
- **Method:** GET
- **Path:** `/api/scholarships/:id`
- **Access:** Private (Admin, Coordinator, Student)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Scholarship retrieved successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "requirements": "string",
      "value": "string",
      "applicationDeadline": "date",
      "provider": "string",
      "department": {
        "_id": "string",
        "name": "string"
      },
      "eligibility": "string",
      "applicationProcess": "string"
    }
  }
  ```

#### 5.4. Create Scholarship
- **Method:** POST
- **Path:** `/api/scholarships`
- **Access:** Private (Admin, Coordinator - only for their department)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "title": "string",
    "description": "string",
    "requirements": "string",
    "value": "string",
    "applicationDeadline": "date",
    "provider": "string",
    "department": "string", // Department ID
    "eligibility": "string",
    "applicationProcess": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Scholarship created successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "requirements": "string",
      "value": "string",
      "applicationDeadline": "date",
      "provider": "string",
      "department": "string",
      "eligibility": "string",
      "applicationProcess": "string"
    }
  }
  ```

#### 5.5. Update Scholarship
- **Method:** PUT
- **Path:** `/api/scholarships/:id`
- **Access:** Private (Admin, Coordinator - only for their department, cannot update general scholarships)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "title": "string",
    "description": "string",
    "requirements": "string",
    "value": "string",
    "applicationDeadline": "date",
    "provider": "string",
    "department": "string", // Department ID
    "eligibility": "string",
    "applicationProcess": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Scholarship updated successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "requirements": "string",
      "value": "string",
      "applicationDeadline": "date",
      "provider": "string",
      "department": "string",
      "eligibility": "string",
      "applicationProcess": "string"
    }
  }
  ```

#### 5.6. Delete Scholarship
- **Method:** DELETE
- **Path:** `/api/scholarships/:id`
- **Access:** Private (Admin, Coordinator - only for their department, cannot delete general scholarships)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Scholarship deleted successfully"
  }
  ```

### 6. Messages

#### 6.1. Get Conversations
- **Method:** GET
- **Path:** `/api/messages`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Conversations retrieved successfully",
    "data": [
      {
        "userId": "string",
        "name": "string",
        "lastMessage": "string",
        "lastMessageDate": "date",
        "unreadCount": 0
      }
    ]
  }
  ```

#### 6.2. Get Conversation History
- **Method:** GET
- **Path:** `/api/messages/:userId`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Messages retrieved successfully",
    "data": [
      {
        "_id": "string",
        "senderId": "string",
        "receiverId": "string",
        "content": "string",
        "read": "boolean",
        "createdAt": "date"
      }
    ]
  }
  ```

#### 6.3. Send Message
- **Method:** POST
- **Path:** `/api/messages`
- **Access:** Private
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "receiverId": "string",
    "content": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Message sent successfully",
    "data": {
      "_id": "string",
      "senderId": "string",
      "receiverId": "string",
      "content": "string",
      "read": false,
      "createdAt": "date"
    }
  }
  ```

#### 6.4. Mark Message as Read
- **Method:** PUT
- **Path:** `/api/messages/:messageId/read`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Message marked as read"
  }
  ```

#### 6.5. Mark All Messages as Read
- **Method:** PUT
- **Path:** `/api/messages/:userId/read-all`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "All messages marked as read"
  }
  ```

### 7. Notifications

#### 7.1. Get Notifications
- **Method:** GET
- **Path:** `/api/notifications`
- **Access:** Private (Admin, Coordinator, Student)
- **Headers:** Authorization token required
- **Query Parameters:**
  - `type`: Filter by notification type (optional)
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "Notifications retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "content": "string",
        "type": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "startDate": "date",
        "endDate": "date",
        "isImportant": "boolean",
        "createdAt": "date"
      }
    ]
  }
  ```

#### 7.2. Get Notification by ID
- **Method:** GET
- **Path:** `/api/notifications/:id`
- **Access:** Private (Admin, Coordinator, Student)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Notification retrieved successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "content": "string",
      "type": "string",
      "department": {
        "_id": "string",
        "name": "string"
      },
      "startDate": "date",
      "endDate": "date",
      "isImportant": "boolean",
      "createdAt": "date"
    }
  }
  ```

#### 7.3. Create Notification
- **Method:** POST
- **Path:** `/api/notifications`
- **Access:** Private (Admin, Coordinator - only for their department)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "title": "string",
    "content": "string",
    "type": "string", // "general", "scholarship", "event", "department"
    "department": "string", // Department ID (optional)
    "startDate": "date", // Optional
    "endDate": "date", // Optional
    "isImportant": "boolean" // Optional
  }
  ```
- **Response:**
  ```json
  {
    "message": "Notification created successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "content": "string",
      "type": "string",
      "department": "string",
      "startDate": "date",
      "endDate": "date",
      "isImportant": "boolean",
      "createdAt": "date"
    }
  }
  ```

#### 7.4. Update Notification
- **Method:** PUT
- **Path:** `/api/notifications/:id`
- **Access:** Private (Admin, Coordinator - only for their department, cannot update general notifications)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "title": "string",
    "content": "string",
    "type": "string",
    "department": "string", // Department ID
    "startDate": "date",
    "endDate": "date",
    "isImportant": "boolean"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Notification updated successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "content": "string",
      "type": "string",
      "department": "string",
      "startDate": "date",
      "endDate": "date",
      "isImportant": "boolean"
    }
  }
  ```

#### 7.5. Delete Notification
- **Method:** DELETE
- **Path:** `/api/notifications/:id`
- **Access:** Private (Admin, Coordinator - only for their department, cannot delete general notifications)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Notification deleted successfully"
  }
  ```

#### 7.6. Get Saved Notifications
- **Method:** GET
- **Path:** `/api/notifications/saved`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Saved notifications retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "content": "string",
        "type": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "startDate": "date",
        "endDate": "date",
        "isImportant": "boolean",
        "createdAt": "date"
      }
    ]
  }
  ```

#### 7.7. Save Notification
- **Method:** PUT
- **Path:** `/api/notifications/:id/save`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Notification saved successfully"
  }
  ```

#### 7.8. Unsave Notification
- **Method:** PUT
- **Path:** `/api/notifications/:id/unsave`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Notification unsaved successfully"
  }
  ```

### 8. Chat

#### 8.1. Ask AI Question
- **Method:** POST
- **Path:** `/api/chat/ask`
- **Access:** Private
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "question": "string",
    "sessionId": "string", // Optional for new chats
    "category": "string", // Optional for filtering data by category
    "departmentId": "string" // Optional for filtering data by department
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "sessionId": "string",
      "title": "string",
      "question": "string",
      "answer": "string",
      "message": "object" // AI response object
    }
  }
  ```

#### 8.2. Get Chat History
- **Method:** GET
- **Path:** `/api/chat/history`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "success": true,
    "count": 0,
    "data": [
      {
        "_id": "string",
        "title": "string",
        "lastActive": "date",
        "createdAt": "date"
      }
    ]
  }
  ```

#### 8.3. Get Chat Session
- **Method:** GET
- **Path:** `/api/chat/session/:id`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "title": "string",
      "user": "string",
      "createdAt": "date",
      "lastActive": "date",
      "messages": [
        {
          "role": "string", // "user" or "assistant"
          "content": "string",
          "isAccurate": "boolean" // Only for assistant messages
        }
      ]
    }
  }
  ```

#### 8.4. Rate AI Response
- **Method:** PUT
- **Path:** `/api/chat/rate`
- **Access:** Private
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "sessionId": "string",
    "messageIndex": 0,
    "isAccurate": "boolean"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Đã cập nhật đánh giá"
  }
  ```

#### 8.5. Delete Chat Session
- **Method:** DELETE
- **Path:** `/api/chat/session/:id`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "success": true,
    "message": "Đã xóa phiên chat thành công"
  }
  ```

### 9. Dataset

#### 9.1. Get All Dataset Items
- **Method:** GET
- **Path:** `/api/dataset`
- **Access:** Private (Admin, Coordinator, Student)
- **Headers:** Authorization token required
- **Query Parameters:**
  - `category`: Filter by category (optional)
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "Dataset retrieved successfully",
    "data": [
      {
        "_id": "string",
        "key": "string",
        "value": "string",
        "category": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "createdAt": "date"
      }
    ]
  }
  ```

#### 9.2. Get Dataset Item by ID
- **Method:** GET
- **Path:** `/api/dataset/:id`
- **Access:** Private (Admin, Coordinator, Student)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Dataset item retrieved successfully",
    "data": {
      "_id": "string",
      "key": "string",
      "value": "string",
      "category": "string",
      "department": {
        "_id": "string",
        "name": "string"
      },
      "createdAt": "date"
    }
  }
  ```

#### 9.3. Create Dataset Item
- **Method:** POST
- **Path:** `/api/dataset`
- **Access:** Private (Admin, Coordinator - only for their department)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "key": "string",
    "value": "string",
    "category": "string", // "general", "scholarship", "event", "department", "faq"
    "department": "string" // Department ID (optional)
  }
  ```
- **Response:**
  ```json
  {
    "message": "Dataset item created successfully",
    "data": {
      "_id": "string",
      "key": "string",
      "value": "string",
      "category": "string",
      "department": "string",
      "createdAt": "date"
    }
  }
  ```

#### 9.4. Update Dataset Item
- **Method:** PUT
- **Path:** `/api/dataset/:id`
- **Access:** Private (Admin, Coordinator - only for their department)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "key": "string",
    "value": "string",
    "category": "string",
    "department": "string" // Department ID
  }
  ```
- **Response:**
  ```json
  {
    "message": "Dataset item updated successfully",
    "data": {
      "_id": "string",
      "key": "string",
      "value": "string",
      "category": "string",
      "department": "string"
    }
  }
  ```

#### 9.5. Delete Dataset Item
- **Method:** DELETE
- **Path:** `/api/dataset/:id`
- **Access:** Private (Admin, Coordinator - only for their department)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Dataset item deleted successfully"
  }
  ```

### 10. AI Training

#### 10.1. Train AI
- **Method:** POST
- **Path:** `/api/ai/train`
- **Access:** Private (Admin, Coordinator - only for their department)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "categories": ["string"], // Optional: array of categories (general, scholarship, event, department, faq)
    "departmentId": "string" // Optional: ID của ngành (nếu muốn giới hạn dữ liệu theo ngành)
  }
  ```
- **Response:**
  ```json
  {
    "message": "Đã hoàn thành quá trình training AI",
    "data": {
      "trainingId": "string",
      "status": "string",
      "startTime": "date"
    }
  }
  ```

#### 10.2. Get Training History
- **Method:** GET
- **Path:** `/api/ai/training-history`
- **Access:** Private (Admin, Coordinator - only for their department)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "success": true,
    "count": 0,
    "data": [
      {
        "_id": "string",
        "status": "string",
        "createdAt": "date",
        "createdBy": {
          "name": "string",
          "email": "string"
        },
        "department": {
          "name": "string",
          "code": "string"
        }
      }
    ]
  }
  ```

## A. Phân quyền các chức năng

### 1. Role: Coordinator
#### Dataset
- `GET /api/dataset` — Lấy tất cả dữ liệu dataset
- `GET /api/dataset/:id` — Lấy chi tiết dữ liệu
- `POST /api/dataset` — Thêm dữ liệu mới (chỉ cho ngành mình)
- `PUT /api/dataset/:id` — Cập nhật dữ liệu (chỉ cho ngành mình)
- `DELETE /api/dataset/:id` — Xóa dữ liệu (chỉ cho ngành mình)

#### Event
- `GET /api/events/all` — Lấy tất cả sự kiện (chỉ của ngành mình)
- `POST /api/events` — Tạo sự kiện mới (chỉ cho ngành mình)
- `PUT /api/events/:id` — Cập nhật sự kiện (chỉ cho ngành mình, không được cập nhật sự kiện chung)
- `DELETE /api/events/:id` — Xóa sự kiện (chỉ cho ngành mình, không được xóa sự kiện chung)

#### Notification
- `POST /api/notifications` — Tạo thông báo mới (chỉ cho ngành mình)
- `PUT /api/notifications/:id` — Cập nhật thông báo (chỉ cho ngành mình, không được cập nhật thông báo chung)
- `DELETE /api/notifications/:id` — Xóa thông báo (chỉ cho ngành mình, không được xóa thông báo chung)

#### Scholarship
- `GET /api/scholarships/all` — Lấy tất cả học bổng (chỉ của ngành mình)
- `POST /api/scholarships` — Tạo học bổng mới (chỉ cho ngành mình)
- `PUT /api/scholarships/:id` — Cập nhật học bổng (chỉ cho ngành mình, không được cập nhật học bổng chung)
- `DELETE /api/scholarships/:id` — Xóa học bổng (chỉ cho ngành mình, không được xóa học bổng chung)

#### AI
- `POST /api/ai/train` — Training AI từ dataset
- `GET /api/ai/training-history` — Lấy lịch sử training AI

Coordinator cũng có thể sử dụng tất cả các route public như student.

---

### 2. Role: Student

#### Dataset
- `GET /api/dataset` — Lấy tất cả dữ liệu dataset
- `GET /api/dataset/:id` — Lấy chi tiết dữ liệu

#### Event
- `GET /api/events` — Lấy tất cả sự kiện sắp diễn ra hoặc đang diễn ra

### 11. Upload

#### 11.1. Upload Single File
- **Method:** POST
- **Path:** `/api/upload/single`
- **Access:** Private (3 role)
- **Headers:** Authorization token required
- **Content-Type:** multipart/form-data
- **Payload:**
  ```
  file: [File] (Required)
  folder: string (Optional) - Folder name for organization
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "data": {
      "url": "https://res.cloudinary.com/...",
      "public_id": "student-info/filename",
      "resource_type": "image",
      "format": "jpg",
      "size": 1024000,
      "width": 1920,
      "height": 1080,
      "created_at": "2024-01-01T00:00:00Z",
      "original_filename": "example.jpg",
      "mimetype": "image/jpeg"
    }
  }
  ```

#### 11.2. Upload Multiple Files
- **Method:** POST
- **Path:** `/api/upload/multiple`
- **Access:** Private (3 role)
- **Headers:** Authorization token required
- **Content-Type:** multipart/form-data
- **Payload:**
  ```
  files: [File Array] (Required, max 10 files)
  folder: string (Optional) - Folder name for organization
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Upload completed. 3 successful, 0 failed.",
    "data": {
      "total": 3,
      "successful": 3,
      "failed": 0,
      "results": [
        {
          "success": true,
          "url": "https://res.cloudinary.com/...",
          "public_id": "student-info/filename1",
          "resource_type": "image",
          "format": "jpg",
          "size": 1024000,
          "original_filename": "file1.jpg",
          "mimetype": "image/jpeg"
        }
      ]
    }
  }
  ```

#### 11.3. Delete File
- **Method:** DELETE
- **Path:** `/api/upload/:publicId`
- **Access:** Private (3 role)
- **Headers:** Authorization token required
- **Query Parameters:**
  - `resourceType`: Type of resource (image, video, raw) - Optional, default: image
- **Response:**
  ```json
  {
    "success": true,
    "message": "File deleted successfully",
    "data": {
      "public_id": "student-info/filename",
      "result": "ok"
    }
  }
  ```

#### 11.4. Get Upload Statistics
- **Method:** GET
- **Path:** `/api/upload/stats`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "success": true,
    "message": "Upload statistics retrieved successfully",
    "data": {
      "total_uploads": 150,
      "total_size": 52428800,
      "uploads_today": 12,
      "uploads_this_month": 89,
      "storage_used": "50 MB",
      "storage_limit": "10 GB"
    }
  }
  ```

**Supported File Types:**
- **Images:** JPG, JPEG, PNG, GIF, WebP, SVG
- **Documents:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, RTF
- **Archives:** ZIP, RAR, 7Z
- **Audio:** MP3, WAV, OGG, M4A
- **Video:** MP4, MPEG, MPG, MOV, AVI, WebM
- **Other:** JSON, XML, HTML, CSS, JS

**Upload Limits:**
- Maximum file size: 50MB per file
- Maximum files per request: 10 files
- All files are automatically organized in Cloudinary folders