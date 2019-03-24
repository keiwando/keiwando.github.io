---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: issues
order: 5
title: Why is the simulation so laggy?
---

Chances are your creature design has lots of body parts, the number of creatures per generation is too high and/or your hardware isn‘t good enough. Your custom neural network might be too large as well. 

The amount of lag you experience is mostly related to the number of body parts that have to be simulated at once. So whether you have many simple creatures or a few highly complex ones isn‘t going to make that much of a difference in terms of performance. 

There is unfortunately not much I can do about this either (read the explanation below if you want to know why). 

That being said, you do have the option to trade simulation time for performance with the „simulate in batches“ setting. Instead of simulating your entire population of complex creatures at once, you can simulate them in smaller groups (batches) - even one at a time if you want to. They will still all count towards the same generation, so the overall simulation progress will obviously be slower, but given the circumstances, this is the best option you have. 

Now for a slightly more technical answer for anyone who‘s interested. 

The simulator is written in Unity and uses Unity‘s physics system for all of its physics calculations. All of the body parts have dynamic Rigidbody components that are controller by this physics system.

Profiling the simulation clearly shows me that almost anytime there is lag, it happens because the physics system was unable to finish all of its computations in the last frame, which then again leaves even less time for the physics computations in the next frame etc. The load on the physics system is directly and mainly related to the number of rigidbodies in the scene. 

Having a large neural network can also affect the performance, since none of those computations are hardware accelerated, but its usually less of an issue as compared to the rigidbody count. 