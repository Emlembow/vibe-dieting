#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌟 Vibe Dieting - Post-Install Setup');
console.log('====================================\n');

// Only run during development, not in production/Vercel
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  console.log('📦 Production environment detected - skipping local setup');
  process.exit(0);
}

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

// Check for required files
const requiredFiles = [
  'openai-assistant-schema.json',
  'openai-assistant-prompt.md',
  'supabase/migrations'
];

console.log('\n🔍 Checking project files...');
let allFilesPresent = true;

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesPresent = false;
  }
});

if (allFilesPresent) {
  console.log('\n🎉 All required files are present!');
} else {
  console.log('\n⚠️  Some required files are missing');
}

console.log('\n📋 Next Steps:');
console.log('1. Update .env.local with your Supabase and OpenAI credentials');
console.log('2. Run: npm run db:setup (follow the prompts)');
console.log('3. Create OpenAI Assistant using the provided files');
console.log('4. Run: npm run dev');

console.log('\n✨ Setup complete! Happy coding!');