import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db/connection';
import { User } from '$lib/server/db/models';

interface SearchFilters {
	faculty?: string;
	department?: string;
	designation?: string;
	isApproved?: boolean;
	searchText?: string;
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		await connectDB();

		// Extract query parameters
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
		const faculty = url.searchParams.get('faculty');
		const department = url.searchParams.get('department');
		const designation = url.searchParams.get('designation');
		const search = url.searchParams.get('search');
		const sortBy = url.searchParams.get('sortBy') || 'fullName';
		const sortOrder = url.searchParams.get('sortOrder') === 'desc' ? -1 : 1;

		// Build query filters
		const filters: SearchFilters = {
			isApproved: true
		} as SearchFilters;

		if (faculty) filters.faculty = faculty;
		if (department) filters.department = department;
		if (designation) filters.designation = designation;

		// Text search
		let query: unknown = filters;
		if (search && search.trim()) {
			query = {
				...filters,
				$or: [
					{ fullName: { $regex: search, $options: 'i' } },
					{ staffId: { $regex: search, $options: 'i' } },
					{ department: { $regex: search, $options: 'i' } },
					{ designation: { $regex: search, $options: 'i' } },
					{ researchInterests: { $regex: search, $options: 'i' } }
				]
			};
		}

		// Calculate pagination
		const skip = (page - 1) * limit;

		// Execute query
		const [staff, total] = await Promise.all([
			User.find(query as Record<string, unknown>)
				.select('-passwordHash -__v')
				.sort({ [sortBy]: sortOrder })
				.skip(skip)
				.limit(limit)
				.lean(),
			User.countDocuments(query as Record<string, unknown>)
		]);

		// Calculate pagination info
		const totalPages = Math.ceil(total / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return json(
			{
				success: true,
				staff: staff,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNextPage,
					hasPrevPage
				}
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Search error:', error);
		return json(
			{ error: 'Search failed' },
			{ status: 500 }
		);
	}
};
