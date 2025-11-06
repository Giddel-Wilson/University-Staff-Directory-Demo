import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILog extends Document {
	_id: mongoose.Types.ObjectId;
	adminId: mongoose.Types.ObjectId;
	action: string;
	actionType: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject' | 'export';
	targetModel: 'User' | 'Admin' | 'System';
	targetId?: mongoose.Types.ObjectId;
	details?: Record<string, unknown>;
	ipAddress?: string;
	userAgent?: string;
	timestamp: Date;
}

const LogSchema = new Schema<ILog>(
	{
		adminId: {
			type: Schema.Types.ObjectId,
			ref: 'Admin',
			required: true,
			index: true
		},
		action: {
			type: String,
			required: [true, 'Action description is required'],
			trim: true,
			maxlength: [500, 'Action description must not exceed 500 characters']
		},
		actionType: {
			type: String,
			enum: ['create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export'],
			required: true,
			index: true
		},
		targetModel: {
			type: String,
			enum: ['User', 'Admin', 'System'],
			required: true,
			index: true
		},
		targetId: {
			type: Schema.Types.ObjectId,
			index: true
		},
		details: {
			type: Schema.Types.Mixed,
			default: {}
		},
		ipAddress: {
			type: String,
			trim: true
		},
		userAgent: {
			type: String,
			trim: true
		},
		timestamp: {
			type: Date,
			default: Date.now
		}
	},
	{
		timestamps: false
	}
);

// Index for querying logs by admin and time range
LogSchema.index({ adminId: 1, timestamp: -1 });
LogSchema.index({ targetModel: 1, targetId: 1, timestamp: -1 });

// TTL index to automatically delete logs older than 90 days
LogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const Log: Model<ILog> = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
