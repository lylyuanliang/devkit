// Tailwind CSS class mappings for KafkaToolComponent
// This file replaces the inline styles with Tailwind utility classes

export const tailwindClasses = {
  // Layout
  container: 'w-full h-full bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors',
  header: 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center transition-colors',
  mainContainer: 'flex flex-1 overflow-hidden',
  sidebar: 'w-48 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-colors',
  content: 'flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-950 transition-colors',

  // Typography
  title: 'text-2xl font-bold text-gray-900 dark:text-gray-100',
  label: 'block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2',

  // Components
  card: 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm mb-4 transition-colors',
  input: 'w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
  button: 'px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  buttonSecondary: 'px-4 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors',

  // Navigation
  navItem: 'block w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer border-l-4 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
  navItemActive: 'block w-full px-4 py-3 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400 transition-colors',

  // Status and messages
  status: 'flex items-center gap-2 text-gray-600 dark:text-gray-300',
  statusDot: 'w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600',
  emptyMessage: 'p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700',

  // Grid and layout
  topicGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  topicCard: 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 cursor-pointer hover:shadow-md hover:scale-105 transition-all',

  // Table
  table: 'w-full border-collapse',
  tableHeader: 'bg-gray-100 dark:bg-gray-800',
  tableHeaderCell: 'px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700',
  tableRow: 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
  tableCell: 'px-4 py-2 text-sm text-gray-900 dark:text-gray-100',

  // Spacing utilities
  gap2: 'gap-2',
  gap4: 'gap-4',
  gap6: 'gap-6',
  mb2: 'mb-2',
  mb4: 'mb-4',
  mb6: 'mb-6',
  p2: 'p-2',
  p4: 'p-4',
  p6: 'p-6',
};

// Helper function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
