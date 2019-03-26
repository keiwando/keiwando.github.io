---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: mechanics
order: 0
title: What is an Evolutionary Algorithm?
---

An evolutionary algorithm is a type of machine learning algorithm that is inspired by the biological evolution process. 

The goal of machine learning algorithms in general is to find an optimal solution to some optimization problem. In the case of this simulator, the goal is given by the task that you have chosen for your creature (e.g. „run as fast as possible“). 

The better a creature is at this given task, the higher its fitness score will be. This fitness score is what is being optimized here. The algorithm tries to find a creature behaviour that generates the highest possible fitness score.

Evolutionary algorithms try to find such optimal solutions through the process of trial and error. They repeatedly try out a bunch of solution candidates, evaluate them and then generate a new set of possible solutions based on that evaluation. (A „solution“ in this article corresponds to a single creature‘s behaviour, which is defined by its brain / neural network weights)

Here is the general outline of an evolutionary algorithm: 

1. Create a random set of initial solutions (a population)

    *-- Repeat steps 2. - 5. --*

2. **Evaluate** each solution based on how well it solves the problem
3. **Select** the parent solutions that get to pass on their traits to the next generation
4. Create a new set of solutions for the next iteration by **recombining** parent solutions 
5. Add random changes (**mutation**) to some of the new solutions

The mutations in step 5 aim to decrease the chances of the algorithm getting stuck in a so-called local optimum. A local optimum of the fitness function is given by the fitness of a solution that will get worse if you slightly change it in any way. The problem here is that such a (local) solution is not necessarily the *global* solution that you are really looking for. 

Adding such a completely random factor into each generation can be enough to result in new solutions that are different enough from a local solution that they might be able to sway the population away from getting stuck in that local optimum.