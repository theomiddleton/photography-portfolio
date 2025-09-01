# Manual Testing Guide for Cross-Bucket Image Workflow

## Prerequisites

1. **Database Setup**: Ensure PostgreSQL database is running with the full schema
2. **R2 Storage**: Configure Cloudflare R2 buckets (image, custom, blog, about)
3. **Environment Variables**: Complete .env file with all required credentials
4. **Admin Access**: Login as admin user

## Test Scenarios

### Scenario 1: Upload New Images with Duplicate Prevention

**Objective**: Verify that the system prevents duplicate uploads

1. **Navigate** to `/admin/upload`
2. **Select** "Smart Upload" tab
3. **Upload** a test image using "Upload New" tab
4. **Attempt** to upload the same image again
5. **Expected**: System should detect duplicate and suggest using existing image

### Scenario 2: Browse and Select Existing Images

**Objective**: Test the existing image browser functionality

1. **Navigate** to `/admin/upload` 
2. **Select** "Smart Upload" tab
3. **Click** "Use Existing" tab
4. **Click** "Browse Existing Images"
5. **Test Features**:
   - Search functionality with various terms
   - Filter by bucket type
   - Switch between grid and list views
   - Select multiple images
   - Preview image details

### Scenario 3: Cross-Bucket Image Reuse in Galleries

**Objective**: Verify images can be reused across different galleries without re-uploading

1. **Upload** test images to main gallery
2. **Create** a new custom gallery
3. **Navigate** to gallery management
4. **Select** "Add Images to Gallery"
5. **Choose** "Use Existing" tab
6. **Browse** and select images from main gallery
7. **Add** to custom gallery
8. **Verify**: 
   - Images appear in both galleries
   - File URLs are identical (no duplication)
   - Storage space is conserved

### Scenario 4: API Endpoint Testing

**Objective**: Verify API endpoints work correctly

#### Search Existing Images
```bash
curl -X GET "http://localhost:3000/api/images/search-existing?query=landscape&limit=10" \
  -H "Cookie: auth-token=your-admin-token"
```

#### Copy Image Reference
```bash
curl -X POST "http://localhost:3000/api/images/copy-reference" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=your-admin-token" \
  -d '{
    "imageId": "123",
    "sourceType": "main",
    "targetBucket": "custom",
    "galleryId": "gallery-uuid"
  }'
```

#### Check for Duplicates
```bash
curl -X POST "http://localhost:3000/api/images/check-duplicate" \
  -H "Cookie: auth-token=your-admin-token" \
  -F "file=@test-image.jpg"
```

### Scenario 5: Gallery Manager Integration

**Objective**: Test enhanced gallery management with existing image selection

1. **Navigate** to gallery management page
2. **Open** an existing gallery
3. **Use** the enhanced "Add Images to Gallery" interface
4. **Test** both upload and existing image selection
5. **Verify** images are properly added with correct ordering

## Expected Results

### User Experience
- **Seamless Integration**: New workflow doesn't disrupt existing functionality
- **Clear Interface**: Users understand when they're uploading vs. reusing
- **Fast Performance**: Searching existing images is responsive
- **Visual Feedback**: Clear indication of image sources and duplicates

### Technical Verification
- **Storage Efficiency**: Same file URLs across multiple references
- **Database Integrity**: Proper foreign key relationships maintained
- **API Performance**: Quick response times for search and copy operations
- **Error Handling**: Graceful handling of missing images or permissions

### Storage Monitoring
- **Before**: Check total storage usage
- **After**: Verify no increase when reusing existing images
- **Logs**: Confirm deduplication events are logged

## Troubleshooting Common Issues

### 1. Images Not Appearing in Browser
- **Check**: Database connectivity
- **Verify**: Image URLs are accessible
- **Test**: API endpoint directly

### 2. Duplicate Detection Not Working
- **Verify**: File hash calculation is working
- **Check**: duplicateFiles table has entries
- **Test**: API endpoint with known files

### 3. Gallery Integration Issues
- **Check**: Gallery ID is valid
- **Verify**: User has admin permissions
- **Test**: addExistingImagesToGallery function

### 4. Performance Issues
- **Monitor**: Database query performance
- **Check**: Image loading times
- **Optimize**: Add database indexes if needed

## Success Metrics

1. **Storage Reduction**: Measurable decrease in duplicate files
2. **Upload Efficiency**: Faster workflow for content creators
3. **User Adoption**: Admin users prefer new workflow
4. **System Stability**: No performance degradation
5. **Error Rate**: Less than 1% failed operations

## Post-Testing Actions

1. **Document** any issues found
2. **Update** user training materials
3. **Monitor** storage usage trends
4. **Gather** feedback from content creators
5. **Plan** future enhancements based on usage patterns