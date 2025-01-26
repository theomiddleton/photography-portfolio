# Portfolio-Project

## Features

- [x] Main image gallery
- [x] Main image gallery
- [x] Admin page
- [x] Print store
  - [ ] Analytics
- [x] Metadata store
- [x] Blob store
- [x] Metadata store
- [x] Blob store
- [x] Blog
- [ ] Infinte scroll
- [x] rethink auth

When uploading in batches check order id works properly, is currently broken when rearagning ui
Also fix that linking is broken - it uses the order id rather than the image id
Make hide buttons show when hidden, change message so fits in the row

- [ ] Optimise for mobile - 37% of visitors are on mobile

## Rework store

- [x] Public store page
  - [ ] Filterable by categories, price, date
  - [x] Each image displays preview, title, price if for sale
  - [x] Lightbox view for detailed image inspection
  - [ ] "Add to Cart" button only appears on for-sale items
- [ ] Cart System
  - [ ] Persistent cart using local storage
  - [ ] Cart sidebar/modal
  - [ ] Checkout flow integrated with Stripe
- [ ] User Account Area

  - [ ] Order history
  - [ ] Order status
  - [ ] Save favorites

- [x] Admin Interface

  - [x] Image Management Form
    - [x] Toggle "For Sale" status
    - [x] Set pricing
    - [ ] Add metadata (title, description, categories)
  - [x] Order Management
    - [x] View/track orders
    - [ ] Download sales reports
    - [ ] Customer communication system

  Services Layer

  - [ ] ImageService
    - [ ] Creates thumbnails
      - [ ] Frame images
    - [ ] Manages cloud storage (R2)

  StripeService

  - [x] Payment processing
  - [ ] Webhook handling
  - [x] Receipt generation

  OrderService

  - [ ] Order fulfillment
  - [ ] Email notifications

  - [ ] SEO & Sharing
    - [ ] Dynamic OG images
    - [ ] Structured data for products
    - [ ] Sitemap generation
    - [ ] Social sharing metadata

## Security

- [] audit security <https://youtu.be/yUm-ET8w_28>

## UI

- [ ] Main page
  - [x] Image Gallery
    - [x] Gallery order - within admin
      - [ ] Colour based order (adv)
    - [x] Image page
      - [x] revisit for responsiveness on smaller screens
  - [ ] Infinite scroll
  - [x] Auto update
  - [x] Image Select
    - [ ] Metadata
    - [x] Title
    - [ ] Location?
    - [x] Tags
    - [ ] Link to print
- [x] About page
  - [x] Made with genorator
  - [ ] Gear section / page
- [x] Blog
  - [x] Write from admin page
  - [x] write, save, publish, edit
    - [x] Have image upload section
      - [x] uploaded images go into other blob store
      - [x] uploaded imageData goes into other table
    - [x] have title and image header
    - [x] work with markdown
  - [x] Update without redeploy
- [ ] Film release with mux
- [ ] Admin
  - [ ] Page views
    - [ ] Rework
  - [ ] Upload
    - [x] cloudflare
      - [x] upload
        - [x] upload file info to database
          - [x] change database
          - [x] full delete
            - [x] within admin ui
        - [x] Presigned urls
          - [ ] revisit
      - [x] download
        - [x] image fetch
    - [ ] Metadata
    - [x] Tags
    - [ ] Location
  - [ ] Sales
  - [ ] Dashboard

## Store

- [x] Main store ui
  - [x] Product Gallery
  - [x] Purchase page
  - [x] checkout
    - [ ] login / account
  - [x] Analytics
- [ ] AR
  - /(revisit)

## Database

- [ ] Metadata store
- [ ] purchase / sales store
- [ ] Blob store
- [ ] Blog store

## Auth / purchase

- [x] Rework auth
- [ ] Revisit store
