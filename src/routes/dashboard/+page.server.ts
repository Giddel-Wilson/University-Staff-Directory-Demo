import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const authToken = cookies.get('auth_token');
	const userRole = cookies.get('user_role');

	// Check if user is authenticated (staff member)
	if (!authToken) {
		throw redirect(302, '/login');
	}

	// Redirect admins to admin dashboard
	if (userRole === 'super-admin') {
		throw redirect(302, '/admin/dashboard');
	}

	return {
		isAuthenticated: true,
		userRole
	};
};
