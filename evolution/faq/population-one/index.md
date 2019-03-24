---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: issues
order: 3
title: Why can’t I set the population size to 1?
---

A population size of one isn‘t possible since that would prevent the creatures to generate any offspring through recombination. 

You need two parent creatures to recombine into two new offspring. A single creature could only use random mutation in order to introduce variation over time into its behaviour, which is significantly slower than variation through recombination (in addition to mutation). 

You will generally experience faster learning rates the larger your population size is, so you should really set is as high as possible until just before you start experiencing lag. 

If you don‘t want to see all simulating creatures at once, simply use the „Show one at a time“ option. 
If your hardware is too slow and can‘t handle simulating multiple creatures at once, simulate them in batches (e.g. of size 1)