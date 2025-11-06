import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin, getClientIP, getUserAgent } from '$lib/server/middleware/auth';
import { User } from '$lib/server/db/models';
import { logAdminAction } from '$lib/server/utils/logging';
import { sendRegistrationApprovalEmail, sendRegistrationRejectionEmail } from '$lib/server/utils/email';
import mongoose from 'mongoose';

// GET all staff (with filters for admin)
export const GET: RequestHandler = async (event) => {
	try {
		const { admin } = await requireAdmin(event);
		const { url } = event;

		// Extract query parameters
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
		const status = url.searchParams.get('status');
		const faculty = url.searchParams.get('faculty');
		const department = url.searchParams.get('department');
		const search = url.searchParams.get('search');

		// Build query
		const query: Record<string, unknown> = {};
		
		// Handle status filter
		if (status === 'pending') {
			query.isApproved = false;
		} else if (status === 'approved') {
			query.isApproved = true;
		} else if (status === 'rejected') {
			query.isApproved = false;
			query.isActive = false;
		}
		
		if (faculty) query.faculty = faculty;
		if (department) query.department = department;

		// Text search
		if (search && search.trim()) {
			query.$or = [
				{ fullName: { $regex: search, $options: 'i' } },
				{ staffId: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } }
			];
		}

		// Calculate pagination
		const skip = (page - 1) * limit;

		// Execute query
		const [staff, total] = await Promise.all([
			User.find(query)
				.select('-passwordHash')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			User.countDocuments(query)
		]);

		// Calculate pagination info
		const totalPages = Math.ceil(total / limit);

		// Log action
		await logAdminAction({
			admin,
			action: `Viewed staff list (${staff.length} records)`,
			actionType: 'approve',
			targetModel: 'System',
			ipAddress: getClientIP(event),
			userAgent: getUserAgent(event)
		});

		return json(
			{
				success: true,
				staff: staff,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1
				}
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

		console.error('Admin staff list error:', error);
		return json(
			{ error: 'Failed to fetch staff list' },
			{ status: 500 }
		);
	}
};

// PUT update staff by ID
export const PUT: RequestHandler = async (event) => {
	try {
		const { admin } = await requireAdmin(event);
		const body = await event.request.json();
		const { id, ...updates } = body;

		if (!id) {
			return json(
				{ error: 'Staff ID is required' },
				{ status: 400 }
			);
		}

		// Find and update staff
		const staff = await User.findById(id);
		if (!staff) {
			return json(
				{ error: 'Staff member not found' },
				{ status: 404 }
			);
		}

		// Store old values for logging
		const oldValues = { ...staff.toObject() };

		// Apply updates
		Object.assign(staff, updates);
		await staff.save();

		// Log action
		await logAdminAction({
			admin,
			action: `Updated staff profile for ${staff.fullName}`,
			actionType: 'update',
			targetModel: 'User',
			targetId: staff._id,
			details: { oldValues, newValues: updates },
			ipAddress: getClientIP(event),
			userAgent: getUserAgent(event)
		});

		return json(
			{
				success: true,
				message: 'Staff profile updated successfully',
				staff: staff.toJSON()
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

		console.error('Admin staff update error:', error);
		return json(
			{ error: 'Failed to update staff profile' },
			{ status: 500 }
		);
	}
};

// DELETE staff by ID
export const DELETE: RequestHandler = async (event) => {
	try {
		const { admin } = await requireAdmin(event);
		const { url } = event;
		const id = url.searchParams.get('id');

		if (!id) {
			return json(
				{ error: 'Staff ID is required' },
				{ status: 400 }
			);
		}

		// Find and delete staff
		const staff = await User.findByIdAndDelete(id);
		if (!staff) {
			return json(
				{ error: 'Staff member not found' },
				{ status: 404 }
			);
		}

		// Log action
		await logAdminAction({
			admin,
			action: `Deleted staff profile for ${staff.fullName} (${staff.staffId})`,
			actionType: 'delete',
			targetModel: 'User',
			targetId: new mongoose.Types.ObjectId(id),
			details: { deletedStaff: staff.toJSON() },
			ipAddress: getClientIP(event),
			userAgent: getUserAgent(event)
		});

		return json(
			{
				success: true,
				message: 'Staff profile deleted successfully'
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

		console.error('Admin staff delete error:', error);
		return json(
			{ error: 'Failed to delete staff profile' },
			{ status: 500 }
		);
	}
};

// PATCH approve/verify staff
export const PATCH: RequestHandler = async (event) => {
	try {
		const { admin } = await requireAdmin(event);
		const body = await event.request.json();
		const { id, action: approvalAction } = body;

		if (!id || !approvalAction) {
			return json(
				{ error: 'Staff ID and action are required' },
				{ status: 400 }
			);
		}

		const staff = await User.findById(id);
		if (!staff) {
			return json(
				{ error: 'Staff member not found' },
				{ status: 404 }
			);
		}

		if (approvalAction === 'approve') {
			staff.isApproved = true;
			staff.isVerified = true;
			await staff.save();

			// Send approval email
			await sendRegistrationApprovalEmail(staff.email, staff.fullName);

			// Log action
			await logAdminAction({
				admin,
				action: `Approved staff registration for ${staff.fullName}`,
				actionType: 'approve',
				targetModel: 'User',
				targetId: staff._id,
				ipAddress: getClientIP(event),
				userAgent: getUserAgent(event)
			});

			return json(
				{
					success: true,
					message: 'Staff registration approved successfully',
					staff: staff.toJSON()
				},
				{ status: 200 }
			);
		} else if (approvalAction === 'reject') {
			// Send rejection email before deleting the user
			await sendRegistrationRejectionEmail(staff.email, staff.fullName);

			await User.findByIdAndDelete(id);

			// Log action
			await logAdminAction({
				admin,
				action: `Rejected staff registration for ${staff.fullName}`,
				actionType: 'reject',
				targetModel: 'User',
				targetId: new mongoose.Types.ObjectId(id),
				ipAddress: getClientIP(event),
				userAgent: getUserAgent(event)
			});

			return json(
				{
					success: true,
					message: 'Staff registration rejected'
				},
				{ status: 200 }
			);
		} else {
			return json(
				{ error: 'Invalid action' },
				{ status: 400 }
			);
		}
	} catch (error) {
		if (error instanceof Error && error.message.includes('Unauthorized')) {
			return json(
				{ error: error.message },
				{ status: 401 }
			);
		}

		console.error('Admin staff approval error:', error);
		return json(
			{ error: 'Failed to process staff approval' },
			{ status: 500 }
		);
	}
};
