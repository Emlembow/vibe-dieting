#!/usr/bin/env node

/**
 * Database initialization script for serverless deployment
 * This runs during build time to set up the database schema
 */

const fs = require('fs');
const path = require('path');

async function initDatabase() {
  console.log('🔄 Initializing database schema...');
  
  // Check if we have the required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing environment variables:', missingVars.join(', '));
    console.log('🔧 Database setup will be skipped during build');
    console.log('💡 Run database migrations manually after deployment');
    return;
  }
  
  try {
    // Import Supabase client
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
        },
      }
    );
    
    console.log('✅ Connected to Supabase');
    
    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No migrations directory found');
      return;
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    
    // Apply migrations
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`🔄 Applying migration: ${file}`);
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`❌ Migration ${file} failed:`, error.message);
        // Continue with other migrations
      } else {
        console.log(`✅ Migration ${file} applied successfully`);
      }
    }
    
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.log('❌ Database initialization failed:', error.message);
    console.log('💡 You may need to run migrations manually');
  }
}

// Only run if called directly (not during require)
if (require.main === module) {
  initDatabase().catch(console.error);
}

module.exports = { initDatabase };