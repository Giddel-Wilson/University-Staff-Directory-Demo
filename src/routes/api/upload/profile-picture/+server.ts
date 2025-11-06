import { json, type RequestHandler } from '@sveltejs/kit';
import { requireUser } from '$lib/server/middleware/auth';
import { v2 as cloudinary } from 'cloudinary';
import User from '$lib/server/db/models/User';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

export const POST: RequestHandler = async (event) => {
	try {
		const { user } = await requireUser(event);
		const formData = await event.request.formData();
		const file = formData.get('profilePicture') as File;

		if (!file) {
			return json({ error: 'No file uploaded' }, { status: 400 });
		}

		// Validate file type
		if (!ALLOWED_TYPES.includes(file.type)) {
			return json(
				{ error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
				{ status: 400 }
			);
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			return json(
				{ error: 'File too large. Maximum size is 5MB.' },
				{ status: 400 }
			);
		}

		// Convert file to base64 for Cloudinary upload
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const base64 = buffer.toString('base64');
		const dataURI = `data:${file.type};base64,${base64}`;

		// Upload to Cloudinary
		const uploadResult = await cloudinary.uploader.upload(dataURI, {
			folder: 'university-staff-profiles',
			public_id: `${user._id}-${Date.now()}`,
			transformation: [
				{ width: 500, height: 500, crop: 'fill', gravity: 'face' },
				{ quality: 'auto', fetch_format: 'auto' }
			]
		});

		// Get the optimized URL
		const photoUrl = uploadResult.secure_url;

		// Update user profile in database
		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{ photoUrl },
			{ new: true }
		);

		if (!updatedUser) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({
			success: true,
			photoUrl,
			message: 'Profile picture uploaded successfully'
		});
	} catch (error) {
		if (error instanceof Error && error.message.includes('Unauthorized')) {
			return json({ error: error.message }, { status: 401 });
		}

		console.error('Upload error:', error);
		return json({ error: 'Upload failed' }, { status: 500 });
	}
};
