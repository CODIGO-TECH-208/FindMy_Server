# FindMy Backend  And System Architecture

# Overview

This is the backend server for **FindMy**, a lost and found platform for University of Ghana students. Users can report lost items, post found items, and connect with each other to recover belongings.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **Real-time Chat:** Socket.io
- **Email:** Nodemailer
- **File Upload:** Multer
- **Validation:** Joi

---

## Project Structure

```
├── src/
│   ├── apiTests/        # test scenareos for APIs
│   ├── config/          # Database config
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation
│   ├── services/        # External services
│   ├── utils/           # Helpers, email
│   └── server.js        # Entry point
├── docs/                # Documentation (comming soon)
├── .env
└── package.json
```

---

## Installation

### Prerequisites

- Node.js
- MongoDB

### Quick Setup

```bash
# Clone and install
git clone https://github.com/CODIGO-TECH-208/findmy-app.git
cd Backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Start MongoDB (make sure it's running)
# Then start the server
npm run dev
```

---

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://vkpinto1234_db_user:Hesoyam.m0ng0@cluster0.uyd0fal.mongodb.net/?appName=Cluster0
JWT_SECRET=secret-key
JWT_EXPIRE=24h
EMAIL_USER="Zentech2099@gmail.com"
EMAIL_PASS="yrbl gpzh rqeb remh"
CLOUDINARY_URL=cloudinary://591534326352322:qMTC8u-i1dw9jlnR2HdeTjux2l4@dan6vxui8

```

---

## Database Schema

### Users

| Field           | Type     | Description            |
| --------------- | -------- | ---------------------- |
| id              | ObjectId | Unique identifier      |
| studentId       | String   | Student ID (unique)    |
| email           | String   | Student email (unique) |
| name            | String   | Full name              |
| password        | String   | Hashed password        |
| phoneNumber     | String   | contact                |
| profilePicture  | String   | URL to profile image   |
| isEmailVerified | Boolean  | Email verified?        |
| role            | String   | "student" or "admin"   |
| createdAt       | Date     | Account creation date  |

### Items

| Field           | Type     | Description                         |
| --------------- | -------- | ----------------------------------- |
| id              | ObjectId | Unique identifier                   |
| postedBy        | ObjectId | Reference to User                   |
| title           | String   | Item name/title                     |
| type            | String   | "lost" or "found"                   |
| category        | String   | Phones, ID Cards, Bags, Books, etc. |
| description     | Text     | Detailed description                |
| date            | Date     | When lost/found                     |
| location        | String   | Where lost/found                    |
| locationDetails | String   | Additional location info            |
| status          | String   | "active", "claimed", "resolved"     |
| images          | Array    | URLs to item images                 |
| rewardOffered   | Boolean  | Optional reward                     |
| createdAt       | Date     | When posted                         |
| expiresAt       | Date     | Auto-archive date                   |

### Claims

| Field       | Type     | Description                         |
| ----------- | -------- | ----------------------------------- |
| id          | ObjectId | Unique identifier                   |
| item        | ObjectId | Reference to Item                   |
| claimant    | ObjectId | Reference to User (person claiming) |
| itemOwner   | ObjectId | Reference to User (who posted item) |
| reason      | Text     | Why they think it's theirs          |
| status      | String   | "pending", "accepted", "rejected"   |
| submittedAt | Date     | When claim was made                 |
| respondedAt | Date     | When owner responded                |
| expiresAt   | Date     | Auto-expiry (7 days)                |

### Chats

| Field        | Type     | Description            |
| ------------ | -------- | ---------------------- |
| id           | ObjectId | Unique identifier      |
| claim        | ObjectId | Reference to Claim     |
| participant1 | ObjectId | Claimant               |
| participant2 | ObjectId | Item owner             |
| status       | String   | "active", "closed"     |
| lastMessage  | Date     | Last message timestamp |
| createdAt    | Date     | Chat creation time     |

### Messages

| Field     | Type     | Description        |
| --------- | -------- | ------------------ |
| id        | ObjectId | Unique identifier  |
| chat      | ObjectId | Reference to Chat  |
| sender    | ObjectId | Who sent it        |
| content   | Text     | Message text       |
| hasImage  | Boolean  | Includes image?    |
| imageUrl  | String   | URL if has image   |
| read      | Boolean  | Seen by recipient? |
| createdAt | Date     | When sent          |

### Notifications

| Field     | Type     | Description                        |
| --------- | -------- | ---------------------------------- |
| id        | ObjectId | Unique identifier                  |
| user      | ObjectId | Who receives it                    |
| type      | String   | "claim", "message", "accept", etc. |
| title     | String   | Short title                        |
| message   | String   | Notification text                  |
| isRead    | Boolean  | Seen by user?                      |
| createdAt | Date     | When created                       |

---

## Core API Endpoints (MVP)

### Authentication

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| POST   | `/api/auth/register`        | Create account         |
| POST   | `/api/auth/verify-OTP/`     | Verify email with code |
| POST   | `/api/auth/login`           | Login                  |
| POST   | `/api/auth/forgot-password` | Request password reset |
| POST   | `/api/auth/reset-password/` | Reset password         |
| POST   | `/api/auth/logout/`         | Logout                 |

### Items

| Method | Endpoint                        | Description                   |
| ------ | ------------------------------- | ----------------------------- |
| GET    | `/api/items`                  | List all items (with filters) |
| GET    | `/api/items/search?q=keyword` | Search items                  |
| GET    | `/api/items/:id`              | Get single item               |
| POST   | `/api/items`                  | Post new item                 |
| PUT    | `/api/items/:id`              | Edit item                     |
| DELETE | `/api/items/:id`              | Delete item                   |
| POST   | `/api/items/:id/images`       | Upload item images            |

### Claims

| Method | Endpoint                   | Description                |
| ------ | -------------------------- | -------------------------- |
| POST   | `/api/claims`            | Submit claim on found item |
| GET    | `/api/claims/my-claims`  | Get my claims              |
| GET    | `/api/claims/received`   | Get claims on my items     |
| PUT    | `/api/claims/:id/accept` | Accept claim               |
| PUT    | `/api/claims/:id/reject` | Reject claim               |

### Chat

| Method | Endpoint                          | Description       |
| ------ | --------------------------------- | ----------------- |
| GET    | `/api/chats`                    | Get my chats      |
| GET    | `/api/chats/:id/messages`       | Get chat messages |
| POST   | `/api/chats/:id/messages`       | Send message      |
| POST   | `/api/chats/:id/messages/image` | Send image        |

### User

| Method | Endpoint                    | Description          |
| ------ | --------------------------- | -------------------- |
| GET    | `/api/user/profile`       | Get my profile       |
| PUT    | `/api/user/profile`       | Update profile       |
| GET    | `/api/user/notifications` | Get my notifications |

## Email Service (Nodemailer)

We use Nodemailer for all email notifications. Emails are sent for:

- **Email verification** - When user registers
- **Password reset** - When user forgets password
- **New claim** - When someone claims your item
- **Claim accepted/rejected** - Status updates
- **New message** - When you get a message (optional)

---

## Simple Security

- **Passwords:** Hashed with bcrypt
- **JWT Tokens:** For authentication (expires in 24h)
- **Email Verification:** Required before posting/claiming
- **Input Validation:** All inputs checked for safety
- **File Uploads:** Only images, max 5MB
- **Rate Limiting:** Prevent abuse (100 requests/15 min)

---

## Sample API Calls

Use the AuthTests.rest file in the apiTests folder to preview and demo the endpoints (requests stucture and responce structure)

---

this documentation is not complete and will be updated as development progresses.
