---
layout: evolution-faq
faq: evolution
question: How do the muscles work?
---

# How do the muscles work?

A muscle in Evolution connects two bones. The same two bones can only be directly connected with one muscle.

One such muscle in this simulator acts as a pair of biological muscles - it can both contract and expand. While doing so it applies forces to the bones at the respective connection points, which allows the creature to move. 

These muscles also behave like springs, so unless they are expanding or contracting, they will try to go back to their original length. 

The current muscle expansion or contraction is controlled by the creature‘s brain / neural network. At each time step the network calculates one output value per muscle, which is used to determine the new muscle state. This is all the control that the creature has over its body.  During the evolutionary process the creatures now need to learn when and how to use which combination of muscles in what way (expand or contract) and how much.