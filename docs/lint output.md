```bash
$ pnpm lint
```

```bash

> portfolio-project@1.0.0 lint /Users/theo/Documents/code/portfolio-project
> next lint


./src/app/(auth)/logout/page.tsx
8:29  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
20:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
20:31  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
23:15  Warning: Unsafe member access .success on an `any` value.  @typescript-eslint/no-unsafe-member-access
31:13  Warning: Unsafe member access .success on an `any` value.  @typescript-eslint/no-unsafe-member-access
47:19  Warning: Unsafe member access .message on an `any` value.  @typescript-eslint/no-unsafe-member-access
47:44  Warning: Unsafe member access .issues on an `any` value.  @typescript-eslint/no-unsafe-member-access
48:55  Warning: Unsafe member access .success on an `any` value.  @typescript-eslint/no-unsafe-member-access
49:22  Warning: Unsafe member access .message on an `any` value.  @typescript-eslint/no-unsafe-member-access
52:19  Warning: Unsafe member access .issues on an `any` value.  @typescript-eslint/no-unsafe-member-access
55:18  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
55:24  Warning: Unsafe member access .issues on an `any` value.  @typescript-eslint/no-unsafe-member-access
56:28  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
66:21  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment

./src/app/(auth)/signin/page.tsx
8:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports
26:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
26:31  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
31:5  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
34:18  Warning: Unsafe member access .fields on an `any` value.  @typescript-eslint/no-unsafe-member-access
49:23  Warning: Unsafe member access .message on an `any` value.  @typescript-eslint/no-unsafe-member-access
49:48  Warning: Unsafe member access .issues on an `any` value.  @typescript-eslint/no-unsafe-member-access
50:66  Warning: Unsafe member access .message on an `any` value.  @typescript-eslint/no-unsafe-member-access
52:23  Warning: Unsafe member access .issues on an `any` value.  @typescript-eslint/no-unsafe-member-access
55:22  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
55:28  Warning: Unsafe member access .issues on an `any` value.  @typescript-eslint/no-unsafe-member-access
56:32  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
67:25  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
71:21  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call

./src/app/(auth)/signup/page.tsx
8:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports
27:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
27:31  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
32:5  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
37:18  Warning: Unsafe member access .fields on an `any` value.  @typescript-eslint/no-unsafe-member-access
52:23  Warning: Unsafe member access .message on an `any` value.  @typescript-eslint/no-unsafe-member-access
52:48  Warning: Unsafe member access .issues on an `any` value.  @typescript-eslint/no-unsafe-member-access
53:66  Warning: Unsafe member access .message on an `any` value.  @typescript-eslint/no-unsafe-member-access
55:23  Warning: Unsafe member access .issues on an `any` value.  @typescript-eslint/no-unsafe-member-access
58:22  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
58:28  Warning: Unsafe member access .issues on an `any` value.  @typescript-eslint/no-unsafe-member-access
59:32  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
70:25  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
74:21  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call

./src/app/about/layout.tsx
3:10  Warning: 'SiteFooter' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/about/page.tsx
2:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
7:10  Warning: 'siteConfig' is defined but never used.  @typescript-eslint/no-unused-vars
8:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/admin/about/page.tsx
9:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
24:8  Warning: 'AdminLayout' is defined but never used.  @typescript-eslint/no-unused-vars
44:9  Warning: 'upload' is assigned a value but never used.  @typescript-eslint/no-unused-vars
44:25  Warning: 'e' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/admin/blog/page.tsx
31:10  Warning: 'NotAuthenticated' is defined but never used.  @typescript-eslint/no-unused-vars
39:21  Warning: 'setEditTitle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
48:24  Warning: Unsafe member access .target on an `any` value.  @typescript-eslint/no-unsafe-member-access
52:28  Warning: Unsafe member access .target on an `any` value.  @typescript-eslint/no-unsafe-member-access
60:5  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
60:11  Warning: Unsafe member access .preventDefault on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/app/admin/layout.tsx
2:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports

./src/app/admin/store/[id]/page.tsx
4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/(blog)/blog/route.ts
3:17  Warning: 'blogImages' is defined but never used.  @typescript-eslint/no-unused-vars
6:11  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
10:13  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
11:13  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
12:13  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
17:17  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
18:17  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
19:17  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
20:17  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment

./src/app/api/(blog)/blog-fetch/route.ts
1:10  Warning: 'NextApiRequest' is defined but never used.  @typescript-eslint/no-unused-vars
1:26  Warning: 'NextApiResponse' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/(blog)/blog-img/route.ts
12:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
20:11  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
20:27  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
20:27  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
20:36  Warning: Unsafe member access .split on an `any` value.  @typescript-eslint/no-unsafe-member-access
20:47  Warning: Unsafe member access .pop on an `any` value.  @typescript-eslint/no-unsafe-member-access
21:11  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
21:21  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
34:7  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
37:7  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
53:28  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
53:41  Warning: Unsafe member access .message on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/app/api/(blog)/blog-img-fetch/route.ts
1:10  Warning: 'NextApiRequest' is defined but never used.  @typescript-eslint/no-unused-vars
1:26  Warning: 'NextApiResponse' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/delete/route.ts
1:31  Warning: 'S3Client' is defined but never used.  @typescript-eslint/no-unused-vars
9:11  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
13:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
16:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
32:32  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
32:43  Warning: Unsafe member access .message on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/app/api/fetch/route.ts
1:10  Warning: 'NextApiRequest' is defined but never used.  @typescript-eslint/no-unused-vars
1:26  Warning: 'NextApiResponse' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/upload/route.ts
17:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
20:27  Warning: Unsafe member access .role on an `any` value.  @typescript-eslint/no-unsafe-member-access
25:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
30:11  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
30:27  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
30:27  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
30:36  Warning: Unsafe member access .split on an `any` value.  @typescript-eslint/no-unsafe-member-access
30:47  Warning: Unsafe member access .pop on an `any` value.  @typescript-eslint/no-unsafe-member-access
32:11  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
32:21  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
49:7  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
52:7  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
53:7  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
54:7  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
72:7  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
76:7  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
85:28  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
85:41  Warning: Unsafe member access .message on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/app/auth-test/page.tsx
5:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment

./src/app/blog/[slug]/page.tsx
18:11  Warning: 'posts' is assigned a value but never used.  @typescript-eslint/no-unused-vars
22:8  Warning: 'images' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/blog/page.tsx
49:55  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/app/page.tsx
2:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/photo/[id]/page.tsx
2:10  Warning: 'SiteHeader' is defined but never used.  @typescript-eslint/no-unused-vars
5:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/store/checkout/page.tsx
164:10  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
164:23  Warning: Unsafe member access .items on an `any` value.  @typescript-eslint/no-unsafe-member-access
165:21  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
166:25  Warning: Unsafe member access .name on an `any` value.  @typescript-eslint/no-unsafe-member-access
167:21  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
167:26  Warning: Unsafe member access .price on an `any` value.  @typescript-eslint/no-unsafe-member-access
173:19  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
173:32  Warning: Unsafe member access .subtotal on an `any` value.  @typescript-eslint/no-unsafe-member-access
177:19  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
177:32  Warning: Unsafe member access .shipping on an `any` value.  @typescript-eslint/no-unsafe-member-access
182:19  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
182:32  Warning: Unsafe member access .total on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/app/store/page.tsx
50:15  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/admin/sidebar.tsx
3:10  Warning: 'siteConfig' is defined but never used.  @typescript-eslint/no-unused-vars
4:10  Warning: 'Icons' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/admin/titles.tsx
3:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports

./src/components/alt-image-page.tsx
8:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
9:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
9:22  Warning: Unsafe member access .data on an `any` value.  @typescript-eslint/no-unsafe-member-access
18:20  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
18:26  Warning: Unsafe member access .fileUrl on an `any` value.  @typescript-eslint/no-unsafe-member-access
19:20  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
19:26  Warning: Unsafe member access .description on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/components/blog-posts.tsx
49:26  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
49:31  Warning: Unsafe member access .id on an `any` value.  @typescript-eslint/no-unsafe-member-access
49:50  Warning: Unsafe return of an `any` typed value.  @typescript-eslint/no-unsafe-return
49:50  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
49:65  Warning: Unsafe member access .id on an `any` value.  @typescript-eslint/no-unsafe-member-access
50:54  Warning: Unsafe member access .id on an `any` value.  @typescript-eslint/no-unsafe-member-access
51:30  Warning: Unsafe member access .title on an `any` value.  @typescript-eslint/no-unsafe-member-access
52:30  Warning: Unsafe member access .visible on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/components/image-page.tsx
8:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
9:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
9:22  Warning: Unsafe member access .data on an `any` value.  @typescript-eslint/no-unsafe-member-access
21:22  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
21:28  Warning: Unsafe member access .fileUrl on an `any` value.  @typescript-eslint/no-unsafe-member-access
22:27  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
22:33  Warning: Unsafe member access .fileUrl on an `any` value.  @typescript-eslint/no-unsafe-member-access
31:55  Warning: Unsafe member access .name on an `any` value.  @typescript-eslint/no-unsafe-member-access
33:22  Warning: Unsafe member access .description on an `any` value.  @typescript-eslint/no-unsafe-member-access
39:22  Warning: Unsafe member access .tags on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/components/store/analytics.tsx
5:3  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
11:23  Warning: 'imageData' is defined but never used.  @typescript-eslint/no-unused-vars
54:26  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/store/charts/imageId-chart.tsx
9:3  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
13:1  Warning: Import "ChartConfig" is only used as types.  @typescript-eslint/consistent-type-imports
22:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
29:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
46:32  Warning: 'data' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
46:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/store/charts/revenue.tsx
12:1  Warning: Import "ChartConfig" is only used as types.  @typescript-eslint/consistent-type-imports
20:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
30:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions

./src/components/store/order-details.tsx
10:10  Warning: 'OrderStatus' is defined but never used.  @typescript-eslint/no-unused-vars
60:9  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment

./src/components/store/order-status-changer.tsx
2:10  Warning: 'Suspense' is defined but never used.  @typescript-eslint/no-unused-vars
7:24  Warning: 'fetchStatus' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/store/order-status.tsx
2:10  Warning: 'OrderStatusChanger' is defined but never used.  @typescript-eslint/no-unused-vars
10:9  Warning: 'initialStatus' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/store/orders.tsx
5:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
87:15  Error: Missing "key" prop for element in iterator  react/jsx-key

./src/components/store/product-visibility.tsx
17:23  Warning: 'imageData' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/store/products.tsx
90:15  Error: Missing "key" prop for element in iterator  react/jsx-key

./src/components/ui/carousel.tsx
15:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions

./src/components/ui/chart.tsx
4:3  Warning: 'NameType' is defined but never used.  @typescript-eslint/no-unused-vars
5:3  Warning: 'Payload' is defined but never used.  @typescript-eslint/no-unused-vars
6:3  Warning: 'ValueType' is defined but never used.  @typescript-eslint/no-unused-vars
24:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
194:19  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
194:58  Warning: Unsafe member access .fill on an `any` value.  @typescript-eslint/no-unsafe-member-access
225:31  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
226:31  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
297:20  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment

./src/components/ui/form.tsx
2:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports
4:1  Warning: Imports "ControllerProps", "FieldPath" and "FieldValues" are only used as types.  @typescript-eslint/consistent-type-imports
18:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
65:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions

./src/components/ui/icons.tsx
1:10  Warning: 'UploadIcon' is defined but never used.  @typescript-eslint/no-unused-vars
24:15  Warning: 'props' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
156:11  Warning: 'props' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/upload-img.tsx
17:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
31:10  Warning: 'uploading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
39:21  Warning: Unsafe member access .target on an `any` value.  @typescript-eslint/no-unsafe-member-access
52:15  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
53:42  Warning: Unsafe member access .result on an `any` value.  @typescript-eslint/no-unsafe-member-access
53:79  Warning: Unsafe member access .result on an `any` value.  @typescript-eslint/no-unsafe-member-access
53:103  Warning: Unsafe member access .result on an `any` value.  @typescript-eslint/no-unsafe-member-access
54:17  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
54:33  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
54:46  Warning: Unsafe member access .result on an `any` value.  @typescript-eslint/no-unsafe-member-access
54:65  Warning: Unsafe return of an `any` typed value.  @typescript-eslint/no-unsafe-return
54:70  Warning: Unsafe member access .fileUrl on an `any` value.  @typescript-eslint/no-unsafe-member-access
96:13  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
202:31  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/user/user-dialogs.tsx
13:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports

./src/lib/actions/about.ts
3:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
23:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/actions/blog.ts
74:11  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
74:23  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
74:42  Warning: 'tags' is assigned a value but never used.  @typescript-eslint/no-unused-vars
77:15  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
77:31  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
77:31  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
77:40  Warning: Unsafe member access .split on an `any` value.  @typescript-eslint/no-unsafe-member-access
77:51  Warning: Unsafe member access .pop on an `any` value.  @typescript-eslint/no-unsafe-member-access
78:15  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
78:25  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
90:13  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
93:13  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment

./src/lib/actions/imageUpload.ts
7:10  Warning: 'eq' is defined but never used.  @typescript-eslint/no-unused-vars
7:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
13:15  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
13:31  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
13:31  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
13:40  Warning: Unsafe member access .split on an `any` value.  @typescript-eslint/no-unsafe-member-access
13:51  Warning: Unsafe member access .pop on an `any` value.  @typescript-eslint/no-unsafe-member-access
14:15  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
14:25  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
27:13  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
30:13  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
31:13  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
32:13  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment

./src/lib/actions/store/createOrder.ts
3:10  Warning: 'eq' is defined but never used.  @typescript-eslint/no-unused-vars
3:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/actions/store/updateStatus.ts
3:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/auth/auth.ts
3:1  Warning: Import "NextRequest" is only used as types.  @typescript-eslint/consistent-type-imports
8:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/auth/authHelpers.ts
8:3  Warning: Unsafe return of an `any` typed value.  @typescript-eslint/no-unsafe-return
8:16  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
8:23  Warning: Unsafe member access .hash on an `any` value.  @typescript-eslint/no-unsafe-member-access
12:3  Warning: Unsafe return of an `any` typed value.  @typescript-eslint/no-unsafe-return
12:16  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
12:23  Warning: Unsafe member access .compare on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/lib/auth/userActions.ts
14:13  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
20:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
165:55  Warning: 'formData' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/middleware.ts
8:11  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
11:29  Warning: Unsafe member access .role on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/migrate.ts
5:7  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
5:13  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
10:7  Warning: Unsafe call of an `any` typed value.  @typescript-eslint/no-unsafe-call
10:11  Warning: Unsafe member access .end on an `any` value.  @typescript-eslint/no-unsafe-member-access

./src/server/db/db.ts
4:7  Warning: Unsafe assignment of an `any` value.  @typescript-eslint/no-unsafe-assignment
4:14  Warning: Unsafe construction of an any type value.  @typescript-eslint/no-unsafe-call

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
 ELIFECYCLE  Command failed with exit code 1.
```

Many of these warnings are related to the `any` type, which is not recommended in TypeScript, however you can temporarily disable the warnings by adding the following to the `.eslintrc` file:

```json
{
  rules: {
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off"
  }
}
}
```

by changing this, the output was reduced to: 

```bash
> portfolio-project@1.0.0 lint /Users/theo/Documents/code/portfolio-project
> next lint


./src/app/(auth)/signup/page.tsx
8:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports

./src/app/about/layout.tsx
3:10  Warning: 'SiteFooter' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/about/page.tsx
2:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
7:10  Warning: 'siteConfig' is defined but never used.  @typescript-eslint/no-unused-vars
8:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/admin/about/page.tsx
9:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
24:8  Warning: 'AdminLayout' is defined but never used.  @typescript-eslint/no-unused-vars
44:9  Warning: 'upload' is assigned a value but never used.  @typescript-eslint/no-unused-vars
44:25  Warning: 'e' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/app/admin/blog/page.tsx
31:10  Warning: 'NotAuthenticated' is defined but never used.  @typescript-eslint/no-unused-vars
39:21  Warning: 'setEditTitle' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/admin/layout.tsx
2:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports

./src/app/admin/store/[id]/page.tsx
4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/(blog)/blog/route.ts
3:17  Warning: 'blogImages' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/(blog)/blog-fetch/route.ts
1:10  Warning: 'NextApiRequest' is defined but never used.  @typescript-eslint/no-unused-vars
1:26  Warning: 'NextApiResponse' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/(blog)/blog-img-fetch/route.ts
1:10  Warning: 'NextApiRequest' is defined but never used.  @typescript-eslint/no-unused-vars
1:26  Warning: 'NextApiResponse' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/delete/route.ts
1:31  Warning: 'S3Client' is defined but never used.  @typescript-eslint/no-unused-vars
16:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/api/fetch/route.ts
1:10  Warning: 'NextApiRequest' is defined but never used.  @typescript-eslint/no-unused-vars
1:26  Warning: 'NextApiResponse' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/blog/[slug]/page.tsx
18:11  Warning: 'posts' is assigned a value but never used.  @typescript-eslint/no-unused-vars
22:8  Warning: 'images' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/blog/page.tsx
49:55  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/app/page.tsx
2:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/photo/[id]/page.tsx
2:10  Warning: 'SiteHeader' is defined but never used.  @typescript-eslint/no-unused-vars
5:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/store/page.tsx
50:15  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/admin/sidebar.tsx
3:10  Warning: 'siteConfig' is defined but never used.  @typescript-eslint/no-unused-vars
4:10  Warning: 'Icons' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/admin/titles.tsx
3:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports

./src/components/blog-posts.tsx
49:50  Warning: Unsafe return of an `any` typed value.  @typescript-eslint/no-unsafe-return

./src/components/store/analytics.tsx
5:3  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
11:23  Warning: 'imageData' is defined but never used.  @typescript-eslint/no-unused-vars
54:26  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/store/charts/imageId-chart.tsx
9:3  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
13:1  Warning: Import "ChartConfig" is only used as types.  @typescript-eslint/consistent-type-imports
22:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
29:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
46:32  Warning: 'data' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/store/charts/revenue.tsx
12:1  Warning: Import "ChartConfig" is only used as types.  @typescript-eslint/consistent-type-imports
20:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
30:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions

./src/components/store/order-details.tsx
10:10  Warning: 'OrderStatus' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/store/order-status-changer.tsx
2:10  Warning: 'Suspense' is defined but never used.  @typescript-eslint/no-unused-vars
7:24  Warning: 'fetchStatus' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/store/order-status.tsx
2:10  Warning: 'OrderStatusChanger' is defined but never used.  @typescript-eslint/no-unused-vars
10:9  Warning: 'initialStatus' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/store/orders.tsx
5:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
87:15  Error: Missing "key" prop for element in iterator  react/jsx-key

./src/components/store/product-visibility.tsx
17:23  Warning: 'imageData' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/store/products.tsx
90:15  Error: Missing "key" prop for element in iterator  react/jsx-key

./src/components/ui/carousel.tsx
15:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions

./src/components/ui/chart.tsx
4:3  Warning: 'NameType' is defined but never used.  @typescript-eslint/no-unused-vars
5:3  Warning: 'Payload' is defined but never used.  @typescript-eslint/no-unused-vars
6:3  Warning: 'ValueType' is defined but never used.  @typescript-eslint/no-unused-vars
24:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions

./src/components/ui/form.tsx
2:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports
4:1  Warning: Imports "ControllerProps", "FieldPath" and "FieldValues" are only used as types.  @typescript-eslint/consistent-type-imports
18:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
65:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions

./src/components/ui/icons.tsx
1:10  Warning: 'UploadIcon' is defined but never used.  @typescript-eslint/no-unused-vars
24:15  Warning: 'props' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
156:11  Warning: 'props' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./src/components/upload-img.tsx
17:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
31:10  Warning: 'uploading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
54:65  Warning: Unsafe return of an `any` typed value.  @typescript-eslint/no-unsafe-return
202:31  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/user/user-dialogs.tsx
13:1  Warning: All imports in the declaration are only used as types. Use `import type`.  @typescript-eslint/consistent-type-imports

./src/lib/actions/about.ts
3:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
23:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/actions/blog.ts
74:23  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
74:42  Warning: 'tags' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/actions/imageUpload.ts
7:10  Warning: 'eq' is defined but never used.  @typescript-eslint/no-unused-vars
7:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/actions/store/createOrder.ts
3:10  Warning: 'eq' is defined but never used.  @typescript-eslint/no-unused-vars
3:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/actions/store/updateStatus.ts
3:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/auth/auth.ts
3:1  Warning: Import "NextRequest" is only used as types.  @typescript-eslint/consistent-type-imports

./src/lib/auth/authHelpers.ts
8:3  Warning: Unsafe return of an `any` typed value.  @typescript-eslint/no-unsafe-return
12:3  Warning: Unsafe return of an `any` typed value.  @typescript-eslint/no-unsafe-return

./src/lib/auth/userActions.ts
14:13  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
20:6  Warning: Use an `interface` instead of a `type`.  @typescript-eslint/consistent-type-definitions
165:55  Warning: 'formData' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
 ELIFECYCLE  Command failed with exit code 1.
```

After a while of fixing these warnings and errors, I only had 9 files with warnings and errors left, but I left these due to the majority of them being in the components/ui folder, meaning they were shadcn/ui files.
