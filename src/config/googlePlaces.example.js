/**
 * Google Places API Configuration Example
 * 
 * Copy this file to 'googlePlaces.js' and add your Google Places API Key
 * Get your API key from: https://console.cloud.google.com/
 * 
 * Make sure to enable:
 * - Places API
 * - Maps JavaScript API
 * - Geocoding API
 */

export const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';

// Optional: Configure autocomplete options
export const AUTOCOMPLETE_OPTIONS = {
  types: ['geocode', 'establishment'],
  componentRestrictions: { country: 'co' }, // Colombia - change as needed
};

