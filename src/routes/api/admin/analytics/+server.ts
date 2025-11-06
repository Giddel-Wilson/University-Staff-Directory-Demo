import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/middleware/auth';
import { User } from '$lib/server/db/models';

export const GET: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);

		// Get analytics data
		const [
			totalStaff,
			verifiedStaff,
			pendingStaff,
			staffByFaculty,
			staffByDepartment
		] = await Promise.all([
			// Total staff count (exclude admins)
			User.countDocuments({ role: { $ne: 'super-admin' } }),
			
			// Approved staff count
			User.countDocuments({ isApproved: true }),
			
			// Pending approval count (isApproved is false or doesn't exist)
			User.countDocuments({ 
				role: { $ne: 'super-admin' },
				$or: [
					{ isApproved: false },
					{ isApproved: { $exists: false } }
				]
			}),
			
			// Staff grouped by faculty
			User.aggregate([
				{ $match: { isApproved: true } },
				{ $group: { _id: '$faculty', count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
				{ $limit: 20 }
			]),
			
			// Staff grouped by department
			User.aggregate([
				{ $match: { isApproved: true } },
				{ $group: { _id: '$department', count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
				{ $limit: 20 }
			])
		]);

		// Get recent staff members (last 10, exclude admins)
		const recentStaffMembers = await User.find({ role: { $ne: 'super-admin' } })
			.sort({ createdAt: -1 })
			.limit(10)
			.select('fullName designation department faculty isApproved createdAt')
			.lean();

		// Format the data for dashboard
		const stats = {
			totalStaff,
			approvedStaff: verifiedStaff,
			pendingApproval: pendingStaff,
			totalFaculties: staffByFaculty.length,
			staffByFaculty: staffByFaculty.map((item) => ({
				_id: item._id,
				count: item.count
			})),
			staffByDepartment: staffByDepartment.map((item) => ({
				_id: item._id,
				count: item.count
			})),
			recentRegistrations: recentStaffMembers
		};

		return json(
			{
				success: true,
				stats
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

		console.error('Analytics error:', error);
		return json(
			{ error: 'Failed to fetch analytics' },
			{ status: 500 }
		);
	}
};
