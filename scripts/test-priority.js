// Test script to verify priority matching logic
// Run with: node scripts/test-priority.js

const areaData = require('../karachi-areas-list.json');

const normalizeString = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');

function testPriority(area, district) {
  const matchedArea = areaData.find((item) => {
    if (district) {
      const districtMatch = normalizeString(item.District) === normalizeString(district);
      const areaName = normalizeString(item.AreasName);
      const userArea = normalizeString(area);
      
      const areaMatch = areaName === userArea ||
                       areaName.includes(userArea) ||
                       userArea.includes(areaName) ||
                       areaName.startsWith(userArea) ||
                       userArea.startsWith(areaName);
      
      return districtMatch && areaMatch;
    } else {
      const areaName = normalizeString(item.AreasName);
      const userArea = normalizeString(area);
      
      const areaMatch = areaName === userArea ||
                       areaName.includes(userArea) ||
                       userArea.includes(areaName) ||
                       areaName.startsWith(userArea) ||
                       userArea.startsWith(areaName);
      
      return areaMatch;
    }
  });

  if (matchedArea) {
    const classToPriority = {
      'Lower': 'High',
      'Middle': 'Medium',
      'Elite': 'Low',
    };
    return {
      found: true,
      area: matchedArea.AreasName,
      district: matchedArea.District,
      class: matchedArea.Class,
      priority: classToPriority[matchedArea.Class] || 'Medium'
    };
  }
  
  return { found: false };
}

// Test cases
console.log('Testing Priority Matching Logic:\n');
console.log('='.repeat(60));

const testCases = [
  { area: 'Bhangoria Town', district: 'Central' },
  { area: 'Bufferzone Sector 16 A', district: 'Central' },
  { area: 'Orangi Town', district: 'West' },
  { area: 'Clifton', district: 'South' },
];

testCases.forEach((test, index) => {
  console.log(`\nTest ${index + 1}: ${test.area}, ${test.district}`);
  const result = testPriority(test.area, test.district);
  if (result.found) {
    console.log(`  ✅ Found: ${result.area}`);
    console.log(`  📍 District: ${result.district}`);
    console.log(`  🏷️  Class: ${result.class}`);
    console.log(`  ⚡ Priority: ${result.priority}`);
  } else {
    console.log(`  ❌ Not found in JSON`);
  }
});

console.log('\n' + '='.repeat(60));

