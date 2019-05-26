---
redirect_from: 
  - /evolution/legacy/
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: issues
order: -1
title: I updated Evolution and my old simulations behave differently
---

The 3.0 update of Evolution includes Unity's physics system changes. Unfortunately, this also means that creatures that have been trained in previous versions of Evolution will most likely behave differently when played back after the update.

### What does the physics system have to do with creature behaviour?

When the creatures try to find an optimal movement strategy, they do so in the context of the physics world that they're in. 

The simulation saves have to assume that this physics world never changes and can only save the movement strategy of each creature. Because of this, if we now change the physics, the same movement strategy can have a completely different outcome.

Think about what it's like when you have to walk on ice. Walking normally can easily cause you to slip and not make it very far. You have to change the way you walk, slow down and adjust your center of gravity in order to increase your chances of success. 

The same thing applies to the creatures in this simulator. Previously simulated creatures will most likely not perform as well, because they are not used to the new physics environment. This is why you might see huge drops in fitness and inaccurate playback of the "Best of Gen." creatures.

### Is there a way to accurately play back my old simulation saves?

Yes, but not with the latest version of Evolution. Unity's physics implementation details are out of my control, so there's not much I can do there.

However, I did create a special browser-based playback version of Evolution with the old Unity physics, which you can find [here](https://keiwan.itch.io/evolution-legacy-playback). Thanks to the new import & export feature you can export your old simulation saves and upload them to this legacy playback version.

<b>Things to keep in mind</b>

1. The [limitations]({{site.baseUrl}}/evolution/faq/out-of-memory/) of the regular browser version apply.
2. If the file upload to the playback version fails, just try again. It sometimes takes a couple of attempts before it works. No idea why.

Fortunately, Unity's physics changes did not only have downsides. They also allowed me to significantly improve the determinism of the simulation, which I think makes up for the annoyance of losing backwards compatibility with this update. 


<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr" styles="margin: 0 auto;">Unfortunately, it seems like the changes in <a href="https://twitter.com/unity3d?ref_src=twsrc%5Etfw">@unity3d</a>&#39;s physics system are severe enough to break existing creature behaviour, meaning that I can&#39;t guarantee that current simulation saves will work with the upcoming Evolution update. I&#39;ll figure out an alternative for old saves. <a href="https://t.co/RXJxpr96dC">pic.twitter.com/RXJxpr96dC</a></p>&mdash; Keiwan (@keiwando) <a href="https://twitter.com/keiwando/status/1122929085158707201?ref_src=twsrc%5Etfw">April 29, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

