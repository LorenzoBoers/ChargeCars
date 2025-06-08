# Contact-Based Authentication Design
**Last Updated**: 2025-12-05
**Status**: Proposed

## Overview
Instead of a separate user_account table, we extend the contact table for authentication.

## Schema Updates

### 1. contact Table Extensions
Add these fields to the existing contact table:
```sql
-- Authentication fields
password_hash TEXT,
is_user BOOLEAN DEFAULT false,
is_active BOOLEAN DEFAULT true,
email_verified BOOLEAN DEFAULT false,
last_login TIMESTAMP,
failed_login_attempts INT DEFAULT 0,
locked_until TIMESTAMP,
auth_token TEXT,
token_expires_at TIMESTAMP,
refresh_token TEXT,
refresh_token_expires_at TIMESTAMP,
password_reset_token TEXT,
password_reset_expires_at TIMESTAMP,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
```

## Benefits
1. **Single Source of Truth**: Email exists only in contact table
2. **No Duplication**: No sync issues between user_account and contact
3. **Simpler Structure**: One less table to maintain
4. **Better Performance**: No joins needed for user info

## Authentication Flow
1. User logs in with email + password
2. System looks up contact by email WHERE is_user = true
3. Verifies password_hash
4. Generates JWT token with contact_id
5. Returns user data from contact + organization

## Migration Steps
1. Add authentication fields to contact table
2. Set is_user = true for contacts that need login
3. Generate password reset tokens for existing contacts
4. Update authentication endpoints to use contact table 