# Reference captions

These show the register we want. Each is built only from facts in a real merged change, listed under it. They teach voice and structure. Never reuse their facts, numbers or wording in a new post: a new post uses only its own evidence.

## 1. The promise the app couldn't keep (subcult, Subcult OS)

> "Check your email" is a promise. Subcult OS was making it without knowing.
>
> Ask for a password reset and the app told you the link was on its way. It had no idea. The server only knows it took the request.
>
> So now it says what it actually knows: we got your request, look for a link.
>
> Subcult OS is the software we're building for running free shows: the list, the door, close-out. Still in development.

Evidence: the recovery notice said a link had been sent; the API provides no delivery confirmation; both notices now leave delivery unconfirmed.

Why it works: the first line names a familiar phrase and makes it strange. The story is one small honesty fix, told from the reader's side. The product line comes after the reader cares. Maturity is three words at the end.

## 2. A race I wrote (patrick, Undertow)

> Open a new project while the last one is still saving, and Undertow could quietly send your next edits into the old one.
>
> That's a race I wrote. Saves now finish in order, and a late reply from a project you've closed gets ignored.
>
> Undertow turns a track into a visualizer video in your browser. This fix isn't on the live editor yet.

Evidence: an autosave finishing after another project opened could redirect edits into the old project; autosaves are now serialized and results from previously opened documents are ignored.

Why it works: second person puts the reader in the moment of the bug. "That's a race I wrote" is Patrick owning it in five words. One mechanism sentence, in plain words.

## 3. Same instant, two labels (subcult, Subcult OS)

> A show in Tokyo and a show in Chicago could both say 3:00 PM. Same instant, two labels, one of them wrong.
>
> Event times now use the event's own time zone. 3:00 PM in Chicago reads 5:00 AM the next day in Tokyo, and every card shows its offset.
>
> Run sheets live and die by the clock. Subcult OS is in development.

Evidence: the same instant displayed 3:00 PM with both Chicago and Tokyo labels; it now shows Chicago 3:00 PM and Tokyo 5:00 AM the next day; cards include the offset.

Why it works: the exact numbers are the hook. The fix is shown, not described. "Run sheets live and die by the clock" carries the product's run-sheet register without claiming anything.

## 4. 3,400 pixels (subcult, Subcult OS)

> A long enough event name could push the Close button 3,400 pixels to the right. On a phone screen 360 pixels wide.
>
> Names and locations wrap now, and the Close button keeps its place beside the heading. You can still read the whole name by scrolling.
>
> Small venues have long show titles. Subcult OS is in development.

Evidence: long unbroken names expanded a 360px view and pushed the Close button beyond x=3400; text now wraps and the heading shrinks beside a non-shrinking Close control.

Why it works: an absurd, exact number from the evidence does all the work. The ending is a dry aside that is true by observation, not a moral.

## 5. Before and after the same caption

Before (changelog): "We're working on how Patchwork shows the neighborhood. The revised home replaces an explainer card with an excerpt of nearby places and open requests when any exist. These interface changes are merged, with a live check still due."

After: "Open Patchwork and the first thing you should see is your neighbors, not a card explaining the idea. The home page now leads with nearby places and open requests. It's still a demo, so please don't arrange real help through it yet. Requests show approximate areas; only approved public resources show an address."

What changed: the reader's experience replaced the diff; review words disappeared; the demo warning and location rule stayed, in plain words.
