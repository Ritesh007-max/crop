const { fetchCropProduction } = require('../Services/govDataService');

// Test 1: Maharashtra - Ahmednagar (known to exist in dataset)
fetchCropProduction('Maharashtra', 'Ahmednagar', { limit: 500 })
  .then(r => {
    console.log('=== Maharashtra / AHMEDNAGAR ===');
    console.log('Dataset records fetched:', r.records_fetched, '| Total in dataset:', r.total_dataset_records);
    console.log('Unique crops:', r.unique_crops_count);
    console.log('\nTop 10 crops by production:');
    r.crops.slice(0, 10).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.crop} | Area: ${c.total_area_ha.toLocaleString()} ha | Production: ${c.total_production_tonnes.toLocaleString()} tonnes | Seasons: ${c.seasons.join(', ')} | Years: ${c.year_range}`);
    });
  })
  .catch(e => console.error('Error:', e.message));
