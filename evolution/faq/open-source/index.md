---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: general
order: 0
title: Is this project Open-Source?
---

This question is usually accompanied by the question of „Can I help with the development?“, so I‘ll be answering both below. 

The project is not published under any open-source license, so it‘s not technically open source. 

However, the entire source code is available on my [GitHub](github.com/keiwando/evolution).

What you can do with this code:
* Look through it
* Clone/Fork the repository and experiment and play around with the code yourself
* Use or modify it for educational purposes

What you cannot do:
* Relicense the code
* Sell or otherwise redistribute a build of the software

If you have a use case for the code that is not listed here and you are unsure whether or not you can use it, feel free to contact me and just [ask](http://www.keiwando.com/contact)

Let‘s now get to the question of „Can I help with the development?“ in case you were wondering that too. I get asked this quite frequently and it takes a little bit of an explanation. 

The short answer is no. Here‘s why:

The main reason why I’m generally not looking for contributors on the main project is that it’s unfortunately extremely easy to accidentally break backwards compatibility of previously saved simulations. I want to stress that this especially also applies to myself.

It has already happened a few times that I made some small, seemingly unimportant code changes and then days later realized that some (not all) of the previous save files didn’t work anymore because the creatures were behaving differently all of a sudden. These things are a nightmare to track down and they take a lot of time. However, there are also a lot of instances in which I know not to change something because I am aware of its not so obvious impact (which sometimes is stuff that doesn’t really make sense but I’ve experienced it break something else so I just remember not to do it).

I can barely trust myself with not accidentally altering creature behaviour so I can definitely not expect that anyone else would be able to do so. If I wanted to merge any of your code back into the main project, then for one, you would have to spend a ton of time worrying about all of these annoying backwards compatibility issues and spend a significant amount of time testing each change, and at the same time I would also have to spend a lot more time testing each commited change individually, which just ends up being a waste of time for both of us, and there might still be bugs sliding through because of potentially altered project/physics settings that I missed…

It is going to be a lot easier for both of us if you don’t have to worry about backwards compatibility (or anything similar) at all, so you would be free to alter the code in any way you like, add whatever you like, remove whatever you don’t like. Then, if you implement a feature that you would like to see in the main project, I can clone your repository, look at the feature and if I think it’s going to work out, reimplement it from scratch, while at the same time worrying about all of the issues listed above.

There are a few other people also experimenting with the code and I’ve told all of them the same thing. It just saves a ton of time if I’m the only person who has to worry about breaking stuff.
