---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: issues
order: 2
title: My creatures aren’t learning anything
---

Not every simulation run is guaranteed to be successful. There are too many random variables involved in the nature of an evolutionary algorithm for such a guarantee to exist. 

There can be many reasons for why your simulation was unsuccessful. Here are a couple of steps that can lead to better results:

* Restart the simulation. Sometimes you just get unlucky with the randomly generated initial set of behaviours. Restarting is the easiest way to mix things up and likely end up with a better initial population. 
* Don‘t make your creatures too heavy. Each body part adds a significant amount of weight to your creature, which makes a harder for the muscles to move. Avoiding unnecessary body parts also has a noticeably positive impact on performance. 
* Start simple. The more muscles you blindly add to a creature, the more likely their effects are to cancel each other out, especially during the first couple of highly random generations. Once you have made a couple of simple - but working - creatures, you can use that knowledge to gradually make them more complex. 
* Triangles are rigid structures. Use that to your advantage if you want parts of your body design to not bend and distort. But also, don‘t add muscles inside of a triangle of bones. They can‘t do anything and are just wasting computational resources. 
* You can only add one muscles between the same two bones. Dragging multiple muscles onto the same connection doesn‘t make those muscles more powerful. If you need more force between two areas of the body, you‘ll need to change your design.
* Get inspiration from other people’s designs. [keiwando.com/evolution/gifs](../../gifs) is a collection of a couple of my favourite ones. 