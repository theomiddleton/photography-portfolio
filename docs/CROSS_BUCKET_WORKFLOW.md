# Cross-Bucket Image Workflow

This document describes the optimized workflow for adding images across multiple buckets without re-uploading duplicates.

## Overview

The enhanced image workflow prevents duplicate uploads by allowing users to:
1. Browse existing images from all buckets
2. Reference existing images in new galleries without re-uploading
3. Check for duplicate files before upload
4. Seamlessly copy image references across different content types

## Key Components

### 1. Enhanced Batch Upload (`EnhancedBatchUpload`)
- **Location**: `src/components/enhanced-batch-upload.tsx`
- **Features**:
  - Two-tab interface: "Upload New" and "Use Existing"
  - Integrates with existing `BatchUpload` component
  - Provides existing image browser for reuse
  - Smart gallery integration

### 2. Existing Image Browser (`ExistingImageBrowser`)
- **Location**: `src/components/existing-image-browser.tsx`
- **Features**:
  - Search images across all buckets
  - Filter by bucket type
  - Grid and list view modes
  - Multi-select capability
  - Shows image source and metadata

### 3. API Endpoints

#### Search Existing Images
- **Endpoint**: `GET /api/images/search-existing`
- **Purpose**: Search for images across all database tables
- **Parameters**:
  - `query`: Search term (optional)
  - `bucket`: Filter by bucket type (optional)
  - `limit`: Number of results (default: 50)
  - `offset`: Pagination offset (default: 0)

#### Copy Image Reference
- **Endpoint**: `POST /api/images/copy-reference`
- **Purpose**: Reference an existing image in a new location without re-uploading
- **Body**:
  ```json
  {
    "imageId": "string",
    "sourceType": "main" | "custom" | "gallery",
    "targetBucket": "image" | "custom" | "blog" | "about",
    "galleryId": "string" (optional),
    "newName": "string" (optional)
  }
  ```

#### Check Duplicate
- **Endpoint**: `POST /api/images/check-duplicate`
- **Purpose**: Check if a file already exists by hash before upload
- **Body**: FormData with file

### 4. Enhanced Gallery Actions

#### Add Existing Images to Gallery
- **Function**: `addExistingImagesToGallery`
- **Location**: `src/lib/actions/gallery/gallery.ts`
- **Purpose**: Add references to existing images in galleries without duplication

## Workflow Examples

### 1. Adding Images to a Gallery

1. **Navigate** to Gallery Management
2. **Select** "Add Images to Gallery" 
3. **Choose** between "Upload New" or "Use Existing" tabs
4. **For existing images**:
   - Click "Browse Existing Images"
   - Search/filter to find desired images
   - Select multiple images
   - Click "Select X Images"
5. **Images are referenced** in the gallery without re-uploading

### 2. Smart Upload Page

1. **Navigate** to `/admin/upload`
2. **Use** the "Smart Upload" tab (default)
3. **Browse existing** images before uploading new ones
4. **Select from existing** to avoid duplicates

### 3. Cross-Bucket Reuse

1. **Upload** image to main gallery
2. **Later**, when creating custom content:
   - Use "Use Existing" tab
   - Search for the image
   - Reference it in custom bucket without re-upload

## Benefits

1. **Storage Efficiency**: Eliminates duplicate file storage
2. **Bandwidth Savings**: No need to re-upload existing files
3. **Time Savings**: Quickly find and reuse existing images
4. **Organization**: Clear visibility of where images are used
5. **Consistency**: Same images across different content types

## Database Structure

The workflow leverages existing tables:
- `imageData`: Main gallery images
- `customImgData`: Custom bucket images  
- `galleryImages`: Gallery-specific image references
- `duplicateFiles`: Hash-based duplicate tracking

Images can be referenced across tables without physical duplication.

## Future Enhancements

1. **Visual Duplicate Detection**: AI-powered similar image detection
2. **Usage Tracking**: See where each image is referenced
3. **Batch Operations**: Move/copy multiple image references at once
4. **Smart Suggestions**: Recommend existing images during upload
5. **Storage Analytics**: Track space savings from deduplication