import { unstable_flag as flag } from '@vercel/flags/next'
 
export const showSummerSale = flag({
  key: 'summer-sale',
  decide: () => false,
});

export const altImagePage = flag<boolean>({
  key: 'alt-image-page',
  decide: () => false,
  description: 'Controls whether the new image page is visible',
  origin: 'https://localhost:3000/photo/1',
  options: [
    { value: false, label: 'Off' },
    { value: true, label: 'On' },
  ],
})
