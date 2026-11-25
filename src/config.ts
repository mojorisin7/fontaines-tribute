// Band-wide settings. Change these once and every page picks them up.
export const site = {
  bandName: 'Fontaines D.C.',
  // Header logo. If `image` is set it is used; otherwise a wordmark is drawn from main/suffix/tag.
  // PLACEHOLDER: temp-logo.png is the Fontaines D.C. logo, for local preview only.
  // Replace with the tribute band's own logo before the site goes live.
  logo: { image: '/logo/temp-logo.png', main: 'Fontaines', suffix: 'D.C.', tag: 'Tribute' },
  tagline: 'Tribute band tagline goes here. Replace with the client\'s own wording.',
  description: 'A tribute to Fontaines D.C. Live dates, music, videos and booking.',
  bookingEmail: 'bookings@fontainestributeband.com',
  // Footer icons, shown in this order. The email icon uses bookingEmail. Set each href to the
  // band's own profile; remove a line to hide that icon. PLACEHOLDER links until the band sends them.
  socials: [
    { icon: 'email', label: 'Email' },
    { icon: 'facebook', label: 'Facebook', href: 'https://facebook.com/' },
    { icon: 'instagram', label: 'Instagram', href: 'https://instagram.com/' },
    { icon: 'youtube', label: 'YouTube', href: 'https://youtube.com/' },
    { icon: 'tiktok', label: 'TikTok', href: 'https://tiktok.com/' },
  ],
};

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/live', label: 'Live' },
  { href: '/music', label: 'Music' },
  { href: '/videos', label: 'Videos' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/book', label: 'Book The Band', cta: true },
];

// Home page slider: one entry per slide, shown in order. `position` sets which part of
// the image stays in view when it is cropped (CSS object-position).
// eyebrow: 'next-gig' shows "Next stop: <city>, <date>" with a pin, from the next gig in gigs.json.
// PLACEHOLDER IMAGES: slide-1 to slide-4 are Fontaines D.C. artwork, used only to preview
// the layout locally. Replace with the band's own photos before the site goes live.
export const slides = [
  {
    image: '/photos/hero/slide-1-no-text.jpg',
    position: 'center',
    eyebrow: 'next-gig',
    title: site.bandName,
    actions: [
      { label: 'Live dates', href: '/live', primary: true },
      { label: 'Book the band', href: '/book' },
    ],
  },
  {
    image: '/photos/hero/slide-2-no-text.jpg',
    position: '35% center',
    eyebrow: 'On tour',
    title: 'Live dates',
    actions: [{ label: 'See all dates', href: '/live', primary: true }],
  },
  {
    image: '/photos/hero/slide-3-no-text.jpg',
    position: '30% center',
    eyebrow: 'Music',
    title: 'The set',
    actions: [
      { label: 'See the set', href: '/music', primary: true },
      { label: 'Watch videos', href: '/videos' },
    ],
  },
  {
    image: '/photos/hero/slide-4.jpg',
    position: 'center',
    eyebrow: 'Bookings',
    title: 'Book the band',
    actions: [{ label: 'Book the band', href: '/book', primary: true }],
  },
];
