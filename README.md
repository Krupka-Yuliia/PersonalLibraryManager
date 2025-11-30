# PersonalLibraryManager

## Опис проєкту
**Personal Library Manager** — це вебсервіс, який дозволяє користувачу організувати власну колекцію книг:  
додавати, редагувати, видаляти книги, відслідковувати статус читання, залишати нотатки й формувати власну статистику читання.

Система надає простий REST API для взаємодії з даними користувача та підтримує авторизацію через Google (Google Auth) для захисту особистих бібліотек.

## 🔐 Authentication

### How to Authenticate

**All API endpoints require authentication.** You must authenticate first before accessing any endpoints.

#### Step 1: Start OAuth Login

Open this URL in your **web browser** (not a REST client):
```
http://localhost:3000/api/auth/google/login
```

This will redirect you to Google's login page.

#### Step 2: Authenticate with Google

1. Sign in with your Google account
2. Grant permissions to the application
3. You'll be redirected back to: `http://localhost:3000/api/auth/google/redirect`

#### Step 3: Get Your JWT Token

After successful authentication, the redirect endpoint will return a JSON response like:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "your.email@gmail.com",
    "name": "Your Name",
    "role": "USER"
  }
}
```

**Copy the `access_token` value!**

#### Step 4: Use the Token

Include the token in all subsequent API requests using the `Authorization` header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### Example API Request

```http
GET http://localhost:3000/api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Environment Variables Required

Make sure your `.env` file contains:
```env
CLIENT_ID=your-google-client-id
CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/redirect
JWT_SECRET=your-secret-key-change-in-production
```

### Why You Get 401 Unauthorized

If you see `401 Unauthorized` when accessing endpoints like `/api/users`, it means:
- You haven't authenticated yet, OR
- Your token is missing/invalid/expired

**Solution:** Follow the authentication steps above to get a valid JWT token.

### Базовий функціонал

1. **Reading Progress Tracker**
    - Користувач може вказати кількість сторінок і відсоток прочитаного.
    - Прогрес відображається у вигляді графіка або статистики.

2. **Нотатки та відгуки до книги**
    - Користувач може залишати короткі нотатки або відгуки до книги.

3. **Reading Goals**
    - Користувач може створювати цілі (наприклад, “прочитати 10 книг цього року”).
    - Система автоматично рахує прогрес і показує, скільки вже виконано.

4. **Статистика**
    - кількість прочитаних книг;
    - улюблений жанр;
    - середню оцінку користувача;
    - книги, додані останнім часом.
