import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db/connection';
import { User } from '$lib/server/db/models';

export const load: PageServerLoad = async ({ params }) => {
	try {
		await connectDB();

		const staff = await User.findOne({ 
			slug: params.slug,
			isActive: true,
			isApproved: true
		}).select('-passwordHash -__v').lean();

		if (!staff) {
			throw error(404, 'Staff member not found');
		}

		return {
			staff: JSON.parse(JSON.stringify(staff))
		};
	} catch (err) {
		console.error('Error loading staff profile:', err);
		throw error(404, 'Staff member not found');
	}
};
