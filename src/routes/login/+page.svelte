<script lang="ts">
	import { GraduationCap, Loader2 } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';
	import { goto } from '$app/navigation';
	
	let formData = $state({
		email: '',
		password: ''
	});

	let loading = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
				credentials: 'include'
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Login failed');
			}

			// Redirect to dashboard on success
			goto('/dashboard');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center py-12 px-4">
	<div class="w-full max-w-md">
		<!-- Logo/Header -->
		<Motion
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div class="text-center mb-8">
				<a href="/" class="inline-flex items-center gap-2 text-secondary hover:text-blue-700 transition-colors mb-4">
					<GraduationCap class="h-10 w-10" />
					<span class="text-2xl font-bold">Staff Directory</span>
				</a>
				<h1 class="text-3xl font-bold text-slate-900 mb-2">
					Welcome Back
				</h1>
				<p class="text-slate-600">
					Sign in to manage your profile
				</p>
			</div>
		</Motion>

		<!-- Login Card -->
		<Motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.1 }}
		>
			<div class="card">
				{#if error}
					<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
						{error}
					</div>
				{/if}

				<form onsubmit={handleSubmit} class="space-y-6">
					<div>
						<label for="email" class="label">Email Address</label>
						<input
							id="email"
							type="email"
							bind:value={formData.email}
							required
							autocomplete="email"
							class="input"
							placeholder="your.email@university.edu"
						/>
					</div>

					<div>
						<label for="password" class="label">Password</label>
						<input
							id="password"
							type="password"
							bind:value={formData.password}
							required
							autocomplete="current-password"
							class="input"
							placeholder="••••••••"
						/>
					</div>

					<div class="flex items-center justify-between text-sm">
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" class="rounded border-slate-300 text-secondary focus:ring-secondary" />
							<span class="text-slate-600">Remember me</span>
						</label>
						<a href="/forgot-password" class="text-secondary hover:text-blue-700 font-medium">
							Forgot password?
						</a>
					</div>

					<button
						type="submit"
						disabled={loading}
						class="btn btn-primary w-full"
					>
						{#if loading}
							<Loader2 class="h-4 w-4 animate-spin" />
							Signing in...
						{:else}
							Sign In
						{/if}
					</button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-slate-600 text-sm">
						Don't have an account?
						<a href="/register" class="text-secondary hover:text-blue-700 font-medium">
							Register here
						</a>
					</p>
				</div>

				<div class="mt-6 pt-6 border-t border-slate-200">
					<p class="text-center text-sm text-slate-600">
						Are you an administrator?
						<a href="/admin/login" class="text-secondary hover:text-blue-700 font-medium">
							Admin Login
						</a>
					</p>
				</div>
			</div>
		</Motion>

		<!-- Additional Links -->
		<Motion
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<div class="mt-8 text-center">
				<p class="text-slate-600 text-sm mb-4">
					Looking for someone?
				</p>
				<a href="/directory" class="btn btn-outline">
					Browse Staff Directory
				</a>
			</div>
		</Motion>
	</div>
</div>
