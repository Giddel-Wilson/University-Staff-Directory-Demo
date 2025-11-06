import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db/connection';
import { User } from '$lib/server/db/models';
import { verifyPassword, generateUserToken, cookieOptions } from '$lib/server/auth';
import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		await connectDB();

		const body = await request.json();
		
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

		const { email, password } = validationResult.data;

		// Find user with password field
		const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
		
		if (!user) {
			return json(
				{ error: 'Invalid email or password' },
				{ status: 401 }
			);
		}

		// Check if account is active
		if (!user.isActive) {
			return json(
				{ error: 'Account is inactive. Please contact administrator.' },
				{ status: 403 }
			);
		}

		// Verify password
		const isValidPassword = await verifyPassword(password, user.passwordHash);
		if (!isValidPassword) {
			return json(
				{ error: 'Invalid email or password' },
				{ status: 401 }
			);
		}

		// Check if account is verified
		if (!user.isVerified) {
			return json(
				{ 
					error: 'Account pending approval',
					message: 'Your registration is pending admin approval. Please check back later.'
				},
				{ status: 403 }
			);
		}

		// Generate JWT token
		const token = generateUserToken(user);

		// Set auth cookies
		cookies.set('auth_token', token, cookieOptions);
		cookies.set('user_role', user.role || 'staff', cookieOptions);

		// Return user data (without password)
		const userData = user.toJSON();
		
		return json(
			{
				success: true,
				message: 'Login successful',
				token,
				user: userData
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error('Login error:', error);
		return json(
			{ error: 'Login failed. Please try again.' },
			{ status: 500 }
		);
	}
};
