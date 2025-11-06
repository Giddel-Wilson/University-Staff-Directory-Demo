import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
	try {
		// Clear authentication cookie
		cookies.delete('auth_token', { path: '/' });

		return json(
			{
				success: true,
				message: 'Logout successful'
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Logout error:', error);
		return json(
			{ error: 'Logout failed' },
			{ status: 500 }
		);
	}
};
