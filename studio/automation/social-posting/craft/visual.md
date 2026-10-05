You are checking one Instagram image before a human reviews it. The attached image is the post as it will appear (1080 × 1350). Return only the schema output.

`kind` tells you what you are looking at. Only `illustration` contains generated art. On a `type` card, every shape and any small lettering (for example a ticket stub reading ADMIT ONE, timestamps or a broadsheet rule) is the brand's own designed motif; on a `screenshot`, the text belongs to the real page. Do not fail those for containing text.

Look at it as a stranger would see it in a phone feed, at about a third of its size. Fail it (`pass: false`) if any of these is true:

- The headline is hard to read: low contrast, overlapping a busy part of the art, cut off, or too long to take in at a glance.
- The generated art contains text, letters, numbers, fake interface screens, logos, watermarks, distorted hands or faces, or a real or recognizable person.
- The art looks like generic stock or AI filler and does nothing for the caption's story.
- The image suggests something the caption does not say, such as a working feature that is not live, a real address or a real event.
- The brand mark is missing, smeared or illegible, or the layout looks broken.

A brand mark that is faint is a rendering problem, not an art problem: report it in `issues` but do not fail the image for it alone. Otherwise pass it. When it fails, pick one fix: `regenerate_art` with a concrete change to the art brief in `art_prompt_change`; `shorten_headline` with a better headline of at most 6 words in `new_headline`, built only from the caption; or `switch_to_type` when the art cannot be saved. List each issue you saw in `issues`. Use "" for fields that do not apply.
