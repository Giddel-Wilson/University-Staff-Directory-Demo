import { json, type RequestHandler } from '@sveltejs/kit';
import { requireUser } from '$lib/server/middleware/auth';
import { User } from '$lib/server/db/models';
import { z } from 'zod';

const updateProfileSchema = z.object({
	fullName: z.string().min(2).max(100).optional(),
	faculty: z.string().min(2).optional(),
	department: z.string().min(2).optional(),
	designation: z.string().min(2).optional(),
	phoneNumber: z.string().optional(),
	officeLocation: z.string().max(200).optional(),
	officeHours: z.string().max(200).optional(),
	researchInterests: z.string().max(1000).optional(),
	biography: z.string().max(2000).optional(),
	education: z.string().max(1000).optional(),
	publications: z.string().max(2000).optional(),
	photoUrl: z.string().url().optional().or(z.literal(''))
});

// GET current user profile
export const GET: RequestHandler = async (event) => {
	try {
		const { user } = await requireUser(event);

		return json(
			{
				success: true,
				user: user.toJSON()
			},
			{ status: 200 }
		);
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Unauthorized' },
			{ status: 401 }
		);
	}
};

// PUT update user profile
export const PUT: RequestHandler = async (event) => {
	try {
		const { user } = await requireUser(event);
		const body = await event.request.json();

		// Validate input
		const validationResult = updateProfileSchema.safeParse(body);
		if (!validationResult.success) {
			return json(
				{ 
					error: 'Validation failed', 
					details: validationResult.error.flatten().fieldErrors 
				},
				{ status: 400 }
			);
		}

		const updates = validationResult.data;

		// Update user profile - handle field name mapping
		if (updates.phoneNumber !== undefined) {
			user.contactNumber = updates.phoneNumber;
		}
		if (updates.officeLocation !== undefined) {
			user.officeAddress = updates.officeLocation;
		}
		if (updates.officeHours !== undefined) {
			user.officeHours = updates.officeHours;
		}
		if (updates.biography !== undefined) {
			user.biography = updates.biography;
		}
		if (updates.researchInterests !== undefined) {
			user.researchInterests = updates.researchInterests;
		}
		if (updates.education !== undefined) {
			user.education = updates.education;
		}
		if (updates.publications !== undefined) {
			user.publications = updates.publications;
		}
		if (updates.fullName !== undefined) {
			user.fullName = updates.fullName;
		}
		if (updates.faculty !== undefined) {
			user.faculty = updates.faculty;
		}
		if (updates.department !== undefined) {
			user.department = updates.department;
		}
		if (updates.designation !== undefined) {
			user.designation = updates.designation;
		}
		if (updates.photoUrl !== undefined) {
			user.photoUrl = updates.photoUrl;
		}
		
		await user.save();

		return json(
			{
				success: true,
				message: 'Profile updated successfully',
				user: user.toJSON()
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof Error && error.message.includes('Unauthorized')) {
			return json(
				{ error: error.message },
				{ status: 401 }
			);
		}

		console.error('Profile update error:', error);
		return json(
			{ error: 'Profile update failed' },
			{ status: 500 }
		);
	}
};

// DELETE user account (soft delete - deactivate)
export const DELETE: RequestHandler = async (event) => {
	try {
		const { user } = await requireUser(event);

		// Soft delete - deactivate account
		user.isActive = false;
		await user.save();

		// Clear authentication cookie
		event.cookies.delete('auth_token', { path: '/' });

		return json(
			{
				success: true,
				message: 'Account deactivated successfully'
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof Error && error.message.includes('Unauthorized')) {
			return json(
				{ error: error.message },
				{ status: 401 }
			);
		}

		console.error('Account deletion error:', error);
		return json(
			{ error: 'Account deletion failed' },
			{ status: 500 }
		);
	}
};
