# Test Register Functionality

## API Endpoints

### 1. Register New Account
```http
POST http://localhost:5120/api/auth/register
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "Test@123456",
    "confirmPassword": "Test@123456",
    "fullname": "Nguyen Van Test",
    "phone": "0123456789",
    "gender": "Nam",
    "dob": "2000-01-01",
    "roleId": 1
}
```

**Expected Response (200 OK):**
```json
{
    "code": 200,
    "message": "Registration successful. Please check your email for OTP verification.",
    "data": [
        {
            "message": "Registration successful. Please check your email for OTP verification.",
            "email": "test@example.com"
        }
    ]
}
```

**OTP will be printed in console** (check the terminal where the app is running)

---

### 2. Verify OTP
After receiving OTP from console, verify it:

```http
POST http://localhost:5120/api/auth/verify-otp
Content-Type: application/json

{
    "email": "test@example.com",
    "otpCode": "123456"
}
```

**Expected Response (200 OK):**
```json
{
    "code": 200,
    "message": "OTP verified successfully. You are now logged in.",
    "data": [
        {
            "message": "OTP verified successfully. You are now logged in.",
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refreshToken": "xyz123...",
            "accessTokenExpires": "2024-01-20T10:00:00Z",
            "refreshTokenExpires": "2024-01-27T09:00:00Z"
        }
    ]
}
```

**After successful verification:**
- Account Status changes from "0" to "1" (Active)
- OtpCode and OtpExpiry are cleared
- User is automatically logged in with tokens

---

### 3. Resend OTP
If OTP expires or user didn't receive it:

```http
POST http://localhost:5120/api/auth/resend-otp
Content-Type: application/json

{
    "email": "test@example.com"
}
```

**Expected Response (200 OK):**
```json
{
    "code": 200,
    "message": "OTP has been resent to your email.",
    "data": [
        {
            "message": "OTP has been resent to your email."
        }
    ]
}
```

**New OTP will be printed in console**

---

## Flow Diagram

```
User Registration Flow:
1. User submits registration → Status=0, OTP generated, OtpExpiry=+5min
2. OTP sent to email (console) → User receives 6-digit code
3. User submits OTP verification → Status=1, OTP cleared, Auto-login with tokens
4. User is now logged in → Can use access/refresh tokens

Alternative: If OTP expires → User requests resend → New OTP generated
```

---

## Important Notes

1. **RoleId Values:**
   - 1 = Student
   - 2 = Lecturer

2. **OTP Details:**
   - 6 digits (100000-999999)
   - Expires after 5 minutes
   - Stored in Account table (OtpCode, OtpExpiry)

3. **Status Values:**
   - "0" = Pending verification (after registration)
   - "1" = Active (after OTP verification)

4. **Password Requirements:**
   - Minimum 8 characters
   - Hashed with BCrypt (WorkFactor 11)
   - Must match ConfirmPassword

5. **Email Service:**
   - Currently logs to console
   - TODO: Implement real email sending (SMTP, SendGrid, etc.)

---

## Test with Postman/Thunder Client

1. **Register:**
   - Send POST to `/api/auth/register` with JSON body
   - Check terminal/console for OTP code
   - Note the 6-digit code

2. **Verify:**
   - Send POST to `/api/auth/verify-otp` with email and OTP
   - Save the returned tokens

3. **Use Tokens:**
   - Use AccessToken in Authorization header: `Bearer <token>`
   - When AccessToken expires, use RefreshToken to get new tokens

---

## Database Check

After registration, check the Account table:
```sql
SELECT Id, Email, Fullname, Status, OtpCode, OtpExpiry, CreatedAt
FROM Account
WHERE Email = 'test@example.com';
```

After OTP verification:
```sql
SELECT Id, Email, Fullname, Status, OtpCode, OtpExpiry
FROM Account
WHERE Email = 'test@example.com';
-- Status should be "1", OtpCode and OtpExpiry should be NULL
```

Check RefreshToken table:
```sql
SELECT Id, Token, CreatedUtc, ExpiresUtc, RevokedUtc, AccountId
FROM RefreshToken
WHERE AccountId = (SELECT Id FROM Account WHERE Email = 'test@example.com');
```
