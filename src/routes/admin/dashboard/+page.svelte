<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { 
		Users, UserCheck, UserX, Clock, Building2, 
		TrendingUp, LogOut, Shield, Settings
	} from 'lucide-svelte';
	import { Motion } from 'svelte-motion';

	let stats = $state<any>(null);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/api/admin/analytics', {
				credentials: 'include'
			});

			if (!res.ok) {
				if (res.status === 401 || res.status === 403) {
					goto('/admin/login');
					return;
				}
				throw new Error('Failed to load analytics');
			}

			const data = await res.json();
			stats = data.stats;
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	async function handleLogout() {
		await fetch('/api/auth/logout', {
			method: 'POST',
			credentials: 'include'
		});
		goto('/admin/login');
	}
</script>

<svelte:head>
	<title>Admin Dashboard - Staff Directory</title>
</svelte:head>

{#if loading}
	<div class="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
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
						<Shield class="h-6 w-6 text-secondary" />
						<span class="text-xl font-bold text-slate-900">Admin Dashboard</span>
					</div>
					
					<div class="flex items-center gap-4">
						<a href="/admin/staff" class="text-sm text-slate-600 hover:text-slate-900">Manage Staff</a>
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
			{#if error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
					{error}
				</div>
			{:else if stats}
				<!-- Welcome -->
				<Motion
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div class="card bg-gradient-to-r from-secondary to-blue-700 text-white mb-8">
						<h1 class="text-3xl font-bold mb-2">Welcome, Administrator</h1>
						<p class="text-blue-100">Here's an overview of your university staff directory</p>
					</div>
				</Motion>

				<!-- Stats Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						<div class="card hover:shadow-lg transition-shadow">
							<div class="flex items-center justify-between mb-4">
								<div class="bg-blue-100 p-3 rounded-lg">
									<Users class="h-6 w-6 text-secondary" />
								</div>
								<TrendingUp class="h-5 w-5 text-green-600" />
							</div>
							<h3 class="text-2xl font-bold text-slate-900 mb-1">{stats.totalStaff}</h3>
							<p class="text-slate-600 text-sm">Total Staff</p>
						</div>
					</Motion>

					<Motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<div class="card hover:shadow-lg transition-shadow">
							<div class="flex items-center justify-between mb-4">
								<div class="bg-green-100 p-3 rounded-lg">
									<UserCheck class="h-6 w-6 text-green-600" />
								</div>
							</div>
							<h3 class="text-2xl font-bold text-slate-900 mb-1">{stats.approvedStaff}</h3>
							<p class="text-slate-600 text-sm">Approved Staff</p>
						</div>
					</Motion>

					<Motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<div class="card hover:shadow-lg transition-shadow">
							<div class="flex items-center justify-between mb-4">
								<div class="bg-yellow-100 p-3 rounded-lg">
									<Clock class="h-6 w-6 text-yellow-600" />
								</div>
								{#if stats.pendingApproval > 0}
									<span class="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
										{stats.pendingApproval}
									</span>
								{/if}
							</div>
							<h3 class="text-2xl font-bold text-slate-900 mb-1">{stats.pendingApproval}</h3>
							<p class="text-slate-600 text-sm">Pending Approval</p>
						</div>
					</Motion>

					<Motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						<div class="card hover:shadow-lg transition-shadow">
							<div class="flex items-center justify-between mb-4">
								<div class="bg-purple-100 p-3 rounded-lg">
									<Building2 class="h-6 w-6 text-purple-600" />
								</div>
							</div>
							<h3 class="text-2xl font-bold text-slate-900 mb-1">{stats.totalFaculties}</h3>
							<p class="text-slate-600 text-sm">Faculties</p>
						</div>
					</Motion>
				</div>

				<!-- Recent Registrations & By Faculty -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Recent Registrations -->
					<Motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
					>
						<div class="card">
							<h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
								<Clock class="h-5 w-5 text-accent" />
								Recent Registrations
							</h2>
							{#if stats.recentRegistrations.length > 0}
								<div class="space-y-3">
									{#each stats.recentRegistrations as staff}
										<div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
											<div class="flex items-start justify-between">
												<div>
													<h3 class="font-semibold text-slate-900">{staff.fullName}</h3>
													<p class="text-sm text-slate-600">{staff.designation} • {staff.department}</p>
													<p class="text-xs text-slate-500 mt-1">{new Date(staff.createdAt).toLocaleDateString()}</p>
												</div>
												{#if !staff.isApproved}
													<span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
														Pending
													</span>
												{:else}
													<span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
														Approved
													</span>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<p class="text-slate-500 text-center py-8">No recent registrations</p>
							{/if}
						</div>
					</Motion>

					<!-- Staff by Faculty -->
					<Motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<div class="card">
							<h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
								<Building2 class="h-5 w-5 text-accent" />
								Staff by Faculty
							</h2>
							{#if stats.staffByFaculty.length > 0}
								<div class="space-y-3">
									{#each stats.staffByFaculty as faculty}
										<div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
											<div class="flex items-center justify-between">
												<span class="text-slate-900 font-medium">{faculty._id || 'Unassigned'}</span>
												<span class="bg-secondary text-white text-sm font-bold px-3 py-1 rounded-full">
													{faculty.count}
												</span>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<p class="text-slate-500 text-center py-8">No faculty data</p>
							{/if}
						</div>
					</Motion>
				</div>

				<!-- Quick Actions -->
				<Motion
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.7 }}
				>
					<div class="mt-8 card">
						<h2 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<a href="/admin/staff" class="btn btn-primary">
								<Users class="h-4 w-4" />
								Manage Staff
							</a>
							<a href="/admin/staff?filter=pending" class="btn bg-yellow-600 hover:bg-yellow-700 text-white">
								<Clock class="h-4 w-4" />
								Review Pending ({stats.pendingApproval})
							</a>
							<a href="/directory" class="btn btn-ghost">
								<Settings class="h-4 w-4" />
								View Directory
							</a>
						</div>
					</div>
				</Motion>
			{/if}
		</div>
	</div>
{/if}
