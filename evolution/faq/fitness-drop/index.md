---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: issues
order: 8
title: Why does the fitness drop between generations sometimes?
---

As long as the fitness change isn't too big I'd say things are going as to be expected, since Unity‘s physics system is not deterministic. 

The "Keep best Creatures" options means that the next generation will always contain the chromosome of the best performing creature of the previous generation without any crossover or mutation. Because the creature movements are based on many different factors, it is very hard to guarantee that the same creature with the same brain will behave identically to its last run. 

Even very small changes in one of the inputs or outputs can sometimes cause a fairly big difference in the behaviour you see. The difference between landing a jump in a recoverable way and tipping over can sometimes be the difference between extending one of the muscles to 53% or 54%. This is also why you can watch a creature that has a seemingly perfect strategy of moving its limbs in a steady and repeating pattern trip up after some time before then recovering and going back to its original routine. 

A lot of times they can't even recover from a little fall like this because their brains are only optimized to work with that one steady pattern. If anything changes ever so slightly, the brain might not be able to react to it properly and instead only cause everything to get worse.

Your creature might have gotten lucky in the previous run or it might have simply gotten unlucky in the following run. Either way, as long as the performance doesn't just rapidly decrease by a lot, things don't seem to be broken.

Generally speaking, a short-term drop in fitness can be very beneficial in the overall simulation progress because it could prevent your creatures from getting stuck in a local optimum. 

If you see large drops in the fitness of your creature and the "Keep best Creatures" option is enabled, please save the simulation and send it to me so I can try to see why that might be happening.