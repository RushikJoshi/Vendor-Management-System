/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // VMS Brand Colors
        'vms-primary': '#0F172A',
        'vms-accent': '#10B981',
        'vms-warning': '#F59E0B',
        'vms-danger': '#EF4444',
        'vms-slate': '#64748B',
        'vms-bg': '#F8FAFC',
        
        // Corporate Colors
        'corp-dark': '#0B5D3B',
        'corp-secondary': '#117A4F',
        'corp-light': '#E8F5EE',
        'corp-text': '#1F2937',
        'corp-border': '#E5E7EB',
      },
      fontFamily: {
        inter: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'vms': '0.75rem',    
        'vms-lg': '1rem',    
        'enterprise': '0.625rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};


