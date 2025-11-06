/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				heading: ['Poppins', 'system-ui', 'sans-serif'],
				body: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['Roboto Mono', 'ui-monospace', 'monospace']
			},
			colors: {
				primary: '#ffffff',
				secondary: '#2563eb',
				accent: '#14b8a6',
				dark: '#1e293b'
			},
			textColor: {
				'custom-secondary': 'var(--color-secondary)',
				'custom-accent': 'var(--color-accent)',
				'custom-dark': 'var(--color-dark)'
			},
			backgroundColor: {
				'custom-secondary': 'var(--color-secondary)',
				'custom-accent': 'var(--color-accent)',
				'custom-dark': 'var(--color-dark)'
			},
			borderColor: {
				'custom-secondary': 'var(--color-secondary)',
				'custom-accent': 'var(--color-accent)',
				'custom-dark': 'var(--color-dark)'
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography')
	]
};
