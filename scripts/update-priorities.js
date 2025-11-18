// Script to update priorities for all existing cases
// Run with: node scripts/update-priorities.js

const fetch = require('node-fetch');

async function updatePriorities() {
  try {
    console.log('Starting priority update...');
    
    const response = await fetch('http://localhost:3000/api/cases/update-priorities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Priority update completed successfully!');
      console.log(`📊 Total cases: ${data.total}`);
      console.log(`✅ Updated: ${data.updated}`);
      console.log(`❌ Errors: ${data.errors}`);
    } else {
      console.error('❌ Error updating priorities:', data.message);
    }
  } catch (error) {
    console.error('❌ Failed to update priorities:', error.message);
  }
}

updatePriorities();

