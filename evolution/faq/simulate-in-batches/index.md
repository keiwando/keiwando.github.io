---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: mechanics
order: 7
title: What does the "Simulate in Batches" option do?
---

Instead of simulating all of the creatures of one generation at once, you have the option to simulate them in smaller batches. This will be easier on the CPU but it will also take a longer amount of time to finish simulating each generation. 

Here‘s an example: You designed a complicated creature with many body parts and a large brain. You know that a larger population size means more variation and therefore generally faster and better simulation results, so you set the population size to 100. However, after starting the simulation you quickly realise that your device is not able to handle simulating 100 creatures at once - everything starts lagging and slowing down. 

Here‘s where the „Simulate in batches“ option comes in handy. You can simply go into the settings (or the pause screen), enable this option and set a batch size of e.g. 10. Now, your device only has to simulate 10 creatures at once, which it can handle just fine, without you losing the benefit of still having a large population size. 

However, this also means that - lets say you went with the default 10s per generation - simulating a single generation now takes 10 • 10s = 100s. You have essentially traded simulation time for performance. 