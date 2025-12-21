import { seedDatabase } from './seed-data.js';

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || 
    (process.argv[1] && process.argv[1].includes('seed.js'))) {
  seedDatabase();
}
