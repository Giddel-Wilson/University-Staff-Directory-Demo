<script lang="ts">
	import { goto } from '$app/navigation';
	import { Shield, Mail, Lock, AlertCircle } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			const res = await fetch('/api/admin/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ username, password })
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Login failed');
			}

			// Redirect to admin dashboard
			goto('/admin/dashboard');
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Login - Staff Directory</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center px-4">
	<Motion
		initial={{ opacity: 0, scale: 0.95 }}
		animate={{ opacity: 1, scale: 1 }}
		transition={{ duration: 0.5 }}
	>
		<div class="w-full max-w-md">
			<!-- Header -->
			<div class="text-center mb-8">
				<div class="inline-flex items-center justify-center w-16 h-16 bg-[color:var(--color-secondary)] rounded-2xl mb-4 shadow-lg">
					<Shield class="h-8 w-8 text-white" />
				</div>
				<h1 class="text-3xl font-bold text-slate-900 mb-2">Admin Portal</h1>
				<p class="text-slate-600">Sign in to manage the directory</p>
			</div>

			<!-- Login Card -->
			<div class="card shadow-xl">
				<form onsubmit={handleSubmit} class="space-y-6">
					{#if error}
						<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
							<AlertCircle class="h-5 w-5 flex-shrink-0 mt-0.5" />
							<span class="text-sm">{error}</span>
						</div>
					{/if}

					<!-- Username -->
					<div>
						<label for="username" class="label">
							<Mail class="h-4 w-4 inline mr-1" />
							Username
						</label>
						<input
							type="text"
							id="username"
							bind:value={username}
							required
							autocomplete="username"
							class="input"
							placeholder="Enter your username"
						/>
					</div>

					<!-- Password -->
					<div>
						<label for="password" class="label">
							<Lock class="h-4 w-4 inline mr-1" />
							Password
						</label>
						<input
							type="password"
							id="password"
							bind:value={password}
							required
							autocomplete="current-password"
							class="input"
							placeholder="Enter your password"
						/>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						disabled={loading}
						class="btn btn-primary w-full"
					>
						{#if loading}
							<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
							Signing in...
						{:else}
							<Shield class="h-5 w-5" />
							Sign In
						{/if}
					</button>
				</form>

				<!-- Footer -->
				<div class="mt-6 pt-6 border-t border-slate-200 text-center">
					<a href="/login" class="text-sm text-[color:var(--color-secondary)] hover:text-blue-700 transition-colors">
						← Back to Staff Login
					</a>
				</div>
			</div>

			<!-- Security Note -->
			<div class="mt-6 text-center text-sm text-slate-600">
				<p>🔒 Secure admin access only</p>
				<p class="mt-1">Default: <code class="bg-white px-2 py-1 rounded border border-slate-200">admin / Admin@123</code></p>
			</div>
		</div>
	</Motion>
</div>
