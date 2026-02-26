/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../tools/kafka-tool/src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '.dark'],
  safelist: [
    // KafkaToolComponent classes
    'w-full', 'h-full', 'flex', 'flex-col', 'bg-gray-50', 'transition-colors',
    'bg-white', 'border-b', 'border-gray-200', 'px-6', 'py-4', 'justify-between', 'items-center',
    'text-2xl', 'font-bold', 'text-gray-900', 'text-sm', 'text-gray-600', 'mt-1',
    'md:w-48', 'bg-gray-100', 'md:border-b-0', 'md:border-r', 'border-gray-700', 'overflow-y-auto',
    'p-4', 'space-y-2', 'block', 'px-4', 'py-3', 'text-sm', 'font-medium', 'rounded-md', 'text-left',
    'bg-blue-600', 'text-white', 'text-gray-300', 'hover:bg-gray-200', 'hover:bg-gray-700',
    'text-red-600', 'text-red-400', 'hover:bg-red-50', 'hover:bg-red-900/20',
    'flex-1', 'overflow-y-auto', 'p-4', 'md:p-6', 'bg-gray-50', 'dark:bg-slate-950',
    'mb-4', 'p-4', 'bg-red-50', 'dark:bg-red-900/20', 'border', 'border-red-200', 'dark:border-red-800',
    'rounded-lg', 'text-red-700', 'dark:text-red-400',
    'text-xl', 'md:text-2xl', 'mb-6',
    'grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-4',
    'bg-white', 'dark:bg-slate-800', 'border', 'border-gray-200', 'dark:border-gray-700', 'rounded-lg', 'p-6', 'shadow-sm', 'hover:shadow-md',
    'text-lg', 'font-semibold', 'mb-2', 'break-words', 'mb-4',
    'w-full', 'px-4', 'py-2', 'bg-blue-600', 'text-white', 'rounded-md', 'hover:bg-blue-700', 'disabled:opacity-50',
    'text-center', 'text-gray-500', 'dark:text-gray-400', 'bg-gray-50', 'dark:bg-slate-900', 'rounded-lg', 'border-2', 'border-dashed', 'border-gray-300', 'dark:border-gray-700',
    // Dark mode variants
    { pattern: /^dark:/ },
  ],
  theme: {
    extend: {
      colors: {
        kafka: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
