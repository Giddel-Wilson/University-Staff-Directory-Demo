import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
	_id: mongoose.Types.ObjectId;
	fullName: string;
	staffId: string;
	faculty: string;
	department: string;
	designation: string;
	email: string;
	passwordHash: string;
	officeAddress?: string;
	contactNumber?: string;
	officeHours?: string;
	researchInterests?: string;
	biography?: string;
	education?: string;
	publications?: string;
	photoUrl?: string;
	isVerified: boolean;
	isApproved: boolean;
	isActive: boolean;
	slug: string;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
	{
		fullName: {
			type: String,
			required: [true, 'Full name is required'],
			trim: true,
			minlength: [2, 'Name must be at least 2 characters'],
			maxlength: [100, 'Name must not exceed 100 characters']
		},
		staffId: {
			type: String,
			required: [true, 'Staff ID is required'],
			unique: true,
			trim: true,
			uppercase: true,
			index: true
		},
		faculty: {
			type: String,
			required: [true, 'Faculty is required'],
			trim: true,
			index: true
		},
		department: {
			type: String,
			required: [true, 'Department is required'],
			trim: true,
			index: true
		},
		designation: {
			type: String,
			required: [true, 'Designation is required'],
			trim: true,
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
			select: false // Don't include password in queries by default
		},
		officeAddress: {
			type: String,
			trim: true,
			maxlength: [200, 'Office address must not exceed 200 characters']
		},
		contactNumber: {
			type: String,
			trim: true,
			match: [/^[\d\s\-+()]+$/, 'Please provide a valid phone number']
		},
		officeHours: {
			type: String,
			trim: true,
			maxlength: [200, 'Office hours must not exceed 200 characters']
		},
		researchInterests: {
			type: String,
			trim: true,
			maxlength: [1000, 'Research interests must not exceed 1000 characters']
		},
		biography: {
			type: String,
			trim: true,
			maxlength: [2000, 'Biography must not exceed 2000 characters']
		},
		education: {
			type: String,
			trim: true,
			maxlength: [1000, 'Education must not exceed 1000 characters']
		},
		publications: {
			type: String,
			trim: true,
			maxlength: [2000, 'Publications must not exceed 2000 characters']
		},
		photoUrl: {
			type: String,
			trim: true,
			default: null
		},
		isVerified: {
			type: Boolean,
			default: false,
			index: true
		},
		isApproved: {
			type: Boolean,
			default: false,
			index: true
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true
		},
		slug: {
			type: String,
			unique: true,
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

// Generate slug before saving
UserSchema.pre('save', function (next) {
	if (this.isModified('fullName') || !this.slug) {
		this.slug = this.fullName
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
		
		// Add staff ID suffix to ensure uniqueness
		if (this.staffId) {
			this.slug = `${this.slug}-${this.staffId.toLowerCase()}`;
		}
	}
	next();
});

// Index for text search
UserSchema.index({
	fullName: 'text',
	department: 'text',
	faculty: 'text',
	designation: 'text',
	researchInterests: 'text'
});

// Compound indexes for common queries
UserSchema.index({ faculty: 1, department: 1 });
UserSchema.index({ isVerified: 1, isActive: 1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
