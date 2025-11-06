<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { User, Mail, Phone, Building2, Award, BookOpen, LogOut, Save, CheckCircle, Upload, Camera } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';

	let user = $state<any>(null);
	let loading = $state(true);
	let saving = $state(false);
	let saveSuccess = $state(false);
	let error = $state('');
	let uploadingImage = $state(false);
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);

	// Form fields
	let formData = $state({
		fullName: '',
		phoneNumber: '',
		officeLocation: '',
		officeHours: '',
		biography: '',
		researchInterests: '',
		education: '',
		publications: ''
	});

	onMount(async () => {
		try {
			const res = await fetch('/api/staff/profile', {
				credentials: 'include'
			});

			if (!res.ok) {
				if (res.status === 401) {
					goto('/login');
					return;
				}
				throw new Error('Failed to load profile');
			}

			const data = await res.json();
			user = data.user;
			
			// Debug: Log user data
			console.log('User data from API:', user);
			
			// Set preview URL if user has a photo
			if (user.photoUrl) {
				previewUrl = user.photoUrl;
			}
			
			// Populate form - map database field names to form fields
			formData = {
				fullName: user.fullName || '',
				phoneNumber: user.phoneNumber || user.contactNumber || '',
				officeLocation: user.officeLocation || user.officeAddress || '',
				officeHours: user.officeHours || '',
				biography: user.biography || '',
				researchInterests: user.researchInterests || '',
				education: user.education || '',
				publications: user.publications || ''
			};
			
			// Debug: Log formData
			console.log('Form data populated:', formData);
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	async function handleSave(e: Event) {
		e.preventDefault();
		saving = true;
		error = '';
		saveSuccess = false;

		try {
			console.log('Saving form data:', formData);
			
			const res = await fetch('/api/staff/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(formData)
			});

			if (!res.ok) {
				const data = await res.json();
				console.error('Save failed:', data);
				throw new Error(data.message || 'Failed to update profile');
			}

			const responseData = await res.json();
			console.log('Save successful:', responseData);
			
			saveSuccess = true;
			setTimeout(() => saveSuccess = false, 3000);
		} catch (err: any) {
			error = err.message;
		} finally {
			saving = false;
		}
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (file) {
			selectedFile = file;
			// Create preview URL
			const reader = new FileReader();
			reader.onload = (e) => {
				previewUrl = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	async function handleImageUpload() {
		if (!selectedFile) return;

		uploadingImage = true;
		error = '';

		try {
			const formData = new FormData();
			formData.append('profilePicture', selectedFile);

			const res = await fetch('/api/upload/profile-picture', {
				method: 'POST',
				credentials: 'include',
				body: formData
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to upload image');
			}

			const data = await res.json();
			user.photoUrl = data.photoUrl;
			previewUrl = data.photoUrl;
			selectedFile = null;
			
			saveSuccess = true;
			setTimeout(() => saveSuccess = false, 3000);
		} catch (err: any) {
			error = err.message;
		} finally {
			uploadingImage = false;
		}
	}

	async function handleLogout() {
		await fetch('/api/auth/logout', {
			method: 'POST',
			credentials: 'include'
		});
		goto('/login');
	}
</script>

{#if loading}
	<div class="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-secondary)] mx-auto"></div>
			<p class="mt-4 text-slate-600">Loading dashboard...</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50">
		<!-- Header -->
		<header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between items-center h-16">
					<div class="flex items-center gap-3">
						<User class="h-6 w-6 text-[color:var(--color-secondary)]" />
						<span class="font-semibold text-slate-900">Staff Dashboard</span>
					</div>
					
					<div class="flex items-center gap-4">
						<a href="/" class="text-sm text-slate-600 hover:text-slate-900">Home</a>
						<a href="/directory" class="text-sm text-slate-600 hover:text-slate-900">Directory</a>
						<button onclick={handleLogout} class="btn btn-ghost text-sm">
							<LogOut class="h-4 w-4" />
							Logout
						</button>
					</div>
				</div>
			</div>
		</header>

		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Welcome Card -->
			<Motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div class="card mb-8 bg-gradient-to-r from-[color:var(--color-secondary)] to-blue-700 text-white">
					<div class="flex items-center gap-4">
						{#if user?.photoUrl}
							<img 
								src={user.photoUrl} 
								alt={user.fullName}
								class="w-20 h-20 rounded-xl object-cover border-4 border-white/30 shadow-lg"
							/>
						{:else}
							<div class="bg-white/20 p-4 rounded-xl">
								<User class="h-8 w-8" />
							</div>
						{/if}
						<div>
							<h1 class="text-2xl font-bold">Welcome back, {user?.fullName || 'User'}!</h1>
							<p class="text-blue-100">{user?.designation} • {user?.department}</p>
							{#if !user?.isApproved}
								<div class="mt-2 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-lg text-sm inline-block">
									⏳ Pending Admin Approval
								</div>
							{/if}
						</div>
					</div>
				</div>
			</Motion>

			<!-- Quick Stats -->
			<Motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
			>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div class="card">
						<div class="flex items-center gap-3">
							<div class="bg-blue-100 p-3 rounded-lg">
								<Building2 class="h-5 w-5 text-[color:var(--color-secondary)]" />
							</div>
							<div>
								<p class="text-sm text-slate-600">Faculty</p>
								<p class="font-semibold text-slate-900">{user?.faculty || 'Not set'}</p>
							</div>
						</div>
					</div>

					<div class="card">
						<div class="flex items-center gap-3">
							<div class="bg-teal-100 p-3 rounded-lg">
								<Award class="h-5 w-5 text-[color:var(--color-accent)]" />
							</div>
							<div>
								<p class="text-sm text-slate-600">Status</p>
								<p class="font-semibold text-slate-900">{user?.isApproved ? 'Active' : 'Pending'}</p>
							</div>
						</div>
					</div>

					<div class="card">
						<div class="flex items-center gap-3">
							<div class="bg-purple-100 p-3 rounded-lg">
								<Mail class="h-5 w-5 text-purple-600" />
							</div>
							<div>
								<p class="text-sm text-slate-600">Email</p>
								<p class="font-semibold text-slate-900 truncate">{user?.email}</p>
							</div>
						</div>
					</div>
				</div>
			</Motion>

			<!-- Profile Form -->
			<Motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<form onsubmit={handleSave} class="card">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-xl font-bold text-slate-900">Edit Profile</h2>
						{#if saveSuccess}
							<div class="flex items-center gap-2 text-green-600">
								<CheckCircle class="h-5 w-5" />
								<span class="text-sm font-medium">Saved successfully!</span>
							</div>
						{/if}
					</div>

					{#if error}
						<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
							{error}
						</div>
					{/if}

					<!-- Profile Picture Upload -->
					<div class="mb-8 pb-6 border-b border-slate-200">
						<h3 class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
							<Camera class="h-5 w-5 text-[color:var(--color-secondary)]" />
							Profile Picture
						</h3>
						
						<div class="flex flex-col md:flex-row items-center gap-6">
							<!-- Current/Preview Image -->
							<div class="relative">
								{#if previewUrl}
									<img 
										src={previewUrl} 
										alt="Profile" 
										class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
									/>
								{:else}
									<div class="w-32 h-32 rounded-full bg-gradient-to-br from-[color:var(--color-secondary)] to-[color:var(--color-accent)] flex items-center justify-center text-white text-4xl font-bold">
										{user?.fullName?.charAt(0) || 'U'}
									</div>
								{/if}
							</div>

							<!-- Upload Controls -->
							<div class="flex-1">
								<input
									type="file"
									id="profilePicture"
									accept="image/jpeg,image/jpg,image/png,image/webp"
									onchange={handleFileSelect}
									class="hidden"
								/>
								
								<div class="space-y-3">
									<div class="flex flex-wrap gap-3">
										<label for="profilePicture" class="btn btn-ghost cursor-pointer">
											<Upload class="h-4 w-4" />
											Choose Image
										</label>
										
										{#if selectedFile}
											<button
												type="button"
												onclick={handleImageUpload}
												disabled={uploadingImage}
												class="btn btn-primary"
											>
												{#if uploadingImage}
													<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
													Uploading...
												{:else}
													<Save class="h-4 w-4" />
													Upload Photo
												{/if}
											</button>
										{/if}
									</div>
									
									<p class="text-sm text-slate-600">
										Recommended: Square image, at least 400x400px. Max size: 5MB.
										<br />
										Supported formats: JPEG, PNG, WebP
									</p>
								</div>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						<!-- Full Name -->
						<div>
							<label for="fullName" class="label">Full Name <span class="text-red-500">*</span></label>
							<input
								type="text"
								id="fullName"
								bind:value={formData.fullName}
								required
								class="input"
								placeholder="Enter your full name"
							/>
						</div>

						<!-- Phone -->
						<div>
							<label for="phoneNumber" class="label">Phone Number</label>
							<input
								type="tel"
								id="phoneNumber"
								bind:value={formData.phoneNumber}
								class="input"
								placeholder="+234 xxx xxx xxxx"
							/>
						</div>

						<!-- Office Location -->
						<div>
							<label for="officeLocation" class="label">Office Location</label>
							<input
								type="text"
								id="officeLocation"
								bind:value={formData.officeLocation}
								class="input"
								placeholder="Building A, Room 101"
							/>
						</div>

						<!-- Office Hours -->
						<div>
							<label for="officeHours" class="label">Office Hours</label>
							<input
								type="text"
								id="officeHours"
								bind:value={formData.officeHours}
								class="input"
								placeholder="Mon-Fri, 9AM-5PM"
							/>
						</div>
					</div>

					<!-- Biography -->
					<div class="mb-6">
						<label for="biography" class="label">
							<BookOpen class="h-4 w-4 inline mr-1" />
							Biography
						</label>
						<textarea
							id="biography"
							bind:value={formData.biography}
							rows="4"
							class="input"
							placeholder="Tell us about yourself, your teaching philosophy, and interests..."
						></textarea>
					</div>

					<!-- Research Interests -->
					<div class="mb-6">
						<label for="researchInterests" class="label">Research Interests</label>
						<textarea
							id="researchInterests"
							bind:value={formData.researchInterests}
							rows="3"
							class="input"
							placeholder="List your research areas and interests..."
						></textarea>
					</div>

					<!-- Education -->
					<div class="mb-6">
						<label for="education" class="label">Education Background</label>
						<textarea
							id="education"
							bind:value={formData.education}
							rows="3"
							class="input"
							placeholder="List your degrees, certifications, and educational background..."
						></textarea>
					</div>

					<!-- Publications -->
					<div class="mb-6">
						<label for="publications" class="label">Publications & Achievements</label>
						<textarea
							id="publications"
							bind:value={formData.publications}
							rows="4"
							class="input"
							placeholder="List your publications, awards, and notable achievements..."
						></textarea>
					</div>

					<!-- Actions -->
					<div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
						<a href="/" class="btn btn-ghost">Cancel</a>
						<button type="submit" disabled={saving} class="btn btn-primary">
							{#if saving}
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								Saving...
							{:else}
								<Save class="h-4 w-4" />
								Save Changes
							{/if}
						</button>
					</div>
				</form>
			</Motion>
		</div>
	</div>
{/if}
