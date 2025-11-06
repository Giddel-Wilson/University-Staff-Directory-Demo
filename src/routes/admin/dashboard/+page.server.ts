import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const authToken = cookies.get('auth_token');
	const userRole = cookies.get('user_role');

	// Check if user is authenticated and is an admin
	if (!authToken || userRole !== 'super-admin') {
		throw redirect(302, '/admin/login');
	}

	return {
		isAuthenticated: true,
		userRole
	};
};
