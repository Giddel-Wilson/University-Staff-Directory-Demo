import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAdmin extends Document {
	_id: mongoose.Types.ObjectId;
	username: string;
	email: string;
	passwordHash: string;
	role: 'admin' | 'super-admin';
	fullName?: string;
	lastLogin?: Date;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
	{
		username: {
			type: String,
			required: [true, 'Username is required'],
			unique: true,
			trim: true,
			lowercase: true,
			minlength: [3, 'Username must be at least 3 characters'],
			maxlength: [50, 'Username must not exceed 50 characters'],
			match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, hyphens, and underscores'],
			index: true
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
			index: true
		},
		passwordHash: {
			type: String,
			required: [true, 'Password is required'],
			select: false
		},
		role: {
			type: String,
			enum: ['admin', 'super-admin'],
			default: 'admin',
			required: true,
			index: true
		},
		fullName: {
			type: String,
			trim: true,
			maxlength: [100, 'Full name must not exceed 100 characters']
		},
		lastLogin: {
			type: Date,
			default: null
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true
		}
	},
	{
		timestamps: true,
		toJSON: {
			transform: function (_doc, ret) {
				const obj = ret as Record<string, unknown>;
				delete obj.passwordHash;
				delete obj.__v;
				return obj;
			}
		}
	}
);

export const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
