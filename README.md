# Personal Library Manager

A NestJS-based REST API for managing personal book collections with reading progress tracking, notes, and reading goals.

## Features

- **Reading Progress Tracking** - Track pages read and calculate progress percentage
- **Notes & Reviews** - Add notes to specific pages and rate books (1-5 stars)
- **Reading Goals** - Create reading goals with automatic progress tracking
- **Statistics** - View reading statistics including favorite genre, average rating, and recently added books
- **Search & Filter** - Search books by title, author, or ISBN; filter by status, author, or genre
- **User Management** - Role-based access control (USER, ADMIN)

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: MySQL (TypeORM)
- **Authentication**: Google OAuth 2.0 + JWT
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0
- Google OAuth 2.0 credentials

## Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd personal-library-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```sql
   CREATE DATABASE personal_library_manager;
   ```

4. **Configure environment variables**

   Create `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=personal_library_manager
   
   JWT_SECRET=your-secret-key-change-in-production
   
   CLIENT_ID=your-google-client-id
   CLIENT_SECRET=your-google-client-secret
   CALLBACK_URL=http://localhost:3000/api/auth/google/redirect
   
   PORT=3000
   ```

5. **Get Google OAuth credentials**
    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create OAuth 2.0 Client ID
    - Add redirect URI: `http://localhost:3000/api/auth/google/redirect`

6. **Run application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation

Swagger UI is available at: **http://localhost:3000/api/docs**

## Authentication

1. Initiate login: `GET /api/auth/google/login`
2. After Google authentication, you'll receive a JWT token
3. Use token in headers: `Authorization: Bearer <token>`

## Main Endpoints

- **Auth**: `/api/auth/google/login`, `/api/auth/google/redirect`, `/api/auth/profile`
- **Users**: `/api/users` (CRUD + role management)
- **Books**: `/api/books` (CRUD + search)
- **Authors**: `/api/authors` (CRUD)
- **Genres**: `/api/genres` (CRUD)
- **User Books**: `/api/user-books` (library management + statistics)
- **Reading Goals**: `/api/reading-goals` (CRUD + progress tracking)
- **Notes**: `/api/notes` (CRUD)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Scripts

- `npm run build` - Build project
- `npm run start:dev` - Run in development mode
- `npm run lint` - Lint code
- `npm run format` - Format code

## License

UNLICENSED
