import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db/connection';
import { Admin } from '$lib/server/db/models';
import { verifyPassword, generateAdminToken, cookieOptions } from '$lib/server/auth';
import { logAdminAction } from '$lib/server/utils/logging';
import { getClientIP, getUserAgent } from '$lib/server/middleware/auth';
import { z } from 'zod';

const loginSchema = z.object({
	username: z.string().min(3, 'Username is required'),
	password: z.string().min(1, 'Password is required')
});

export const POST: RequestHandler = async (event) => {
	try {
		await connectDB();

		const body = await event.request.json();
		
		// Validate input
		const validationResult = loginSchema.safeParse(body);
		if (!validationResult.success) {
			return json(
				{ 
					error: 'Validation failed', 
					details: validationResult.error.flatten().fieldErrors 
				},
				{ status: 400 }
			);
		}

		const { username, password } = validationResult.data;

		// Find admin with password field
		const admin = await Admin.findOne({ 
			username: username.toLowerCase(),
			isActive: true 
		}).select('+passwordHash');
		
		if (!admin) {
			return json(
				{ error: 'Invalid username or password' },
				{ status: 401 }
			);
		}

		// Verify password
		const isValidPassword = await verifyPassword(password, admin.passwordHash);
		if (!isValidPassword) {
			return json(
				{ error: 'Invalid username or password' },
				{ status: 401 }
			);
		}

		// Update last login
		admin.lastLogin = new Date();
		await admin.save();

		// Log the login action
		await logAdminAction({
			admin,
			action: `Admin ${admin.username} logged in`,
			actionType: 'login',
			targetModel: 'Admin',
			targetId: admin._id,
			ipAddress: getClientIP(event),
			userAgent: getUserAgent(event)
		});

		// Generate JWT token
		const token = generateAdminToken(admin);

		// Set auth cookies
		event.cookies.set('auth_token', token, cookieOptions);
		event.cookies.set('user_role', 'super-admin', cookieOptions);

		// Return admin data (without password)
		const adminData = admin.toJSON();
		
		return json(
			{
				success: true,
				message: 'Login successful',
				token,
				admin: adminData
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error('Admin login error:', error);
		return json(
			{ error: 'Login failed. Please try again.' },
			{ status: 500 }
		);
	}
};
