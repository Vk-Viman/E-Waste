# Route Optimization Feature Documentation

## Overview
The Route Optimization feature provides an intelligent way to optimize collection routes for waste management. It uses the **Nearest Neighbor Algorithm** to calculate the most efficient path for collecting waste from multiple bins.

## Features Implemented

### 1. Backend Algorithm (`apps/backend/src/features/routes/controller.js`)

#### Nearest Neighbor Algorithm
The implementation uses a greedy approach to optimize routes:

1. **Fetch Bins**: Retrieves all bins for a specified area (or all bins if no area specified)
2. **Validate Coordinates**: Filters bins with valid latitude and longitude values
3. **Start Point**: Begins with the first bin in the list
4. **Iterative Selection**: For each subsequent stop:
   - Calculates Euclidean distance to all unvisited bins
   - Selects the nearest bin as the next stop
   - Removes the selected bin from unvisited list
5. **Result**: Returns ordered list of bins with stop numbers and coordinates

#### API Endpoint
```
POST /api/routes/optimize
```

**Request Body:**
```json
{
  "areaId": "COLOMBO-CENTRAL"  // Optional: filter by area
}
```

**Response:**
```json
{
  "optimizedRoute": [
    {
      "order": 1,
      "binId": "BIN-001",
      "location": "Galle Face",
      "category": "general",
      "latitude": 6.9271,
      "longitude": 79.8612,
      "areaId": "COLOMBO-CENTRAL"
    },
    // ... more bins
  ],
  "totalBins": 5,
  "areaId": "COLOMBO-CENTRAL"
}
```

#### Distance Calculation
Uses Euclidean distance formula:
```
distance = √[(lat₁ - lat₂)² + (lon₁ - lon₂)²]
```

**Note**: For production use with real geographic coordinates, consider using the Haversine formula for more accurate distance calculations over the Earth's surface.

### 2. Database Model Updates (`apps/backend/src/features/collections/model.bin.js`)

Added fields to the Bin schema:
- `latitude`: Number - Geographic latitude coordinate
- `longitude`: Number - Geographic longitude coordinate
- `areaId`: String (indexed) - Area identifier for grouping bins

### 3. Frontend Map Visualization (`apps/frontend-next/app/(manager)/routes/page.tsx`)

#### Technologies Used
- **React Leaflet 4.2.1**: React bindings for Leaflet.js
- **Leaflet**: Interactive map library
- **OpenStreetMap**: Free tile provider for map display
- **Next.js Dynamic Import**: Server-side rendering compatibility

#### Features

1. **Interactive Map**
   - Displays all bin locations as markers
   - Centers automatically based on bin locations
   - Default view: Colombo, Sri Lanka (6.9271, 79.8612)
   - Zoom level: 13

2. **Bin Markers**
   - Each bin displayed with a marker
   - Click marker to see popup with bin details:
     - Stop number in sequence
     - Bin ID
     - Location name
     - Category

3. **Route Visualization**
   - Blue polyline connecting bins in optimized order
   - Shows the complete route path
   - Updates dynamically when route is optimized

4. **User Controls**
   - Area ID input field for filtering bins by area
   - "Generate Optimized Routes" button
   - Loading state during optimization
   - Error handling with user feedback

5. **Route Statistics Panel**
   - Number of optimized route stops
   - Route generation status
   - Current area filter

6. **Route Sequence Table**
   - Displays ordered list of bins
   - Shows stop number, bin ID, location, category, and coordinates
   - Sortable and easy to read

## Installation & Setup

### Prerequisites
- Node.js and npm installed
- MongoDB running
- Backend server configured

### Backend Setup
No additional installation needed - uses existing dependencies.

### Frontend Setup

1. **Install Dependencies** (Already completed):
```bash
cd apps/frontend-next
npm install leaflet react-leaflet@4.2.1 @types/leaflet --legacy-peer-deps
```

2. **Leaflet CSS**: Already imported in the component via:
```typescript
import 'leaflet/dist/leaflet.css';
```

## Testing the Feature

### Step 1: Seed Sample Data

Run the provided seed script to create sample bins:

```bash
cd apps/backend
node scripts/seed-bins.js
```

This creates 8 sample bins in two areas:
- **COLOMBO-CENTRAL**: 6 bins around central Colombo
- **DEHIWALA**: 2 bins in Dehiwala area

### Step 2: Start the Servers

1. Start the backend:
```bash
cd apps/backend
npm run dev
```

2. Start the frontend:
```bash
cd apps/frontend-next
npm run dev
```

### Step 3: Test the Feature

1. Navigate to `http://localhost:3001/routes` (login as Manager or Admin)
2. Leave Area ID empty to optimize all bins, or enter `COLOMBO-CENTRAL` or `DEHIWALA`
3. Click "Generate Optimized Routes"
4. Observe:
   - Map displays all bins with markers
   - Blue line shows optimized route
   - Table displays bins in visit order
   - Statistics update with route info

## Code Structure

### Backend Files
- `apps/backend/src/features/routes/controller.js` - Route optimization logic
- `apps/backend/src/features/collections/model.bin.js` - Bin database model
- `apps/backend/scripts/seed-bins.js` - Sample data seeding script

### Frontend Files
- `apps/frontend-next/app/(manager)/routes/page.tsx` - Main route optimization page

## Algorithm Complexity

- **Time Complexity**: O(n²) where n is the number of bins
  - For each bin, we search through remaining unvisited bins
  - Suitable for small to medium datasets (< 1000 bins)

- **Space Complexity**: O(n) for storing the route and unvisited bins list

## Potential Improvements

1. **Better Distance Calculation**
   - Implement Haversine formula for accurate geographic distances
   - Consider road networks instead of straight-line distance

2. **Advanced Algorithms**
   - Implement Genetic Algorithm for better optimization
   - Use 2-opt or 3-opt improvements
   - Try Ant Colony Optimization for larger datasets

3. **Performance Optimization**
   - Add caching for frequently optimized routes
   - Implement pagination for large bin lists
   - Use spatial indexing in MongoDB (2dsphere index)

4. **User Experience**
   - Add route export to PDF/CSV
   - Save and reuse routes
   - Real-time tracking integration
   - Estimated time and distance calculations

5. **Map Enhancements**
   - Add different marker icons for bin categories
   - Show bin fill levels
   - Add traffic data integration
   - Support for multiple routes simultaneously

## Error Handling

The implementation includes comprehensive error handling:

- **No bins found**: Returns empty array with message
- **Invalid coordinates**: Filters out bins without valid lat/lng
- **API errors**: Displays user-friendly error messages
- **Loading states**: Shows feedback during optimization

## Security Considerations

- Route optimization requires Manager or Admin role
- Uses existing authentication middleware
- No sensitive data exposed in API responses

## Browser Compatibility

The map component uses dynamic imports to ensure compatibility with:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

**Note**: Leaflet requires client-side rendering, so SSR is disabled for map components.

## Troubleshooting

### Map Not Displaying
- Ensure Leaflet CSS is imported
- Check browser console for errors
- Verify dynamic imports are working

### No Route Generated
- Check if bins have valid coordinates
- Verify MongoDB connection
- Check browser network tab for API errors
- Ensure authentication is working

### Route Looks Wrong
- Verify bin coordinates are correct (latitude/longitude order)
- Check that coordinates use decimal degrees
- Ensure bins are in reasonable geographic proximity

## API Testing

Use curl or Postman to test the API directly:

```bash
curl -X POST http://localhost:3000/api/routes/optimize \
  -H "Content-Type: application/json" \
  -d '{"areaId": "COLOMBO-CENTRAL"}' \
  --cookie "session=your-session-cookie"
```

## Contributing

When extending this feature:
1. Maintain the existing API contract
2. Add proper error handling
3. Update this documentation
4. Add tests for new functionality
5. Consider performance implications

## License

Part of the EcoCollect waste management system.
