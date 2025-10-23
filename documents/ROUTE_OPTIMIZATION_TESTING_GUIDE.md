# Quick Start Guide - Route Optimization Testing

## Prerequisites Checklist
- [ ] MongoDB is running
- [ ] Backend server can connect to MongoDB
- [ ] You have Manager or Admin account credentials

## Step-by-Step Testing Instructions

### 1. Seed Sample Bins (First Time Only)

```bash
# Navigate to backend directory
cd "c:\Users\Viman Kavinda\Desktop\3y 1sem\csse\assignment 2\eco system\EcoCollect\apps\backend"

# Run the seed script
node scripts/seed-bins.js
```

**Expected Output:**
```
Connected to MongoDB
✓ Created/Updated bin: BIN-001 at Galle Face
✓ Created/Updated bin: BIN-002 at Independence Square
...
✅ Successfully seeded 8 bins!
```

### 2. Start Backend Server

```bash
# In the backend directory
npm run dev
```

**Verify:** Server should start on port 3000 (or configured port)

### 3. Start Frontend Server

```bash
# Open new terminal
cd "c:\Users\Viman Kavinda\Desktop\3y 1sem\csse\assignment 2\eco system\EcoCollect\apps\frontend-next"

npm run dev
```

**Verify:** Frontend should start on port 3001

### 4. Login and Navigate

1. Open browser: `http://localhost:3001`
2. Login with Manager or Admin credentials
3. Navigate to: `http://localhost:3001/routes`

### 5. Test Route Optimization

#### Test Case 1: Optimize All Bins
1. Leave "Area ID" field empty
2. Click "Generate Optimized Routes"
3. **Expected Result:**
   - Map shows 8 markers (all bins)
   - Blue line connects markers in optimized order
   - Table shows 8 bins with stop numbers
   - Statistics show "8" optimized route stops

#### Test Case 2: Optimize by Area (Colombo Central)
1. Enter "COLOMBO-CENTRAL" in Area ID field
2. Click "Generate Optimized Routes"
3. **Expected Result:**
   - Map shows 6 markers (only Colombo Central bins)
   - Blue line connects these 6 markers
   - Table shows 6 bins
   - Statistics show "6" optimized route stops

#### Test Case 3: Optimize by Area (Dehiwala)
1. Enter "DEHIWALA" in Area ID field
2. Click "Generate Optimized Routes"
3. **Expected Result:**
   - Map shows 2 markers
   - Blue line connects these 2 markers
   - Table shows 2 bins
   - Statistics show "2" optimized route stops

#### Test Case 4: Invalid Area
1. Enter "NONEXISTENT-AREA" in Area ID field
2. Click "Generate Optimized Routes"
3. **Expected Result:**
   - Alert message: "No bins found for the specified area"
   - Map remains empty or shows previous route
   - Table shows no bins

### 6. Verify Features

#### Map Interaction
- [ ] Can zoom in/out on map
- [ ] Can pan/drag map
- [ ] Click on marker shows popup with bin details
- [ ] Popup shows: Stop #, Bin ID, Location, Category

#### Route Display
- [ ] Blue polyline connects bins
- [ ] Line follows correct order (Stop 1 → 2 → 3...)
- [ ] Map centers on bins automatically

#### Table Display
- [ ] Shows all bins in optimized order
- [ ] Displays: Stop #, Bin ID, Location, Category, Coordinates
- [ ] Coordinates formatted to 4 decimal places
- [ ] Table is scrollable if many bins

#### Statistics Panel
- [ ] Shows correct number of route stops
- [ ] Status changes from "Not Generated" to "Optimized"
- [ ] Area filter displays correctly

### 7. Manual API Testing (Optional)

Test the backend directly with curl:

```bash
# Test with no area filter
curl -X POST http://localhost:3000/api/routes/optimize \
  -H "Content-Type: application/json" \
  -d "{}" \
  --cookie "your-session-cookie"

# Test with area filter
curl -X POST http://localhost:3000/api/routes/optimize \
  -H "Content-Type: application/json" \
  -d '{"areaId": "COLOMBO-CENTRAL"}' \
  --cookie "your-session-cookie"
```

## Troubleshooting

### Issue: Bins not seeded
**Solution:** Check MongoDB connection string in .env file

### Issue: Map not showing
**Solution:** 
- Check browser console for errors
- Verify Leaflet is installed: `npm list leaflet`
- Clear browser cache and reload

### Issue: "Unauthorized" error
**Solution:** 
- Ensure you're logged in as Manager or Admin
- Check session cookie is present
- Re-login if needed

### Issue: No route generated
**Solution:**
- Verify bins exist in database: Run seed script again
- Check bins have valid coordinates
- Look at browser Network tab for API errors

### Issue: Route looks incorrect
**Solution:**
- Verify bin coordinates are correct (lat/lng format)
- Check coordinate values are reasonable for Sri Lanka:
  - Latitude: ~6.0 to 7.0
  - Longitude: ~79.0 to 82.0

## Adding Your Own Bins

### Via MongoDB Shell/Compass

```javascript
db.bins.insertOne({
  binId: "BIN-009",
  location: "Your Location Name",
  category: "general", // or "recyclable", "organic"
  latitude: 6.9271,    // Your latitude
  longitude: 79.8612,  // Your longitude
  areaId: "YOUR-AREA", // Area identifier
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Via API (if you have a create bin endpoint)

```bash
curl -X POST http://localhost:3000/api/bins \
  -H "Content-Type: application/json" \
  -d '{
    "binId": "BIN-009",
    "location": "Your Location",
    "category": "general",
    "latitude": 6.9271,
    "longitude": 79.8612,
    "areaId": "YOUR-AREA"
  }' \
  --cookie "your-session-cookie"
```

## Performance Notes

- Algorithm handles up to ~1000 bins efficiently
- For more bins, consider:
  - Adding pagination
  - Splitting into multiple areas
  - Implementing advanced algorithms

## Sample Bin Locations

The seed script creates bins at these real locations:

**COLOMBO-CENTRAL Area:**
1. Galle Face (6.9271, 79.8612)
2. Independence Square (6.9034, 79.8685)
3. Viharamahadevi Park (6.9147, 79.8608)
4. Town Hall (6.9120, 79.8653)
5. Colombo Fort (6.9344, 79.8428)
6. Bambalapitiya (6.8930, 79.8547)

**DEHIWALA Area:**
1. Dehiwala Zoo (6.8566, 79.8779)
2. Mount Lavinia Beach (6.8335, 79.8630)

## Success Criteria

✅ All bins displayed on map  
✅ Route path visible as blue line  
✅ Bins connected in logical order  
✅ Clicking markers shows correct info  
✅ Table matches map route order  
✅ Statistics update correctly  
✅ Area filtering works  
✅ Loading states display properly  
✅ Error messages appear for invalid input  

## Next Steps

After testing:
1. Add more bins for your actual locations
2. Adjust map default center for your region
3. Consider implementing suggested improvements (see main documentation)
4. Integrate with collection scheduling system
5. Add route export functionality

## Support

For issues or questions:
1. Check the main documentation: `ROUTE_OPTIMIZATION_IMPLEMENTATION.md`
2. Review browser console errors
3. Check server logs
4. Verify database state

---

**Happy Testing! 🚛♻️🗺️**
