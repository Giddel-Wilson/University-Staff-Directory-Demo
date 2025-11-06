<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { 
		Users, UserCheck, UserX, Search, Filter, 
		CheckCircle, XCircle, Edit, Trash2, Shield, LogOut, X 
	} from 'lucide-svelte';
	import { Motion } from 'svelte-motion';

	let staff = $state<any[]>([]);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let filterStatus = $state('all');
	let actionLoading = $state<string | null>(null);
	
	// Confirmation modal state
	let showConfirmModal = $state(false);
	let confirmAction = $state<{ type: 'approve' | 'reject' | 'delete', staffId: string, staffName: string } | null>(null);

	onMount(async () => {
		await loadStaff();
	});

	async function loadStaff() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (searchQuery) params.append('search', searchQuery);
			if (filterStatus !== 'all') params.append('status', filterStatus);

			const res = await fetch(`/api/admin/staff?${params}`, {
				credentials: 'include'
			});

			if (!res.ok) {
				if (res.status === 401 || res.status === 403) {
					goto('/admin/login');
					return;
				}
				throw new Error('Failed to load staff');
			}

			const data = await res.json();
			staff = data.staff || [];
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function openConfirmModal(type: 'approve' | 'reject' | 'delete', staffId: string, staffName: string) {
		confirmAction = { type, staffId, staffName };
		showConfirmModal = true;
	}

	function closeConfirmModal() {
		showConfirmModal = false;
		confirmAction = null;
	}

	async function confirmActionHandler() {
		if (!confirmAction) return;
		
		const { type, staffId } = confirmAction;
		closeConfirmModal();
		
		if (type === 'approve') await handleApprove(staffId);
		else if (type === 'reject') await handleReject(staffId);
		else if (type === 'delete') await handleDelete(staffId);
	}

	async function handleApprove(staffId: string) {
		actionLoading = staffId;
		try {
			const res = await fetch(`/api/admin/staff`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ id: staffId, action: 'approve' })
			});

			if (!res.ok) throw new Error('Failed to approve');
			
			await loadStaff();
		} catch (err: any) {
			error = err.message;
		} finally {
			actionLoading = null;
		}
	}

	async function handleReject(staffId: string) {
		actionLoading = staffId;
		try {
			const res = await fetch(`/api/admin/staff`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ id: staffId, action: 'reject' })
			});

			if (!res.ok) throw new Error('Failed to reject');
			
			await loadStaff();
		} catch (err: any) {
			error = err.message;
		} finally {
			actionLoading = null;
		}
	}

	async function handleDelete(staffId: string) {
		actionLoading = staffId;
		try {
			const res = await fetch(`/api/admin/staff?id=${staffId}`, {
				method: 'DELETE',
				credentials: 'include'
			});

			if (!res.ok) throw new Error('Failed to delete');
			
			await loadStaff();
		} catch (err: any) {
			error = err.message;
		} finally {
			actionLoading = null;
		}
	}

	async function handleLogout() {
		await fetch('/api/auth/logout', {
			method: 'POST',
			credentials: 'include'
		});
		goto('/admin/login');
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		loadStaff();
	}

	// React to filter changes
	$effect(() => {
		if (filterStatus) {
			loadStaff();
		}
	});
</script>

<svelte:head>
	<title>Manage Staff - Admin Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50">
	<!-- Header -->
	<nav class="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<div class="flex items-center gap-3">
					<Shield class="h-6 w-6 text-[color:var(--color-secondary)]" />
					<span class="text-xl font-bold text-slate-900">Admin Portal</span>
				</div>
				
				<div class="flex items-center gap-4">
					<a href="/admin/dashboard" class="text-sm text-slate-600 hover:text-slate-900">Dashboard</a>
					<a href="/directory" class="text-sm text-slate-600 hover:text-slate-900">Directory</a>
					<button onclick={handleLogout} class="btn btn-ghost text-sm">
						<LogOut class="h-4 w-4" />
						Logout
					</button>
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
			<div class="mb-8">
				<h1 class="text-4xl font-bold text-slate-900 mb-2">Staff Management</h1>
				<p class="text-slate-600">Review, approve, and manage staff members</p>
			</div>
		</Motion>

		<!-- Search and Filter -->
		<Motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.1 }}
		>
			<div class="card mb-6">
				<div class="flex flex-col md:flex-row gap-4">
					<!-- Search -->
					<form onsubmit={handleSearch} class="flex-1">
						<div class="relative">
							<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="Search by name, email, department..."
								class="input pl-10 w-full"
							/>
						</div>
					</form>

					<!-- Filter -->
					<div class="flex items-center gap-2">
						<Filter class="h-5 w-5 text-slate-400" />
						<select bind:value={filterStatus} class="input">
							<option value="all">All Status</option>
							<option value="pending">Pending</option>
							<option value="approved">Approved</option>
							<option value="rejected">Rejected</option>
						</select>
					</div>
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
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-secondary)] mx-auto"></div>
				<p class="mt-4 text-slate-600">Loading staff...</p>
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
					<p class="text-slate-600">Try adjusting your search or filter</p>
				</div>
			</Motion>
		{:else}
			<!-- Staff Table -->
			<Motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<div class="card overflow-hidden">
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-slate-50 border-b border-slate-200">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
										Staff Member
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
										Position
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
										Contact
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
										Status
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-slate-200">
								{#each staff as member}
									<tr class="hover:bg-slate-50 transition-colors">
										<td class="px-6 py-4">
											<div class="flex items-center gap-3">
												{#if member.photoUrl}
													<img 
														src={member.photoUrl} 
														alt={member.fullName}
														class="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
													/>
												{:else}
													<div class="w-10 h-10 bg-gradient-to-br from-[color:var(--color-secondary)] to-[color:var(--color-accent)] rounded-full flex items-center justify-center text-white text-sm font-bold">
														{member.fullName.charAt(0)}
													</div>
												{/if}
												<div>
													<div class="font-medium text-slate-900">{member.fullName}</div>
													<div class="text-sm text-slate-500">ID: {member.staffId}</div>
												</div>
											</div>
										</td>
										<td class="px-6 py-4">
											<div>
												<div class="text-sm text-slate-900">{member.designation}</div>
												<div class="text-sm text-slate-500">{member.department}</div>
												<div class="text-xs text-slate-400">{member.faculty}</div>
											</div>
										</td>
										<td class="px-6 py-4">
											<div class="text-sm text-slate-900">{member.email}</div>
											{#if member.phoneNumber}
												<div class="text-sm text-slate-500">{member.phoneNumber}</div>
											{/if}
										</td>
										<td class="px-6 py-4">
											{#if member.isApproved}
												<span class="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
													<UserCheck class="h-3 w-3" />
													Approved
												</span>
											{:else}
												<span class="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
													<UserX class="h-3 w-3" />
													Pending
												</span>
											{/if}
										</td>
										<td class="px-6 py-4">
											<div class="flex items-center gap-2">
												{#if !member.isApproved}
													<button
														onclick={() => openConfirmModal('approve', member._id, member.fullName)}
														disabled={actionLoading === member._id}
														class="btn btn-ghost text-green-600 hover:bg-green-50 text-xs"
														title="Approve"
													>
														<CheckCircle class="h-4 w-4" />
													</button>
													<button
														onclick={() => openConfirmModal('reject', member._id, member.fullName)}
														disabled={actionLoading === member._id}
														class="btn btn-ghost text-red-600 hover:bg-red-50 text-xs"
														title="Reject"
													>
														<XCircle class="h-4 w-4" />
													</button>
												{/if}
												<button
													onclick={() => openConfirmModal('delete', member._id, member.fullName)}
													disabled={actionLoading === member._id}
													class="btn btn-ghost text-red-600 hover:bg-red-50 text-xs"
													title="Delete Permanently"
												>
													{#if actionLoading === member._id}
														<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
													{:else}
														<Trash2 class="h-4 w-4" />
													{/if}
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</Motion>
		{/if}
	</div>
</div>

<!-- Confirmation Modal -->
{#if showConfirmModal && confirmAction}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<Motion
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.2 }}
		>
			<div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
				<div class="flex items-start justify-between mb-4">
					<div class="flex items-center gap-3">
						{#if confirmAction.type === 'approve'}
							<div class="bg-green-100 p-2 rounded-lg">
								<CheckCircle class="h-6 w-6 text-green-600" />
							</div>
						{:else if confirmAction.type === 'reject'}
							<div class="bg-yellow-100 p-2 rounded-lg">
								<XCircle class="h-6 w-6 text-yellow-600" />
							</div>
						{:else}
							<div class="bg-red-100 p-2 rounded-lg">
								<Trash2 class="h-6 w-6 text-red-600" />
							</div>
						{/if}
						<div>
							<h3 class="text-lg font-semibold text-slate-900">
								{#if confirmAction.type === 'approve'}
									Approve Staff Member
								{:else if confirmAction.type === 'reject'}
									Reject Registration
								{:else}
									Delete Permanently
								{/if}
							</h3>
						</div>
					</div>
					<button 
						onclick={closeConfirmModal}
						class="text-slate-400 hover:text-slate-600"
					>
						<X class="h-5 w-5" />
					</button>
				</div>
				
				<p class="text-slate-600 mb-6">
					{#if confirmAction.type === 'approve'}
						Are you sure you want to approve <strong>{confirmAction.staffName}</strong>? They will receive an email notification and gain access to their dashboard.
					{:else if confirmAction.type === 'reject'}
						Are you sure you want to reject <strong>{confirmAction.staffName}</strong>? They will receive an email notification and will need to register again.
					{:else}
						Are you sure you want to permanently delete <strong>{confirmAction.staffName}</strong>? This action cannot be undone.
					{/if}
				</p>
				
				<div class="flex gap-3 justify-end">
					<button
						onclick={closeConfirmModal}
						class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
					>
						Cancel
					</button>
					<button
						onclick={confirmActionHandler}
						class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors {
							confirmAction.type === 'approve' 
								? 'bg-green-600 hover:bg-green-700' 
								: confirmAction.type === 'reject'
								? 'bg-yellow-600 hover:bg-yellow-700'
								: 'bg-red-600 hover:bg-red-700'
						}"
					>
						{#if confirmAction.type === 'approve'}
							Approve
						{:else if confirmAction.type === 'reject'}
							Reject
						{:else}
							Delete
						{/if}
					</button>
				</div>
			</div>
		</Motion>
	</div>
{/if}
