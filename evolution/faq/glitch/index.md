---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: issues
order: 6
title: I connected two unconnected bones with a muscle and got 100% fitness. Do I win?
---

No. Well, maybe.

The entire point of this simulator is to allow you to observe the process of machine learning; to see the incremental improvements of your creatures one iteration at a time, to learn how evolutionary algorithms work. This isn‘t really a „game“ and there are no achievements for reaching 100% fitness for a reason. 

Finding a way to cheat the system that immediately gets all of your creatures to reach 100% fitness without actually having to learn anything, thus defeats the entire point of the simulation. 

It makes that creature, at least in my opinion, one of the most boring designs to watch. You already know what‘s going to happen, all of your creatures will eventually behave the same way, you can usually barely even tell what‘s happening on screen and all you end up with is that one number saying „100% fitness“. 

Now, there is still something important to take away from these „cheating“ creatures and if that‘s what you learn from them, then I guess you do win (in an educational sense). 

When we try to train these creatures to accomplish a task - let‘s take running as an example - we obviously don‘t want them to just explode and use that to propel themselves forward, reaching the maximum fitness almost instantly. As written above, this is actually pretty boring to watch. We want to see them learn how to control their own muscles and maybe even end up with a gait that reminds us of that of a real animal.

But then why does this not happen? Aren‘t we telling the creatures to learn how to walk/run? 
No, we actually aren‘t. All that we‘re telling them is to try to move the center of their body as far to the right as possible within the given time and with the given physical constraints on their body. If we don‘t force all of their body parts to be connected and we don‘t add a maximum muscle length, then they will very quickly realise that exploiting these facts is the fastest way for them to reach a high fitness score. Their behaviour doesn‘t fit our expectation of a natural walk, but that‘s because we never properly asked for ‚natural‘ gaits only. 

This is something that happens quite frequently in reinforcement learning. *Find Mario ai reference* ...

Now, neither the creatures in my simulator nor the AI playing Mario cheating have any real-world consequences. But it is not hard to see that a more powerful AI could very easily cause a lot of damage this way. It figures out an exploit to the reward function - one that we simply didn‘t consider while creating this reward function - and if we are unlucky, the exploit includes causing harm to us humans or the planet. 

The question of how to prevent AI agents from what we would consider „cheating“ is one of many big questions in the field of AI safety. This is not the place for me to go into more depth than this and there is a lot of reading material on these topics that you can find if you‘re really interested. 

I hope this gave you at least a little bit to think about while watching those „broken“ creatures fly across the screen.

Continue reading to find out why I don‘t just add a maximum length to tue muscles in order to prevent this. 