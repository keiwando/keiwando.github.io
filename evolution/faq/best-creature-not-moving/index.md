---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: issues
order: 9
title: The “Best Creature” is not being selected correctly (It just sits there and doesn’t move)
---

It *is* being selected correctly. I have spent a significant time testing and monitoring that the creature in the "Best of Gen X“ screen always has exactly the same brain as the best-performing creature of the previous simulation run, and it does. 

There is a known bug that causes the best creature of the previous generation to just sit there and barely move, which obviously makes it look like the wrong creature was picked. But it‘s the exact same creature with the same brain that it had when it was performing really well. 

The fitness is being evaluated correctly and the best creature is also picked correctly, which is why the actual simulation itself still continues to work even after you begin experiencing this bug.

This unfortunately means that it‘s really difficult to figure out what is actually causing the issue and at the time of writing this, I have absolutely no idea what it is.

It‘s like taking your well-trained dog to a competition but it refuses to do any of the tricks it knows and you have no idea what‘s going on inside of its head. 

The bug has already been discussed [here](https://itch.io/t/150983/somthing-seems-off-in-the-pick-best-creature-algorithm-bug-maybe). If you have an idea for how to fix it or you have found out how to consistently reproduce it, please let me know. 