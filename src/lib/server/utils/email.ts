import * as brevo from '@getbrevo/brevo';
import { env } from '$env/dynamic/private';

interface EmailOptions {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}

/**
 * Send email using Brevo (formerly Sendinblue)
 * Super simple - just needs one API key!
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
	const apiKey = env.BREVO_API_KEY;
	
	if (!apiKey) {
		console.warn('⚠️ BREVO_API_KEY not set in .env');
		console.warn('⚠️ Get FREE API key at: https://app.brevo.com/settings/keys/api');
		return false;
	}

	try {
		const apiInstance = new brevo.TransactionalEmailsApi();
		apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

		const sendSmtpEmail = new brevo.SendSmtpEmail();
		// Use a verified sender email - you need to verify this in Brevo dashboard
		const senderEmail = env.BREVO_SENDER_EMAIL || 'giddel100@gmail.com';
		sendSmtpEmail.sender = { email: senderEmail, name: 'University Staff Directory' };
		sendSmtpEmail.to = [{ email: options.to }];
		sendSmtpEmail.subject = options.subject;
		sendSmtpEmail.htmlContent = options.html || options.text || '';
		sendSmtpEmail.textContent = options.text;

		await apiInstance.sendTransacEmail(sendSmtpEmail);

		console.log('✅ Email sent successfully to:', options.to);
		return true;
	} catch (error) {
		console.error('❌ Failed to send email:', error);
		return false;
	}
}

/**
 * Send registration approval notification to staff
 */
export async function sendRegistrationApprovalEmail(to: string, fullName: string): Promise<boolean> {
	return sendEmail({
		to,
		subject: 'Staff Directory Registration Approved',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #333;">Registration Approved</h2>
				<p>Dear ${fullName},</p>
				<p>Your registration for the University Staff Directory has been approved by the administrator.</p>
				<p>You can now log in to your account and manage your profile.</p>
				<p>Thank you for joining our directory.</p>
				<br>
				<p style="color: #666; font-size: 12px;">
					This is an automated message. Please do not reply to this email.
				</p>
			</div>
		`,
		text: `Dear ${fullName},\n\nYour registration for the University Staff Directory has been approved by the administrator.\n\nYou can now log in to your account and manage your profile.\n\nThank you for joining our directory.`
	});
}

/**
 * Send registration rejection notification to staff
 */
export async function sendRegistrationRejectionEmail(to: string, fullName: string): Promise<boolean> {
	return sendEmail({
		to,
		subject: 'Staff Directory Registration - Update',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #333;">Registration Update</h2>
				<p>Dear ${fullName},</p>
				<p>Thank you for your interest in joining the University Staff Directory.</p>
				<p>After reviewing your application, we regret to inform you that your registration could not be approved at this time.</p>
				<p>If you believe this is an error or have questions, please contact the administrator for more information.</p>
				<br>
				<p style="color: #666; font-size: 12px;">
					This is an automated message. Please do not reply to this email.
				</p>
			</div>
		`,
		text: `Dear ${fullName},\n\nThank you for your interest in joining the University Staff Directory.\n\nAfter reviewing your application, we regret to inform you that your registration could not be approved at this time.\n\nIf you believe this is an error or have questions, please contact the administrator for more information.`
	});
}

/**
 * Send registration notification to admin
 */
export async function sendNewRegistrationNotification(staffEmail: string, fullName: string, staffId: string): Promise<boolean> {
	const adminEmail = env.ADMIN_EMAIL;
	
	if (!adminEmail) {
		console.warn('⚠️ ADMIN_EMAIL not configured. Notification not sent.');
		return false;
	}

	return sendEmail({
		to: adminEmail,
		subject: 'New Staff Registration Pending Approval',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #333;">New Staff Registration</h2>
				<p>A new staff member has registered and is awaiting approval:</p>
				<ul>
					<li><strong>Name:</strong> ${fullName}</li>
					<li><strong>Staff ID:</strong> ${staffId}</li>
					<li><strong>Email:</strong> ${staffEmail}</li>
				</ul>
				<p>Please log in to the admin panel to review and approve this registration.</p>
				<br>
				<p style="color: #666; font-size: 12px;">
					This is an automated message. Please do not reply to this email.
				</p>
			</div>
		`,
		text: `New Staff Registration\n\nA new staff member has registered and is awaiting approval:\n\nName: ${fullName}\nStaff ID: ${staffId}\nEmail: ${staffEmail}\n\nPlease log in to the admin panel to review and approve this registration.`
	});
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, resetToken: string, fullName: string): Promise<boolean> {
	const resetUrl = `${env.PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

	return sendEmail({
		to,
		subject: 'Password Reset Request',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #333;">Password Reset Request</h2>
				<p>Dear ${fullName},</p>
				<p>You have requested to reset your password. Click the link below to proceed:</p>
				<p style="margin: 20px 0;">
					<a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
						Reset Password
					</a>
				</p>
				<p>If you did not request this, please ignore this email.</p>
				<p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
				<br>
				<p style="color: #666; font-size: 12px;">
					This is an automated message. Please do not reply to this email.
				</p>
			</div>
		`,
		text: `Dear ${fullName},\n\nYou have requested to reset your password. Visit the link below to proceed:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nThis link will expire in 1 hour.`
	});
}
