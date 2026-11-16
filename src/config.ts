// Band-wide settings. Change these once and every page picks them up.
export const site = {
  bandName: 'Fontaines D.C.',
  // Header logo. If `image` is set it is used; otherwise a wordmark is drawn from main/suffix/tag.
  // PLACEHOLDER: temp-logo.png is the Fontaines D.C. logo, for local preview only.
  // Replace with the tribute band's own logo before the site goes live.
  logo: { image: '/logo/temp-logo.png', main: 'Fontaines', suffix: 'D.C.', tag: 'Tribute' },
  tagline: 'Tribute band tagline goes here. Replace with the client\'s own wording.',
  description: 'A tribute to Fontaines D.C. Live dates, photos and booking.',
  bookingEmail: 'bookings@example.com',
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'Facebook', href: 'https://facebook.com/' },
    { label: 'TikTok', href: 'https://tiktok.com/' },
  ],
};

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/gigs', label: 'Gigs' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

// Home page slider: one entry per slide, shown in order. `position` sets which part of
// the image stays in view when it is cropped (CSS object-position).
// PLACEHOLDER IMAGES: slide-1 to slide-4 are Fontaines D.C. artwork, used only to preview
// the layout locally. Replace with the band's own photos before the site goes live.
export const slides = [
  {
    image: '/photos/hero/slide-1.jpg',
    position: 'center',
    eyebrow: 'Live tribute',
    title: site.bandName,
    text: site.tagline,
    actions: [
      { label: 'Live dates', href: '/gigs', primary: true },
      { label: 'Book the band', href: '/contact' },
    ],
  },
  {
    image: '/photos/hero/slide-2.jpg',
    position: '35% center',
    eyebrow: 'On tour',
    title: 'Live dates',
    text: 'Dates across the North this winter. Find a show near you.',
    actions: [{ label: 'See all gigs', href: '/gigs', primary: true }],
  },
  {
    image: '/photos/hero/slide-3.jpg',
    position: '30% center',
    eyebrow: 'Gallery',
    title: 'From the floor',
    text: 'Photos from recent shows.',
    actions: [{ label: 'View photos', href: '/gallery', primary: true }],
  },
  {
    image: '/photos/hero/slide-4.jpg',
    position: 'center',
    eyebrow: 'Bookings',
    title: 'Book the band',
    text: 'Venues, festivals and private parties.',
    actions: [{ label: 'Get in touch', href: '/contact', primary: true }],
  },
];
