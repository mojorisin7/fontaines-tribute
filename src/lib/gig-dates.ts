// Runs in the visitor's browser: shows the gigs that are upcoming or past *today*, so the site
// stays right between rebuilds. Pages contain every gig, each marked with data-date; this hides or
// shows them. The build already applied the same rules for the build date, so without JavaScript
// the page is simply as of the last build.
//
//   [data-gig-list="upcoming"|"past"]  a list of li[data-date] rows; optional data-limit;
//                                      an li.gig-empty is shown when no rows are visible, and an
//                                      enclosing [data-gig-section] is hidden instead if present
//   [data-next-group]                  shows only its first [data-date] child that is today or later
//                                      (and hides itself if there is none)
//   .ticker[data-limit]                spans with data-date and data-copy: next N per copy

const now = new Date();
const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, '0')).join('-');
const upcoming = (el: HTMLElement) => (el.dataset.date ?? '') >= today;

for (const list of document.querySelectorAll<HTMLElement>('[data-gig-list]')) {
  const wantUpcoming = list.dataset.gigList === 'upcoming';
  const limit = Number(list.dataset.limit) || Infinity;
  let shown = 0;
  for (const row of list.querySelectorAll<HTMLElement>('li[data-date]')) {
    const show = upcoming(row) === wantUpcoming && shown < limit;
    row.hidden = !show;
    if (show) shown++;
  }
  const section = list.closest<HTMLElement>('[data-gig-section]');
  if (section) section.hidden = shown === 0;
  const empty = list.querySelector<HTMLElement>('.gig-empty');
  if (empty) empty.hidden = shown > 0;
}

for (const group of document.querySelectorAll<HTMLElement>('[data-next-group]')) {
  const items = [...group.querySelectorAll<HTMLElement>('[data-date]')];
  const next = items.find(upcoming);
  items.forEach((el) => (el.hidden = el !== next));
  group.hidden = !next;
}

for (const ticker of document.querySelectorAll<HTMLElement>('.ticker[data-limit]')) {
  const limit = Number(ticker.dataset.limit) || Infinity;
  const perCopy = new Map<string, number>();
  let any = false;
  for (const span of ticker.querySelectorAll<HTMLElement>('span[data-date]')) {
    const copy = span.dataset.copy ?? '0';
    const count = perCopy.get(copy) ?? 0;
    const show = upcoming(span) && count < limit;
    span.hidden = !show;
    if (show) { perCopy.set(copy, count + 1); any = true; }
  }
  ticker.hidden = !any;
}

export { today };
