import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBackup extends Document {
	_id: mongoose.Types.ObjectId;
	timestamp: Date;
	backupType: 'manual' | 'scheduled' | 'pre-delete';
	status: 'pending' | 'in-progress' | 'completed' | 'failed';
	snapshotUrl?: string;
	recordCount?: {
		users: number;
		admins: number;
		logs: number;
	};
	fileSize?: number;
	error?: string;
	createdBy?: mongoose.Types.ObjectId;
	completedAt?: Date;
}

const BackupSchema = new Schema<IBackup>(
	{
		timestamp: {
			type: Date,
			default: Date.now,
			required: true,
			index: true
		},
		backupType: {
			type: String,
			enum: ['manual', 'scheduled', 'pre-delete'],
			default: 'scheduled',
			required: true
		},
		status: {
			type: String,
			enum: ['pending', 'in-progress', 'completed', 'failed'],
			default: 'pending',
			required: true,
			index: true
		},
		snapshotUrl: {
			type: String,
			trim: true
		},
		recordCount: {
			users: { type: Number, default: 0 },
			admins: { type: Number, default: 0 },
			logs: { type: Number, default: 0 }
		},
		fileSize: {
			type: Number,
			default: 0
		},
		error: {
			type: String,
			trim: true
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'Admin'
		},
		completedAt: {
			type: Date
		}
	},
	{
		timestamps: true
	}
);

// Index for finding latest successful backups
BackupSchema.index({ status: 1, timestamp: -1 });

export const Backup: Model<IBackup> = mongoose.models.Backup || mongoose.model<IBackup>('Backup', BackupSchema);
