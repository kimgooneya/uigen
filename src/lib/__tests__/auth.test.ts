import { test, expect, vi, beforeEach, afterEach, describe } from 'vitest';

// Mock server-only to prevent test failures
vi.mock('server-only', () => ({}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock jose JWT functions
vi.mock('jose', () => ({
  SignJWT: vi.fn(),
  jwtVerify: vi.fn(),
}));

import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { createSession } from '../auth';

const mockedSignJWT = vi.mocked(SignJWT);
const mockedCookies = vi.mocked(cookies);

describe('createSession', () => {
  const mockUserId = 'user-123';
  const mockEmail = 'test@example.com';
  const mockToken = 'mock-jwt-token';
  let mockCookieStore: any;

  beforeEach(() => {
    mockCookieStore = {
      set: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    };
    
    mockedCookies.mockResolvedValue(mockCookieStore);
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('creates session with correct JWT payload and sets cookie', async () => {
    // Mock JWT creation chain
    const mockJWT = {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue(mockToken),
    };

    mockedSignJWT.mockReturnValue(mockJWT as any);

    await createSession(mockUserId, mockEmail);

    // Verify JWT creation with correct payload
    expect(mockedSignJWT).toHaveBeenCalledWith({
      userId: mockUserId,
      email: mockEmail,
      expiresAt: new Date('2024-01-08T00:00:00.000Z'), // 7 days from mock date
    });

    // Verify JWT configuration
    expect(mockJWT.setProtectedHeader).toHaveBeenCalledWith({ alg: 'HS256' });
    expect(mockJWT.setExpirationTime).toHaveBeenCalledWith('7d');
    expect(mockJWT.setIssuedAt).toHaveBeenCalled();
    expect(mockJWT.sign).toHaveBeenCalled();

    // Verify cookie setting with correct options
    expect(mockCookieStore.set).toHaveBeenCalledWith('auth-token', mockToken, {
      httpOnly: true,
      secure: false, // NODE_ENV !== 'production'
      sameSite: 'lax',
      expires: new Date('2024-01-08T00:00:00.000Z'),
      path: '/',
    });
  });

  test('sets secure cookie in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    
    // Use vi.stubEnv to properly mock environment variable
    vi.stubEnv('NODE_ENV', 'production');

    const mockJWT = {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue(mockToken),
    };

    mockedSignJWT.mockReturnValue(mockJWT as any);

    await createSession(mockUserId, mockEmail);

    expect(mockCookieStore.set).toHaveBeenCalledWith('auth-token', mockToken, {
      httpOnly: true,
      secure: true, // NODE_ENV === 'production'
      sameSite: 'lax',
      expires: new Date('2024-01-08T00:00:00.000Z'),
      path: '/',
    });

    // Restore original environment
    vi.unstubAllEnvs();
  });

  test('calculates correct expiration date (7 days from now)', async () => {
    const mockJWT = {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue(mockToken),
    };

    mockedSignJWT.mockReturnValue(mockJWT as any);

    // Set different mock date
    vi.setSystemTime(new Date('2024-06-15T12:30:00.000Z'));

    await createSession(mockUserId, mockEmail);

    const expectedExpiry = new Date('2024-06-22T12:30:00.000Z'); // 7 days later

    expect(mockedSignJWT).toHaveBeenCalledWith({
      userId: mockUserId,
      email: mockEmail,
      expiresAt: expectedExpiry,
    });

    expect(mockCookieStore.set).toHaveBeenCalledWith('auth-token', mockToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: expectedExpiry,
      path: '/',
    });
  });

  test('handles JWT signing failure', async () => {
    const mockJWT = {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockRejectedValue(new Error('JWT signing failed')),
    };

    mockedSignJWT.mockReturnValue(mockJWT as any);

    await expect(createSession(mockUserId, mockEmail)).rejects.toThrow('JWT signing failed');
    
    // Ensure cookie is not set when JWT creation fails
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });

  test('handles cookie store errors', async () => {
    const mockJWT = {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue(mockToken),
    };

    mockedSignJWT.mockReturnValue(mockJWT as any);
    mockCookieStore.set.mockImplementation(() => {
      throw new Error('Cookie store error');
    });

    await expect(createSession(mockUserId, mockEmail)).rejects.toThrow('Cookie store error');
  });

  test('works with different user IDs and emails', async () => {
    const mockJWT = {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue(mockToken),
    };

    mockedSignJWT.mockReturnValue(mockJWT as any);

    const testCases = [
      { userId: 'admin-456', email: 'admin@example.com' },
      { userId: 'user-789', email: 'user.name@domain.co.uk' },
      { userId: '12345', email: 'test+tag@gmail.com' },
    ];

    for (const { userId, email } of testCases) {
      vi.clearAllMocks();
      mockedCookies.mockResolvedValue(mockCookieStore);
      
      await createSession(userId, email);

      expect(mockedSignJWT).toHaveBeenCalledWith({
        userId,
        email,
        expiresAt: new Date('2024-01-08T00:00:00.000Z'),
      });
    }
  });

  test('ensures cookies function is called', async () => {
    const mockJWT = {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue(mockToken),
    };

    mockedSignJWT.mockReturnValue(mockJWT as any);

    await createSession(mockUserId, mockEmail);

    expect(mockedCookies).toHaveBeenCalled();
  });
});