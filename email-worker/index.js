// Cloudflare Email Worker for bookings@fontainestributeband.com.
// A routing rule can only forward to one address, so this sends each message to every inbox
// below. Each address must be verified under Email Routing > Destination addresses first.
//
//   npx --yes wrangler deploy --config email-worker/wrangler.toml
//
// Then point the bookings@ routing rule at this Worker ("Send to a Worker").
const INBOXES = [
  'lee.bulfield@live.co.uk',
  'fontainestributeband@hotmail.com',
];

export default {
  async email(message) {
    await Promise.all(INBOXES.map((to) => message.forward(to)));
  },
};
