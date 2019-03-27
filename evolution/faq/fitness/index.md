---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: mechanics
order: 2
title: What does "fitness" mean?
---

In the context of evolutionary algorithms "fitness“ is a measurement for how well a single solution solves the given problem. Evolutionary algorithms aim to find a solution with the optimal fitness. 

Applying this to our simulator here, the fitness of each creature is a number that represents how well it was able to perform the selected task during its simulation run. You might be wondering why it‘s a percentage and what 100% fitness is based on. 

To answer the second question first, it‘s quite arbitrary. Using the running task as an example, I decided on a distance that I thought would be quite difficult for most creatures to reach in the default simulation time. This distance is scaled by the simulation time per generation, so giving the creatures twice as much time means that they will also have to get twice as far for the same fitness score. 

The fitness score is then simply the percentage of that distance that the creature was able to travel in the given time. 

Calculating the performance of the creature as a single number in this way makes it easy to compare different individuals. The optimization problem becomes one-dimensional. 

The fitness is then used to determine which creatures to select for reproduction. Creatures with a higher fitness score have a higher chance of being selected as parents for reproduction and since the same creature can also be selected multiple times, the fitness score of a creature effectively contributes to the number of offspring that will carry part of the genetic information of this parent creature into the next generation.