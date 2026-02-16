const axios = require('axios');

async function getAreaNameFromCoordinates([lng, lat]) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json'
      },
      headers: {
        'User-Agent': 'YourApp/1.0'
      }
    });

    return response.data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    return null;
  }
}

module.exports = { getAreaNameFromCoordinates };
