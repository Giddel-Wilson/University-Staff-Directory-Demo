import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import type { IUser } from '../db/models';
import type { IAdmin } from '../db/models/Admin';

const SALT_ROUNDS = 12;

// Password hashing
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

// JWT token generation and verification
export interface TokenPayload {
	id: string;
	email: string;
	type: 'user' | 'admin';
	role?: 'admin' | 'super-admin';
}

export function generateToken(payload: TokenPayload): string {
	const JWT_SECRET = env.JWT_SECRET;
	const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || '7d';
	
	if (!JWT_SECRET) {
		throw new Error('JWT_SECRET is not defined');
	}

	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN as string,
		issuer: 'university-staff-directory',
		audience: 'university-staff-directory'
	} as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
	const JWT_SECRET = env.JWT_SECRET;
	
	if (!JWT_SECRET) {
		throw new Error('JWT_SECRET is not defined');
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET, {
			issuer: 'university-staff-directory',
			audience: 'university-staff-directory'
		});

		return decoded as TokenPayload;
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new Error('Token has expired');
		} else if (error instanceof jwt.JsonWebTokenError) {
			throw new Error('Invalid token');
		} else {
			throw new Error('Token verification failed');
		}
	}
}

// Generate token for user
export function generateUserToken(user: IUser): string {
	return generateToken({
		id: user._id.toString(),
		email: user.email,
		type: 'user'
	});
}

// Generate token for admin
export function generateAdminToken(admin: IAdmin): string {
	return generateToken({
		id: admin._id.toString(),
		email: admin.email,
		type: 'admin',
		role: admin.role
	});
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}

	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}

	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}

	if (!/\d/.test(password)) {
		errors.push('Password must contain at least one number');
	}

	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		errors.push('Password must contain at least one special character');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

// Session cookie options
export const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax' as const,
	maxAge: 60 * 60 * 24 * 7, // 7 days
	path: '/'
};
