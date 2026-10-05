# Reference edition

This shows the register for the development log and its Patreon edition. It uses only facts from four real merged changes, listed at the end. Copy its moves, never its facts or wording: a new edition uses only its own evidence.

## Website

**Title:** The app that promised an email it couldn't see

> "Check your email" is a promise. For a while, Subcult OS made it without knowing whether it could keep it.
>
> This week's fixes are all small versions of that: the software saying something it hadn't checked, or a screen doing something you didn't ask for.
>
> ## The link that was "on its way"
>
> Ask Subcult OS for a password reset and it told you the link had been sent. The server only knows it accepted the request; it gets no word on delivery. So the notice now says what it knows: we got your request, look for a link.
>
> ## 3:00 PM in two cities at once
>
> A show in Tokyo and a show in Chicago could both read 3:00 PM, same instant, two labels. Event times now use the event's own time zone, so 3:00 PM in Chicago reads 5:00 AM the next day in Tokyo, and every card shows its offset.
>
> ## A Close button 3,400 pixels away
>
> A long enough event name stretched a 360-pixel phone view until the Close button sat past pixel 3,400. Names and locations wrap now, and Close keeps its place beside the heading.
>
> ## Your edits, in the project you're looking at
>
> In Undertow, opening a new project while the last one was still saving could send your next edits into the old one. Saves now finish in order, and a late reply from a closed project is ignored.
>
> Subcult OS is still in development, and none of this is on the live sites yet. Undertow's editor is public at undertow.subcult.tv.

## Patreon

**Same title.**

> The password-reset notice is the change I'd point to if you asked what this week was about.
>
> Subcult OS used to tell you the link was on its way. It's a nice thing to hear, and the app couldn't know it: the server knows it accepted the request and nothing after that. If the email never comes, the app was the one that promised. So the notice now says only what the server knows.
>
> The time-zone fix came from the same place. A listing showed one instant as 3:00 PM with both a Chicago and a Tokyo label, and one of them was simply wrong. Now each event keeps its own zone and shows its offset, so the card says exactly one thing.
>
> The Close button that ended up 3,400 pixels to the right was less philosophical. Long show names are real, and the layout trusted them to be short.
>
> On Undertow, I fixed an autosave race that could put your edits in the project you'd just left. Autosave is supposed to be the part you never think about.
>
> None of this is live yet. Thank you for keeping the lights on while we fix things nobody will notice when they work.

Evidence used: the recovery notice claimed a link was sent though the API gives no delivery confirmation; event-zone clocks (3:00 PM Chicago vs 5:00 AM Tokyo, offset on cards); long names pushed Close beyond x=3400 in a 360px view; Undertow autosaves serialized and stale results ignored.

What to copy: an opening that makes a familiar thing strange; a thread named once and early; headings that say something; one concrete detail per change; product description folded into the close; the Patreon edition written as a letter that explains one decision in depth and covers the rest briefly. The Patreon thank-you is allowed because it promises nothing.
