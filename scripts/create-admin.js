#!/usr/bin/env node

/**
 * Script to create the first admin user
 * Run with: node scripts/create-admin.js
 */

import { config } from 'dotenv';
config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function question(query) {
	return new Promise((resolve) => rl.question(query, resolve));
}

const AdminSchema = new mongoose.Schema({
	username: String,
	email: String,
	passwordHash: String,
	role: String,
	fullName: String,
	isActive: Boolean,
	createdAt: Date,
	updatedAt: Date
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createAdmin() {
	try {
		console.log('\n🎓 University Staff Directory - Admin User Creator\n');

		// Connect to MongoDB
		const MONGODB_URI = process.env.MONGODB_URI;
		if (!MONGODB_URI) {
			console.error('❌ MONGODB_URI not found in environment variables');
			process.exit(1);
		}

		console.log('📡 Connecting to MongoDB...');
		await mongoose.connect(MONGODB_URI);
		console.log('✅ Connected to MongoDB\n');

		// Get admin details
		const username = await question('Enter admin username: ');
		const email = await question('Enter admin email: ');
		const fullName = await question('Enter admin full name (optional): ');
		const password = await question('Enter admin password: ');
		const confirmPassword = await question('Confirm password: ');

		if (password !== confirmPassword) {
			console.error('\n❌ Passwords do not match!');
			process.exit(1);
		}

		if (password.length < 8) {
			console.error('\n❌ Password must be at least 8 characters long!');
			process.exit(1);
		}

		// Check if admin already exists
		const existingAdmin = await Admin.findOne({
			$or: [{ username }, { email }]
		});

		if (existingAdmin) {
			console.error('\n❌ Admin with this username or email already exists!');
			process.exit(1);
		}

		// Hash password
		console.log('\n🔐 Hashing password...');
		const passwordHash = await bcrypt.hash(password, 12);

		// Create admin
		console.log('👤 Creating admin user...');
		const admin = await Admin.create({
			username: username.toLowerCase().trim(),
			email: email.toLowerCase().trim(),
			passwordHash,
			role: 'super-admin',
			fullName: fullName.trim() || undefined,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		console.log('\n✅ Admin user created successfully!\n');
		console.log('📋 Admin Details:');
		console.log(`   Username: ${admin.username}`);
		console.log(`   Email: ${admin.email}`);
		console.log(`   Role: ${admin.role}`);
		console.log(`   ID: ${admin._id}\n`);
		console.log('🎉 You can now login at /admin/login\n');

	} catch (error) {
		console.error('\n❌ Error creating admin:', error.message);
	} finally {
		rl.close();
		await mongoose.disconnect();
		process.exit(0);
	}
}

createAdmin();
