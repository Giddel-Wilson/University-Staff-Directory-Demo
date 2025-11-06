import type { RequestEvent } from '@sveltejs/kit';
import { verifyToken, type TokenPayload } from '../auth';
import { User, Admin } from '../db/models';
import { connectDB } from '../db/connection';

export interface AuthenticatedUser {
	id: string;
	email: string;
	type: 'user' | 'admin';
	role?: 'admin' | 'super-admin';
}

/**
 * Extract and verify authentication token from request
 */
export function getAuthToken(event: RequestEvent): string | null {
	// Check Authorization header first
	const authHeader = event.request.headers.get('Authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.substring(7);
	}

	// Check cookies
	const token = event.cookies.get('auth_token');
	return token || null;
}

/**
 * Verify and decode authentication token
 */
export function validateAuth(event: RequestEvent): TokenPayload | null {
	const token = getAuthToken(event);
	if (!token) {
		return null;
	}

	try {
		return verifyToken(token);
	} catch {
		return null;
	}
}

/**
 * Require user authentication
 * Throws error if user is not authenticated
 */
export async function requireUser(event: RequestEvent) {
	await connectDB();
	
	const auth = validateAuth(event);
	if (!auth || auth.type !== 'user') {
		throw new Error('Unauthorized: User authentication required');
	}

	const user = await User.findById(auth.id).select('-passwordHash');
	if (!user) {
		throw new Error('Unauthorized: User not found');
	}

	if (!user.isActive) {
		throw new Error('Unauthorized: Account is inactive');
	}

	return { user, auth };
}

/**
 * Require admin authentication
 * Throws error if admin is not authenticated
 */
export async function requireAdmin(event: RequestEvent, requireSuperAdmin = false) {
	await connectDB();
	
	const auth = validateAuth(event);
	if (!auth || auth.type !== 'admin') {
		throw new Error('Unauthorized: Admin authentication required');
	}

	if (requireSuperAdmin && auth.role !== 'super-admin') {
		throw new Error('Unauthorized: Super admin privileges required');
	}

	const admin = await Admin.findById(auth.id).select('-passwordHash');
	if (!admin) {
		throw new Error('Unauthorized: Admin not found');
	}

	if (!admin.isActive) {
		throw new Error('Unauthorized: Admin account is inactive');
	}

	return { admin, auth };
}

/**
 * Optional authentication - returns user/admin if authenticated, null otherwise
 */
export async function optionalAuth(event: RequestEvent) {
	await connectDB();
	
	const auth = validateAuth(event);
	if (!auth) {
		return null;
	}

	try {
		if (auth.type === 'user') {
			const user = await User.findById(auth.id).select('-passwordHash');
			return user ? { user, auth, type: 'user' as const } : null;
		} else if (auth.type === 'admin') {
			const admin = await Admin.findById(auth.id).select('-passwordHash');
			return admin ? { admin, auth, type: 'admin' as const } : null;
		}
	} catch {
		return null;
	}

	return null;
}

/**
 * Get client IP address from request
 */
export function getClientIP(event: RequestEvent): string {
	try {
		const forwarded = event.request.headers.get('x-forwarded-for');
		if (forwarded) {
			return forwarded.split(',')[0].trim();
		}
		
		const realIp = event.request.headers.get('x-real-ip');
		if (realIp) {
			return realIp;
		}
		
		return event.getClientAddress();
	} catch {
		// In development or when client address can't be determined
		return '127.0.0.1';
	}
}

/**
 * Get user agent from request
 */
export function getUserAgent(event: RequestEvent): string {
	return event.request.headers.get('user-agent') || 'unknown';
}
