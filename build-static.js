import { execSync } from 'child_process';
import path from 'path';

console.log('🚀 Building static TechyDhamaka...');

try {
  // Generate static data first
  console.log('📡 Fetching RSS feeds...');
  execSync('tsx scripts/generate-static-data.ts', { stdio: 'inherit' });
  
  // Build the Vite app
  console.log('⚡ Building React app...');
  execSync('vite build', { stdio: 'inherit' });
  
  console.log('✅ Static build complete!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}