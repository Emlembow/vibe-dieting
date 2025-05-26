#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌟 Vibe Dieting - Automated Setup');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local from .env.example...');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local created');
  } else {
    console.log('⚠️  .env.example not found');
  }
} else {
  console.log('✅ .env.local already exists');
}

console.log('\n🔧 Setup Steps:');
console.log('1. Create a Supabase project at https://app.supabase.com');
console.log('2. Copy your project URL and keys to .env.local');
console.log('3. Run: npx supabase init (if not already done)');
console.log('4. Run: npx supabase link --project-ref YOUR_PROJECT_REF');
console.log('5. Run: npx supabase db push');
console.log('6. Create OpenAI Assistant using files in project root');
console.log('7. Add OpenAI keys to .env.local');

console.log('\n📋 Required Environment Variables:');
console.log('- NEXT_PUBLIC_SUPABASE_URL');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('- SUPABASE_SERVICE_ROLE_KEY');
console.log('- OPENAI_API_KEY');
console.log('- OPENAI_ASSISTANT_ID');

console.log('\n🚀 After setup, run: npm run dev');
console.log('\n✨ Happy coding with good vibes!');