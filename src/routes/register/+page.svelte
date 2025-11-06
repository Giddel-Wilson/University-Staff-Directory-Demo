<script lang="ts">
	import { GraduationCap, Loader2 } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';
	
	let formData = $state({
		fullName: '',
		staffId: '',
		faculty: '',
		department: '',
		designation: '',
		email: '',
		password: '',
		confirmPassword: '',
		officeAddress: '',
		contactNumber: '',
		researchInterests: '',
		biography: ''
	});

	let loading = $state(false);
	let error = $state('');
	let success = $state(false);
	let validationErrors = $state<Record<string, string[]>>({});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		validationErrors = {};
		loading = true;

		// Client-side validation
		if (formData.password !== formData.confirmPassword) {
			error = 'Passwords do not match';
			loading = false;
			return;
		}

		if (formData.password.length < 8) {
			error = 'Password must be at least 8 characters long';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fullName: formData.fullName,
					staffId: formData.staffId,
					faculty: formData.faculty,
					department: formData.department,
					designation: formData.designation,
					email: formData.email,
					password: formData.password,
					officeAddress: formData.officeAddress,
					contactNumber: formData.contactNumber,
					researchInterests: formData.researchInterests,
					biography: formData.biography
				})
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.details) {
					validationErrors = data.details;
				}
				throw new Error(data.error || 'Registration failed');
			}

			success = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Registration failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 py-12 px-4">
	<!-- Navigation -->
	<nav class="mb-8">
		<div class="max-w-4xl mx-auto">
			<a href="/" class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
				<GraduationCap class="h-6 w-6" />
				<span class="font-semibold">Back to Home</span>
			</a>
		</div>
	</nav>

	<div class="max-w-4xl mx-auto">
		<Motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div class="card">
				{#if success}
					<!-- Success Message -->
					<div class="text-center py-12">
						<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 class="text-3xl font-bold text-slate-900 mb-4">
							Registration Successful!
						</h2>
						<p class="text-lg text-slate-600 mb-8">
							Your account has been created and is pending admin approval.
							You will receive an email notification once your account is approved.
						</p>
						<a href="/login" class="btn btn-primary">
							Go to Login
						</a>
					</div>
				{:else}
					<!-- Registration Form -->
					<div class="mb-8">
						<h1 class="text-3xl font-bold text-slate-900 mb-2">
							Staff Registration
						</h1>
						<p class="text-slate-600">
							Create your profile in the university staff directory
						</p>
					</div>

					{#if error}
						<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
							{error}
						</div>
					{/if}

					<form onsubmit={handleSubmit} class="space-y-6">
						<!-- Basic Information -->
						<div>
							<h3 class="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label for="fullName" class="label">Full Name *</label>
									<input
										id="fullName"
										type="text"
										bind:value={formData.fullName}
										required
										class="input"
										placeholder="John Doe"
									/>
									{#if validationErrors.fullName}
										<p class="text-red-600 text-sm mt-1">{validationErrors.fullName[0]}</p>
									{/if}
								</div>

								<div>
									<label for="staffId" class="label">Staff ID *</label>
									<input
										id="staffId"
										type="text"
										bind:value={formData.staffId}
										required
										class="input"
										placeholder="STAFF001"
									/>
									{#if validationErrors.staffId}
										<p class="text-red-600 text-sm mt-1">{validationErrors.staffId[0]}</p>
									{/if}
								</div>

								<div>
									<label for="email" class="label">Email Address *</label>
									<input
										id="email"
										type="email"
										bind:value={formData.email}
										required
										class="input"
										placeholder="john.doe@university.edu"
									/>
									{#if validationErrors.email}
										<p class="text-red-600 text-sm mt-1">{validationErrors.email[0]}</p>
									{/if}
								</div>

								<div>
									<label for="contactNumber" class="label">Contact Number</label>
									<input
										id="contactNumber"
										type="tel"
										bind:value={formData.contactNumber}
										class="input"
										placeholder="+1 (555) 123-4567"
									/>
								</div>
							</div>
						</div>

						<!-- Academic Information -->
						<div>
							<h3 class="text-lg font-semibold text-slate-900 mb-4">Academic Information</h3>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div>
									<label for="faculty" class="label">Faculty *</label>
									<input
										id="faculty"
										type="text"
										bind:value={formData.faculty}
										required
										class="input"
										placeholder="Engineering"
									/>
								</div>

								<div>
									<label for="department" class="label">Department *</label>
									<input
										id="department"
										type="text"
										bind:value={formData.department}
										required
										class="input"
										placeholder="Computer Science"
									/>
								</div>

								<div>
									<label for="designation" class="label">Designation *</label>
									<input
										id="designation"
										type="text"
										bind:value={formData.designation}
										required
										class="input"
										placeholder="Professor"
									/>
								</div>
							</div>

							<div class="mt-6">
								<label for="officeAddress" class="label">Office Address</label>
								<input
									id="officeAddress"
									type="text"
									bind:value={formData.officeAddress}
									class="input"
									placeholder="Building A, Room 301"
								/>
							</div>
						</div>

						<!-- Additional Information -->
						<div>
							<h3 class="text-lg font-semibold text-slate-900 mb-4">Additional Information</h3>
							<div class="space-y-6">
								<div>
									<label for="researchInterests" class="label">Research Interests</label>
									<textarea
										id="researchInterests"
										bind:value={formData.researchInterests}
										rows="3"
										class="input resize-none"
										placeholder="Artificial Intelligence, Machine Learning, Data Science..."
									></textarea>
								</div>

								<div>
									<label for="biography" class="label">Short Biography</label>
									<textarea
										id="biography"
										bind:value={formData.biography}
										rows="4"
										class="input resize-none"
										placeholder="Tell us about your academic background and expertise..."
									></textarea>
								</div>
							</div>
						</div>

						<!-- Password -->
						<div>
							<h3 class="text-lg font-semibold text-slate-900 mb-4">Security</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label for="password" class="label">Password *</label>
									<input
										id="password"
										type="password"
										bind:value={formData.password}
										required
										class="input"
										placeholder="••••••••"
									/>
									<p class="text-xs text-slate-500 mt-1">
										Minimum 8 characters, include uppercase, lowercase, number, and special character
									</p>
								</div>

								<div>
									<label for="confirmPassword" class="label">Confirm Password *</label>
									<input
										id="confirmPassword"
										type="password"
										bind:value={formData.confirmPassword}
										required
										class="input"
										placeholder="••••••••"
									/>
								</div>
							</div>
						</div>

						<!-- Submit -->
						<div class="flex gap-4 pt-4">
							<button
								type="submit"
								disabled={loading}
								class="btn btn-primary flex-1"
							>
								{#if loading}
									<Loader2 class="h-4 w-4 animate-spin" />
									Registering...
								{:else}
									Register
								{/if}
							</button>
							<a href="/login" class="btn btn-outline">
								Already have an account?
							</a>
						</div>
					</form>
				{/if}
			</div>
		</Motion>
	</div>
</div>
