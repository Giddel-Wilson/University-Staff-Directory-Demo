import { Log, type ILog } from '../db/models';
import type { IAdmin } from '../db/models/Admin';
import mongoose from 'mongoose';

interface LogActionOptions {
	admin: IAdmin;
	action: string;
	actionType: ILog['actionType'];
	targetModel: ILog['targetModel'];
	targetId?: mongoose.Types.ObjectId | string;
	details?: Record<string, unknown>;
	ipAddress?: string;
	userAgent?: string;
}

/**
 * Log admin action to database
 */
export async function logAdminAction(options: LogActionOptions): Promise<ILog | null> {
	try {
		const log = await Log.create({
			adminId: options.admin._id,
			action: options.action,
			actionType: options.actionType,
			targetModel: options.targetModel,
			targetId: options.targetId ? new mongoose.Types.ObjectId(options.targetId.toString()) : undefined,
			details: options.details || {},
			ipAddress: options.ipAddress,
			userAgent: options.userAgent,
			timestamp: new Date()
		});

		return log;
	} catch (error) {
		console.error('Failed to log admin action:', error);
		return null;
	}
}

/**
 * Get recent logs for admin dashboard
 */
export async function getRecentLogs(limit = 50, adminId?: string) {
	const query = adminId ? { adminId: new mongoose.Types.ObjectId(adminId) } : {};
	
	return Log.find(query)
		.sort({ timestamp: -1 })
		.limit(limit)
		.populate('adminId', 'username email')
		.lean();
}

/**
 * Get logs by target
 */
export async function getLogsByTarget(targetModel: string, targetId: string) {
	return Log.find({
		targetModel,
		targetId: new mongoose.Types.ObjectId(targetId)
	})
		.sort({ timestamp: -1 })
		.populate('adminId', 'username email')
		.lean();
}

/**
 * Clean up old logs (called by cron job)
 */
export async function cleanupOldLogs(daysToKeep = 90): Promise<number> {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

	const result = await Log.deleteMany({
		timestamp: { $lt: cutoffDate }
	});

	console.log(`🗑️ Cleaned up ${result.deletedCount} old log entries`);
	return result.deletedCount;
}
