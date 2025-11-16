# Operational Check Images Setup Guide

## Phase 1: Default Images (CURRENT - Ready to Use)

### What's Implemented

✅ Database column `operational_images` added to `survey` table
✅ Survey display loads custom images or falls back to defaults
✅ Image mapping for all 8 operational questions
✅ Graceful fallback system (custom → default → fortune cookie)

### Next Steps: Add Default Images

**Required**: Place 8 images in `/public/operational/` folder

#### Image Requirements

| Filename | Question | Recommended Content |
|----------|----------|-------------------|
| `exterior.jpg` | Exterior & Patio | Restaurant exterior, outdoor seating area |
| `interior.jpg` | Interior Presentation | Dining room, tables, decor |
| `welcome.jpg` | Welcome | Entrance, host stand, welcoming space |
| `staff-service.jpg` | Staff Service | Waiters serving, friendly staff interaction |
| `restroom.jpg` | Restroom Cleanliness | Clean restroom facilities |
| `food-safety.jpg` | Food Safety | Kitchen prep area (clean, professional) |
| `ambience.jpg` | Ambience | Dining atmosphere, lighting, comfort |
| `staff-care.jpg` | Staff Care | Staff attending to customers warmly |

**Image Specs:**
- Format: JPG or PNG
- Size: 1200x1200px (square) recommended
- Quality: High resolution, well-lit, professional
- Style: Warm, inviting, suitable for restaurant context

#### Where to Find Free Stock Photos

1. **Unsplash** - [unsplash.com/s/photos/restaurant](https://unsplash.com/s/photos/restaurant)
2. **Pexels** - [pexels.com/search/restaurant](https://pexels.com/search/restaurant)
3. **Pixabay** - [pixabay.com/images/search/restaurant](https://pixabay.com/images/search/restaurant)

All three sites offer free, high-quality images with proper licensing.

### Quick Start Commands

```bash
# Navigate to project
cd /Users/spark/Documents/Personal_Coding_Projects/HFS

# Create operational images folder (already exists)
mkdir -p public/operational

# Download images and place them in public/operational/
# Then test by creating an operational survey
npm run dev
```

### Testing

1. Start dev server: `npm run dev`
2. Create an operational survey at `/survey-creation`
3. Select "Operational Check" mode
4. Complete and activate the survey
5. Scan QR code or visit survey URL
6. **Verify**: Each of the 8 questions shows a different, relevant image

### Fallback Behavior

If default images are missing, the system falls back to the fortune cookie image. This ensures the app never breaks, but you should add proper images for the best user experience.

---

## Phase 2: Custom Image Upload (PENDING)

### Planned Features

- [ ] Image upload UI in survey creation page
- [ ] Upload to Supabase Storage or external CDN
- [ ] Preview uploaded images before saving
- [ ] Edit/replace images after upload
- [ ] Image optimization and resizing

### Database Schema (Already Ready)

The `operational_images` JSONB column can store:
```json
[
  "https://storage.url/image1.jpg",
  "https://storage.url/image2.jpg",
  ...
  "https://storage.url/image8.jpg"
]
```

Or `null` to use default images.

---

## For Mylapore Demo

### Option A: Use Stock Photos (Recommended)
- Quick setup, looks professional
- Download 8 relevant images from Unsplash
- Place in `/public/operational/`
- Ready to demo in ~15 minutes

### Option B: Use Mylapore's Photos
- Most authentic
- Request 8 specific photos from restaurant
- Better for final presentation
- Takes longer to obtain

### Option C: Hardcode Custom Images
- Create a special survey with custom images for demo
- Manually insert image URLs in database
- Shows Phase 2 capability without building full UI

**Recommendation**: Start with Option A for quick demo, then get Mylapore photos for production.

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Database schema | ✅ Complete | `operational_images` column added |
| Default image paths | ✅ Complete | Mapped in `operational-questions.ts` |
| Survey display logic | ✅ Complete | Loads custom/default images |
| Fallback system | ✅ Complete | Graceful degradation |
| Default images | ⏳ Pending | Need to add 8 images to `/public/operational/` |
| Upload UI | ⏳ Phase 2 | Planned for next iteration |
| Image optimization | ⏳ Phase 2 | Can add compression/resizing |

---

## Questions?

Contact: [Your contact info or leave blank]
