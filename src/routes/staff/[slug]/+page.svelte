<script lang="ts">
	import { goto } from '$app/navigation';
	import { Mail, Phone, MapPin, BookOpen, GraduationCap, Award, Building2, Clock, ArrowLeft, User as UserIcon } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const staff = data.staff;
</script>

<svelte:head>
	<title>{staff.fullName} - Staff Profile</title>
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
					<a href="/directory" class="text-sm text-slate-600 hover:text-slate-900">Directory</a>
				</div>
			</div>
		</div>
	</nav>

	<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Back Button -->
		<Motion
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.3 }}
		>
			<button 
				onclick={() => goto('/directory')}
				class="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
			>
				<ArrowLeft class="h-4 w-4" />
				Back to Directory
			</button>
		</Motion>

		<!-- Profile Header -->
		<Motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div class="card mb-8">
				<div class="flex items-start gap-6">
					<!-- Avatar -->
					{#if staff.photoUrl}
						<img 
							src={staff.photoUrl} 
							alt={staff.fullName}
							class="w-40 h-40 rounded-xl object-cover border-4 border-white shadow-lg flex-shrink-0"
						/>
					{:else}
						<div class="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
							{staff.fullName.charAt(0)}
						</div>
					{/if}

					<!-- Header Info -->
					<div class="flex-1">
						<h1 class="text-3xl font-bold text-slate-900 mb-2">{staff.fullName}</h1>
						<p class="text-xl text-slate-600 mb-4">{staff.designation}</p>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
							<div class="flex items-center gap-2 text-slate-700">
								<BookOpen class="h-4 w-4 text-slate-400" />
								<span><strong>Department:</strong> {staff.department}</span>
							</div>

							<div class="flex items-center gap-2 text-slate-700">
								<Building2 class="h-4 w-4 text-slate-400" />
								<span><strong>Faculty:</strong> {staff.faculty}</span>
							</div>

							{#if staff.email}
								<div class="flex items-center gap-2 text-slate-700">
									<Mail class="h-4 w-4 text-slate-400" />
									<a href="mailto:{staff.email}" class="text-secondary hover:underline">
										{staff.email}
									</a>
								</div>
							{/if}

							{#if staff.contactNumber}
								<div class="flex items-center gap-2 text-slate-700">
									<Phone class="h-4 w-4 text-slate-400" />
									<span>{staff.contactNumber}</span>
								</div>
							{/if}

							{#if staff.officeAddress}
								<div class="flex items-center gap-2 text-slate-700">
									<MapPin class="h-4 w-4 text-slate-400" />
									<span>{staff.officeAddress}</span>
								</div>
							{/if}

							{#if staff.officeHours}
								<div class="flex items-center gap-2 text-slate-700">
									<Clock class="h-4 w-4 text-slate-400" />
									<span><strong>Office Hours:</strong> {staff.officeHours}</span>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</Motion>

		<!-- Biography Section -->
		{#if staff.biography}
			<Motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
			>
				<div class="card mb-6">
					<h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
						<UserIcon class="h-5 w-5 text-secondary" />
						Biography
					</h2>
					<p class="text-slate-700 whitespace-pre-line leading-relaxed">{staff.biography}</p>
				</div>
			</Motion>
		{/if}

		<!-- Research Interests -->
		{#if staff.researchInterests}
			<Motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<div class="card mb-6">
					<h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
						<BookOpen class="h-5 w-5 text-secondary" />
						Research Interests
					</h2>
					<p class="text-slate-700 whitespace-pre-line leading-relaxed">{staff.researchInterests}</p>
				</div>
			</Motion>
		{/if}

		<!-- Education Background -->
		{#if staff.education}
			<Motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
			>
				<div class="card mb-6">
					<h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
						<GraduationCap class="h-5 w-5 text-secondary" />
						Education Background
					</h2>
					<p class="text-slate-700 whitespace-pre-line leading-relaxed">{staff.education}</p>
				</div>
			</Motion>
		{/if}

		<!-- Publications & Achievements -->
		{#if staff.publications}
			<Motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
			>
				<div class="card mb-6">
					<h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
						<Award class="h-5 w-5 text-secondary" />
						Publications & Achievements
					</h2>
					<p class="text-slate-700 whitespace-pre-line leading-relaxed">{staff.publications}</p>
				</div>
			</Motion>
		{/if}

		<!-- Contact Card -->
		<Motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.5 }}
		>
			<div class="card bg-gradient-to-r from-secondary to-blue-700 text-white">
				<h2 class="text-xl font-bold mb-4">Get in Touch</h2>
				<p class="mb-4">Feel free to reach out for academic inquiries, collaborations, or appointments.</p>
				{#if staff.email}
					<a 
						href="mailto:{staff.email}" 
						class="btn bg-white text-secondary hover:bg-blue-50 inline-flex items-center gap-2"
					>
						<Mail class="h-4 w-4" />
						Send Email
					</a>
				{/if}
			</div>
		</Motion>
	</div>
</div>
