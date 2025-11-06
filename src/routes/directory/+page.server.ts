import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	// Check if user is logged in
	const authToken = cookies.get('auth_token');
	const userRole = cookies.get('user_role');
	
	return {
		isAuthenticated: !!authToken,
		userRole: userRole || null
	};
};
