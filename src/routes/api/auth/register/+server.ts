import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db/connection';
import { User } from '$lib/server/db/models';
import { hashPassword, validatePasswordStrength } from '$lib/server/auth';
import { sendNewRegistrationNotification } from '$lib/server/utils/email';
import { z } from 'zod';

const registerSchema = z.object({
	fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
	staffId: z.string().min(3, 'Staff ID is required'),
	faculty: z.string().min(2, 'Faculty is required'),
	department: z.string().min(2, 'Department is required'),
	designation: z.string().min(2, 'Designation is required'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	officeAddress: z.string().optional(),
	contactNumber: z.string().optional(),
	researchInterests: z.string().optional(),
	biography: z.string().optional()
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		await connectDB();

		const body = await request.json();
		
		// Validate input
		const validationResult = registerSchema.safeParse(body);
		if (!validationResult.success) {
			return json(
				{ 
					error: 'Validation failed', 
					details: validationResult.error.flatten().fieldErrors 
				},
				{ status: 400 }
			);
		}

		const data = validationResult.data;

		// Validate password strength
		const passwordValidation = validatePasswordStrength(data.password);
		if (!passwordValidation.valid) {
			return json(
				{ 
					error: 'Password does not meet requirements', 
					details: passwordValidation.errors 
				},
				{ status: 400 }
			);
		}

		// Check if email already exists
		const existingEmail = await User.findOne({ email: data.email.toLowerCase() });
		if (existingEmail) {
			return json(
				{ error: 'Email already registered' },
				{ status: 409 }
			);
		}

		// Check if staff ID already exists
		const existingStaffId = await User.findOne({ staffId: data.staffId.toUpperCase() });
		if (existingStaffId) {
			return json(
				{ error: 'Staff ID already registered' },
				{ status: 409 }
			);
		}

		// Hash password
		const passwordHash = await hashPassword(data.password);

		// Create user (not verified by default)
		const user = await User.create({
			fullName: data.fullName.trim(),
			staffId: data.staffId.toUpperCase().trim(),
			faculty: data.faculty.trim(),
			department: data.department.trim(),
			designation: data.designation.trim(),
			email: data.email.toLowerCase().trim(),
			passwordHash,
			officeAddress: data.officeAddress?.trim(),
			contactNumber: data.contactNumber?.trim(),
			researchInterests: data.researchInterests?.trim(),
			biography: data.biography?.trim(),
			isVerified: false,
			isActive: true
		});

		// Send notification to admin
		await sendNewRegistrationNotification(user.email, user.fullName, user.staffId);

		// Return success (without sensitive data)
		return json(
			{
				success: true,
				message: 'Registration successful. Your account is pending admin approval.',
				user: {
					id: user._id,
					fullName: user.fullName,
					email: user.email,
					staffId: user.staffId,
					isVerified: user.isVerified
				}
			},
			{ status: 201 }
		);

	} catch (error) {
		console.error('Registration error:', error);
		return json(
			{ error: 'Registration failed. Please try again.' },
			{ status: 500 }
		);
	}
};
