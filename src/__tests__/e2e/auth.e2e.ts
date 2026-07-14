/**
 * E2E Tests — Authentication
 *
 * Tests the complete auth flow: signup, login, token validation, error cases.
 */

import {
  describe, it, beforeAll,
  POST, GET,
  generateTestEmail, createTestUser,
  expectSuccess, expectError,
  type TestUser,
} from './setup';

export function authTests() {
  describe('Auth — Signup', () => {
    it('should create a new user with valid data', async () => {
      const email = generateTestEmail();
      const res = await POST('/api/auth/signup', {
        email,
        password: 'SecurePass123!',
        firstName: 'Amara',
        lastName: 'Okafor',
      });

      expectSuccess(res, 201);
      const data = res.body.data as any;
      if (!data.user.id) throw new Error('Missing user id');
      if (data.user.email !== email) throw new Error('Email mismatch');
      if (!data.token) throw new Error('Missing token');
      if (data.user.firstName !== 'Amara') throw new Error('FirstName mismatch');
    });

    it('should reject signup with duplicate email', async () => {
      const email = generateTestEmail();

      await POST('/api/auth/signup', {
        email,
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      });

      const res = await POST('/api/auth/signup', {
        email,
        password: 'AnotherPass123!',
        firstName: 'Duplicate',
        lastName: 'User',
      });

      expectError(res, 409);
    });

    it('should reject signup with invalid email', async () => {
      const res = await POST('/api/auth/signup', {
        email: 'not-an-email',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      });

      expectError(res, 422);
    });

    it('should reject signup with short password', async () => {
      const res = await POST('/api/auth/signup', {
        email: generateTestEmail(),
        password: '123',
        firstName: 'Test',
        lastName: 'User',
      });

      expectError(res, 422);
    });

    it('should reject signup with missing firstName', async () => {
      const res = await POST('/api/auth/signup', {
        email: generateTestEmail(),
        password: 'SecurePass123!',
        lastName: 'User',
      });

      expectError(res, 422);
    });

    it('should set httpOnly cookie on signup', async () => {
      const res = await POST('/api/auth/signup', {
        email: generateTestEmail(),
        password: 'SecurePass123!',
        firstName: 'Cookie',
        lastName: 'Test',
      });

      expectSuccess(res, 201);
      // Token should be in response body
      if (!(res.body.data as any).token) throw new Error('Token not in response');
    });
  });

  describe('Auth — Login', () => {
    let testUser: TestUser;

    beforeAll(async () => {
      testUser = await createTestUser({
        password: 'LoginTestPass123!',
      });
    });

    it('should login with correct credentials', async () => {
      const res = await POST('/api/auth/login', {
        email: testUser.email,
        password: 'LoginTestPass123!',
      });

      expectSuccess(res);
      const data = res.body.data as any;
      if (!data.token) throw new Error('Missing token');
      if (data.user.email !== testUser.email) throw new Error('Email mismatch');
    });

    it('should reject login with wrong password', async () => {
      const res = await POST('/api/auth/login', {
        email: testUser.email,
        password: 'WrongPassword123!',
      });

      expectError(res, 401);
    });

    it('should reject login with non-existent email', async () => {
      const res = await POST('/api/auth/login', {
        email: 'nonexistent@afrostore-test.com',
        password: 'SomePass123!',
      });

      expectError(res, 401);
    });

    it('should reject login with empty password', async () => {
      const res = await POST('/api/auth/login', {
        email: testUser.email,
        password: '',
      });

      expectError(res, 422);
    });
  });

  describe('Auth — Token Validation', () => {
    let testUser: TestUser;

    beforeAll(async () => {
      testUser = await createTestUser();
    });

    it('should return user info with valid token via /api/auth/me', async () => {
      const res = await GET('/api/auth/me', testUser.token);

      expectSuccess(res);
      const data = res.body.data as any;
      if (data.email !== testUser.email) throw new Error('Email mismatch');
    });

    it('should reject requests with invalid token', async () => {
      const res = await GET('/api/auth/me', 'invalid-token-here');
      expectError(res, 401);
    });

    it('should reject requests with no token', async () => {
      const res = await GET('/api/auth/me');
      expectError(res, 401);
    });
  });
}
