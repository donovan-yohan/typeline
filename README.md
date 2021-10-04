# typeline Typing Test

An animated typing test focused on improving and encouraging consistency, and using seeded rng to generate tests so test takers can share and compare test results easily with friends.


## Live Version

Visit [typeline.donovanyohan.com](https://typeline.donovanyohan.com/) on any laptop or desktop!

https://user-images.githubusercontent.com/34756395/135842072-b63c5300-d72e-4581-b6a5-dc09674a2764.mp4


## Word Generation

The default test uses the short words from the [n-gram frequency analysis of the Google's Trillion Word Corpus](https://github.com/first20hours/google-10000-english). A nice feature of this was the list being already ordered by frequency of use.


## Score Calculation

Given one of the goals of this test was to promote consistency and flow of typing over just speed, the core word per minute (WPM) score penalizes users for making mistakes and ignoring them, according to the following formula:

```
[correct - (errors - corrected)] / test time
```

There are also more traditional measures of what I call "raw WPM" to measure total inputs in the test time, and just correct keystrokes using these formulas:
```
correct / test time
```
```
(correct + incorrect) / test time
```

## Seeded RNG

The tests are generated using [seed-random](https://www.npmjs.com/package/seed-random) and a custom formatted URL hash for ease of sharing and generating tests. The contents of this hash determine what kind of test is generated. Test takers can share the exact test they took with others easily to more directly compare performance, and have fun putting anything they want to in the code to generate a test.

Visiting the root site or typing in an invalid character into the seed will just automatically generate and format an appropriate one.

The URL will always follow the format `typeline.donovanyohan.com/#/seed/time`
where `seed` uniquely identifies the same test every time
and `time` is a value between 1 and 120 for the duration of the test

Including any of the following in the `seed` part of the `/#/seed/time` URL will have the following effects:
| Name | Character Triggers | Effect | Example Seed | 
| --- | --- | --- | --- |
| Capitals | CAPITALS | will add capital letters | `/#/Abcd/30` |
| Numbers | 1234567890 | will add numbers like '3rd', '2015', '400BC' | `/#/abcd123/15` |
| Punctuation | .,;:!?"" | will add those punctuation | `/#/ab.cd/60` |
| Symbols | &()$%-_ | will add those symbols | `/#/efg-hij/60` | 
| Long Words | Seed of length 10 or longer | will add from the most frequently used long words | `/#/thisIsAReallyLongSeed/60` |  


## Why is this hosted out of a personal domain?

![Screenshot 2021-09-29 195436](https://user-images.githubusercontent.com/34756395/135837789-a03fca56-75ee-4fce-9dd0-b85699af2285.png)
unlucky

