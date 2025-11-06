<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Search, Users, Mail, Phone, MapPin, BookOpen, GraduationCap, Filter, LogOut } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let staff = $state<any[]>([]);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let filterFaculty = $state('');
	let filterDepartment = $state('');
	let faculties = $state<string[]>([]);
	let departments = $state<string[]>([]);

	onMount(async () => {
		await loadStaff();
	});

	async function loadStaff() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (searchQuery) params.append('search', searchQuery);
			if (filterFaculty) params.append('faculty', filterFaculty);
			if (filterDepartment) params.append('department', filterDepartment);

			const res = await fetch(`/api/staff/search?${params}`);

			if (!res.ok) {
				throw new Error('Failed to load staff');
			}

			const data = await res.json();
			staff = data.staff || [];
			
			// Extract unique faculties and departments
			const uniqueFaculties = new Set(staff.map((s: any) => s.faculty).filter(Boolean));
			const uniqueDepartments = new Set(staff.map((s: any) => s.department).filter(Boolean));
			faculties = Array.from(uniqueFaculties) as string[];
			departments = Array.from(uniqueDepartments) as string[];
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function handleLogout() {
		await fetch('/api/auth/logout', {
			method: 'POST',
			credentials: 'include'
		});
		// Refresh the page to update authentication state
		window.location.reload();
	}

	function handleDashboard() {
		if (data.userRole === 'super-admin') {
			goto('/admin/dashboard');
		} else {
			goto('/dashboard');
		}
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		loadStaff();
	}

	$effect(() => {
		if (filterFaculty || filterDepartment) {
			loadStaff();
		}
	});
</script>

<svelte:head>
	<title>Staff Directory - University</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50">
	<!-- Navigation -->
	<nav class="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<div class="flex items-center gap-3">
					<GraduationCap class="h-8 w-8 text-secondary" />
					<span class="text-xl font-bold text-slate-900">Staff Directory</span>
				</div>
				
				<div class="flex items-center gap-4">
					<a href="/" class="text-sm text-slate-600 hover:text-slate-900">Home</a>
					
					{#if data.isAuthenticated}
						<button 
							onclick={handleDashboard}
							class="text-sm text-slate-600 hover:text-slate-900"
						>
							Dashboard
						</button>
						<button 
							onclick={handleLogout}
							class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
						>
							<LogOut class="h-4 w-4" />
							Logout
						</button>
					{:else}
						<a 
							href="/login" 
							class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
						>
							Login
						</a>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<Motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div class="text-center mb-8">
				<h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
					Browse Our
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
						Faculty & Staff
					</span>
				</h1>
				<p class="text-xl text-slate-600">Connect with our academic community</p>
			</div>
		</Motion>

		<!-- Search and Filters -->
		<Motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.1 }}
		>
			<div class="card mb-8">
				<form onsubmit={handleSearch} class="mb-4">
					<div class="flex flex-col sm:flex-row gap-3">
						<div class="relative flex-1">
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="Search by name, department, or expertise..."
								class="input w-full h-12 pl-4 pr-4 text-base"
							/>
						</div>
						<button type="submit" class="btn btn-primary h-12 px-8 flex-shrink-0 font-semibold">
							Search
						</button>
					</div>
				</form>

				<!-- Filters -->
				<div class="flex flex-wrap gap-4">
					<div class="flex items-center gap-2 flex-1 min-w-[200px]">
						<Filter class="h-5 w-5 text-slate-400" />
						<select bind:value={filterFaculty} class="input flex-1">
							<option value="">All Faculties</option>
							{#each faculties as faculty}
								<option value={faculty}>{faculty}</option>
							{/each}
						</select>
					</div>

					<div class="flex-1 min-w-[200px]">
						<select bind:value={filterDepartment} class="input w-full">
							<option value="">All Departments</option>
							{#each departments as department}
								<option value={department}>{department}</option>
							{/each}
						</select>
					</div>

					{#if filterFaculty || filterDepartment}
						<button onclick={() => { filterFaculty = ''; filterDepartment = ''; }} class="btn btn-ghost">
							Clear Filters
						</button>
					{/if}
				</div>
			</div>
		</Motion>

		{#if error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
				{error}
			</div>
		{/if}

		{#if loading}
			<div class="text-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
				<p class="mt-4 text-slate-600">Loading staff directory...</p>
			</div>
		{:else if staff.length === 0}
			<Motion
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<div class="card text-center py-12">
					<Users class="h-16 w-16 text-slate-300 mx-auto mb-4" />
					<h3 class="text-lg font-semibold text-slate-900 mb-2">No staff found</h3>
					<p class="text-slate-600">Try adjusting your search or filters</p>
				</div>
			</Motion>
		{:else}
			<!-- Staff Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each staff as member, i}
					<Motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 + i * 0.05 }}
					>
						<div class="card hover:shadow-lg transition-all">
							<!-- Avatar -->
							<div class="flex items-center gap-4 mb-4">
								{#if member.photoUrl}
									<img 
										src={member.photoUrl} 
										alt={member.fullName}
										class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
									/>
								{:else}
									<div class="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold">
										{member.fullName.charAt(0)}
									</div>
								{/if}
								<div class="flex-1">
									<h3 class="font-bold text-slate-900">{member.fullName}</h3>
									<p class="text-sm text-slate-600">{member.designation}</p>
								</div>
							</div>

							<!-- Details -->
							<div class="space-y-2 text-sm">
								<div class="flex items-center gap-2 text-slate-700">
									<BookOpen class="h-4 w-4 text-slate-400" />
									<span>{member.department}</span>
								</div>

								<div class="flex items-center gap-2 text-slate-700">
									<GraduationCap class="h-4 w-4 text-slate-400" />
									<span>{member.faculty}</span>
								</div>

								{#if member.email}
									<div class="flex items-center gap-2 text-slate-700">
										<Mail class="h-4 w-4 text-slate-400" />
										<a href="mailto:{member.email}" class="text-secondary hover:underline truncate">
											{member.email}
										</a>
									</div>
								{/if}

								{#if member.contactNumber}
									<div class="flex items-center gap-2 text-slate-700">
										<Phone class="h-4 w-4 text-slate-400" />
										<span>{member.contactNumber}</span>
									</div>
								{/if}

								{#if member.officeAddress}
									<div class="flex items-center gap-2 text-slate-700">
										<MapPin class="h-4 w-4 text-slate-400" />
										<span>{member.officeAddress}</span>
									</div>
								{/if}
							</div>

							{#if member.biography}
								<div class="mt-4 pt-4 border-t border-slate-200">
									<p class="text-sm text-slate-600 line-clamp-3">{member.biography}</p>
								</div>
							{/if}

							<div class="mt-4">
								<a href="/staff/{member.slug}" class="btn btn-ghost w-full text-sm">
									View Full Profile
								</a>
							</div>
						</div>
					</Motion>
				{/each}
			</div>

			<!-- Results Count -->
			<Motion
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.5 }}
			>
				<div class="text-center mt-8 text-slate-600">
					Showing {staff.length} staff {staff.length === 1 ? 'member' : 'members'}
				</div>
			</Motion>
		{/if}
	</div>
</div>
