import { json, type RequestHandler } from '@sveltejs/kit';
import { requireUser } from '$lib/server/middleware/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = 'static/uploads/profiles';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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

		// Create upload directory if it doesn't exist
		if (!existsSync(UPLOAD_DIR)) {
			await mkdir(UPLOAD_DIR, { recursive: true });
		}

		// Generate unique filename
		const ext = path.extname(file.name);
		const filename = `${user._id}-${Date.now()}${ext}`;
		const filepath = path.join(UPLOAD_DIR, filename);

		// Save file
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		await writeFile(filepath, buffer);

		// Generate URL
		const photoUrl = `/uploads/profiles/${filename}`;

		// Update user profile
		user.photoUrl = photoUrl;
		await user.save();

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
