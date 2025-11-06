#!/usr/bin/env node

import { config } from 'dotenv';
config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminSchema = new mongoose.Schema({
	username: String,
	email: String,
	passwordHash: String,
	role: String,
	fullName: String,
	isActive: Boolean,
	createdAt: Date,
	updatedAt: Date,
	lastLogin: Date
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createQuickAdmin() {
	try {
		console.log('\n🎓 Creating default admin user...\n');

		await mongoose.connect(process.env.MONGODB_URI);
		console.log('✅ Connected to MongoDB\n');

		// Default credentials
		const username = 'admin';
		const email = 'admin@university.edu';
		const fullName = 'System Administrator';
		const password = 'Admin@123';

		// Check if admin exists
		const existingAdmin = await Admin.findOne({ username });
		if (existingAdmin) {
			console.log('⚠️  Admin user already exists!');
			console.log('   Username:', username);
			console.log('   Email:', existingAdmin.email);
			process.exit(0);
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, 12);

		// Create admin
		await Admin.create({
			username,
			email,
			passwordHash,
			role: 'super-admin',
			fullName,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		console.log('✅ Admin user created successfully!\n');
		console.log('📋 Login Credentials:');
		console.log('   URL: http://localhost:5173/admin/login');
		console.log('   Username:', username);
		console.log('   Password:', password);
		console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');

		process.exit(0);
	} catch (error) {
		console.error('❌ Error:', error.message);
		process.exit(1);
	}
}

createQuickAdmin();
