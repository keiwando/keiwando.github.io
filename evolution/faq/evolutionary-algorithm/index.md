---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: mechanics
order: 0
title: What is an Evolutionary Algorithm?
---

An evolutionary algorithm is a type of algorithm used in the context of machine learning that is inspired by the biological evolution process. 

Machine learning algorithms in general have the goal of finding an optimal solution to an optimization problem. In the case of this simulator, the goal is given by the task you have chosen for your creature (e.g. „run as fast as possible“)

Evolutionary algorithms try to find such an optimal solution by repeatedly trying out a bunch of possible solutions, evaluating them and then generating a new set of possible solutions based on that evaluation. (A „solution“ in this article corresponds to a single creature‘s behaviour, which is defined by its brain / neural network weights)

Let‘s go over these steps in a little more detail: 

1. Create a random set of initial solutions (a population)
Repeat steps 2. - 4.
2. Evaluation
3. Recombination
4. Variation

Step 1
