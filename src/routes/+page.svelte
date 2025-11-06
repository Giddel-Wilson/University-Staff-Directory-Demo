<script lang="ts">
	import { goto } from '$app/navigation';
	import { Search, Users, BookOpen, Award, ArrowRight, GraduationCap, LogOut } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	
	let searchQuery = $state('');

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/directory?search=${encodeURIComponent(searchQuery)}`;
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

	const features = [
		{
			icon: Users,
			title: 'Comprehensive Directory',
			description: 'Search through our complete database of faculty and staff members across all departments.'
		},
		{
			icon: BookOpen,
			title: 'Research Interests',
			description: 'Discover faculty expertise and research areas to find the right academic connections.'
		},
		{
			icon: Award,
			title: 'Verified Profiles',
			description: 'All profiles are verified by administrators to ensure accuracy and authenticity.'
		}
	];

	const stats = [
		{ value: '500+', label: 'Staff Members' },
		{ value: '20+', label: 'Faculties' },
		{ value: '100+', label: 'Departments' }
	];
</script>

<div class="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50">
	<!-- Navigation -->
	<nav class="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<div class="flex items-center gap-3">
					<GraduationCap class="h-8 w-8 text-secondary" />
					<span class="text-xl font-bold text-slate-900">University Staff Directory</span>
				</div>
				
				<div class="flex items-center gap-4">
					<a href="/directory" class="text-sm text-slate-600 hover:text-slate-900">Browse Directory</a>
					
					{#if data.isAuthenticated}
						<button 
							onclick={handleDashboard}
							class="text-sm text-slate-600 hover:text-slate-900"
						>
							Dashboard
						</button>
						<button 
							onclick={handleLogout}
							class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
						>
							<LogOut class="h-4 w-4" />
							Logout
						</button>
					{:else}
						<a href="/login" class="btn btn-ghost">Login</a>
						<a href="/register" class="btn btn-primary">Register</a>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="py-20 px-4">
		<div class="max-w-7xl mx-auto">
			<Motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<div class="text-center mb-12">
					<h1 class="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
						Find Your University
						<span class="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
							Faculty & Staff
						</span>
					</h1>
					<p class="text-xl text-slate-600 max-w-2xl mx-auto">
						Search our comprehensive directory to connect with faculty members, staff, and administrators across all departments.
					</p>
				</div>

				<!-- Search Bar -->
				<form onsubmit={handleSearch} class="max-w-3xl mx-auto mb-16">
					<div class="relative">
						<div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
							<Search class="h-5 w-5 text-slate-400" />
						</div>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search by name, department, faculty, or expertise..."
							class="w-full h-14 pl-12 pr-32 text-base rounded-xl border-2 border-slate-200 bg-white shadow-sm focus:border-secondary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
						/>
						<button 
							type="submit" 
							class="btn btn-primary absolute right-2 top-1/2 -translate-y-1/2 h-10 shadow-sm hover:shadow-md transition-shadow"
						>
							Search
							<ArrowRight class="h-4 w-4" />
						</button>
					</div>
				</form>

				<!-- Quick Stats -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
					{#each stats as stat, i}
						<Motion
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: i * 0.1 }}
						>
							<div class="card text-center">
								<div class="text-4xl font-bold text-secondary mb-2">
									{stat.value}
								</div>
								<div class="text-slate-600">{stat.label}</div>
							</div>
						</Motion>
					{/each}
				</div>
			</Motion>
		</div>
	</section>

	<!-- Features Section -->
	<section class="py-20 px-4 bg-white">
		<div class="max-w-7xl mx-auto">
			<Motion
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.6, delay: 0.3 }}
			>
				<div class="text-center mb-16">
					<h2 class="text-4xl font-bold text-slate-900 mb-4">
						Why Use Our Directory?
					</h2>
					<p class="text-xl text-slate-600">
						A modern, efficient way to connect with university personnel
					</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
					{#each features as feature, i}
						<Motion
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
						>
							{@const Icon = feature.icon}
							<div class="card hover:shadow-lg transition-shadow">
								<div class="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
									<Icon class="h-6 w-6 text-secondary" />
								</div>
								<h3 class="text-xl font-semibold text-slate-900 mb-2">
									{feature.title}
								</h3>
								<p class="text-slate-600">
									{feature.description}
								</p>
							</div>
						</Motion>
					{/each}
				</div>
			</Motion>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-20 px-4 bg-gradient-to-r from-secondary to-blue-700 text-white">
		<Motion
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.6, delay: 0.5 }}
		>
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-4xl font-bold mb-6">
					Are You a Staff Member?
				</h2>
				<p class="text-xl mb-8 text-blue-100">
					Join our directory and make it easier for students and colleagues to connect with you.
				</p>
				<div class="flex gap-4 justify-center flex-wrap">
					<a href="/register" class="btn bg-white text-secondary hover:bg-blue-50 hover:space-x-6">
						Create Your Profile
						<ArrowRight class="h-4 w-4" />
					</a>
					<a href="/directory" class="btn btn-outline border-white text-white hover:bg-white hover:text-secondary hover:scale-105 transition-transform">
						Browse Directory
					</a>
				</div>
			</div>
		</Motion>
	</section>

	<!-- Footer -->
	<footer class="bg-slate-900 text-slate-300 py-12 px-4">
		<div class="max-w-7xl mx-auto">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
				<div>
					<div class="flex items-center gap-2 mb-4">
						<GraduationCap class="h-6 w-6 text-accent" />
						<span class="font-bold text-white">University Staff Directory</span>
					</div>
					<p class="text-sm">
						Connecting students, faculty, and staff through our comprehensive online directory.
					</p>
				</div>

				<div>
					<h3 class="font-semibold text-white mb-4">Quick Links</h3>
					<ul class="space-y-2 text-sm">
						<li><a href="/directory" class="hover:text-white transition-colors">Browse Directory</a></li>
						<li><a href="/login" class="hover:text-white transition-colors">Staff Login</a></li>
						<li><a href="/admin" class="hover:text-white transition-colors">Admin Portal</a></li>
					</ul>
				</div>

				<div>
					<h3 class="font-semibold text-white mb-4">Contact</h3>
					<ul class="space-y-2 text-sm">
						<li>Email: directory@university.edu</li>
						<li>Phone: +1 (555) 123-4567</li>
						<li>Office: Main Campus, Building A</li>
					</ul>
				</div>
			</div>

			<div class="border-t border-slate-800 pt-8 text-center text-sm">
				<p>&copy; {new Date().getFullYear()} University Staff Directory. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
