# Leaflet.js Map Integration

## Overview

The StudentEventDetails component now includes an interactive Leaflet.js map that displays the event location. Leaflet is an open-source mapping library that doesn't require API keys for basic functionality.

## Features

- **Interactive Map**: Users can zoom, pan, and explore the area around the event location
- **Free Geocoding**: Uses OpenStreetMap Nominatim service (no API key required)
- **Offline Fallback**: Shows a placeholder if geocoding fails
- **Responsive Design**: Map adjusts to the container size
- **Professional Styling**: Consistent with the rest of the application
- **Popup Information**: Click on the marker to see event details

## Dependencies Installed

```bash
npm install leaflet react-leaflet @types/leaflet
```

## Component Usage

The LeafletMap component accepts the following props:

- `address` (required): The address to display on the map
- `height` (optional): Height of the map container (default: '300px')
- `width` (optional): Width of the map container (default: '100%')

## Key Features

### 1. **No API Key Required**

- Uses OpenStreetMap tiles (free and open)
- Nominatim geocoding service (free)
- No registration or API limits for basic usage

### 2. **Automatic Geocoding**

- Converts address strings to coordinates
- Handles geocoding errors gracefully
- Falls back to default location if address not found

### 3. **Interactive Controls**

- Zoom in/out with mouse wheel or controls
- Pan around the map by dragging
- Click marker for popup with event information

### 4. **Error Handling**

- Loading states while geocoding
- Error messages for failed requests
- Fallback locations for invalid addresses

### 5. **Mobile Responsive**

- Touch-friendly controls
- Responsive sizing
- Works on all device types

## Implementation Details

### Map Provider

- **Tiles**: OpenStreetMap (free, no registration required)
- **Geocoding**: Nominatim OpenStreetMap service
- **Library**: Leaflet.js with React Leaflet wrapper

### Styling

- Custom CSS integration with existing design
- Rounded corners and professional appearance
- Error and loading state indicators
- Consistent with the application's color scheme

### Performance

- Lazy loading of map components
- Efficient re-rendering on address changes
- Optimized marker and popup handling

## Files Added/Modified

- `src/components/LeafletMap.tsx` - New Leaflet map component
- `src/components/Student/StudentEventDetails.tsx` - Updated to include the map
- `package.json` - Added leaflet dependencies

## Advantages Over Google Maps

1. **Free**: No API key or billing required
2. **Open Source**: Full control over the implementation
3. **Privacy**: No tracking by third-party services
4. **Offline Capable**: Can be configured for offline use
5. **Customizable**: Easy to style and modify

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Future Enhancements

- Custom markers with event icons
- Cluster markers for multiple events
- Routing directions to the event
- Offline map caching
- Custom map themes
