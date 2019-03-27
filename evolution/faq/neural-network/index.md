---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: mechanics
order: 1
title: What is a Neural Network?
---

We are really talking about Artificial Neural Networks (ANNs) here, but for the sake of simplicity I'm just going to refer to them as Neural Networks.

Neural Networks are conceptually a system of interconnected nodes (**neurons**) which can process data by taking some inputs and generating outputs. They are based on the abstract structure of neurons in a biological brain.

That was a pretty dry explanation, so let's look at some more concrete examples: 

<sub><sup>(I've used a mix of pseudocode and mathematical notation below - don't get hung up on the details of this notation)</sup></sub>

Each neuron is its own small processing unit. It takes some numbers as inputs, performs some computation and then spits out the resulting number. A simple example would be a neuron that takes two numbers and simply adds them up. We can write this neuron as the following function:

    f(x, y) = x + y

A different type of neuron might return `1` if the sum of its inputs are larger than some constant threshold `b` and return `0` otherwise:

    f(x, y):
      if x + y > b:
        return 1
      else 
        return 0

We might not want our neuron to see all of its inputs as equally important when computing its output. For this, we can use weights (`w1, w2`) to signify the importance of each input:

    f(x, y):
      if (w1 * x + w2 * y) > b:
        return 1
      else 
        return 0

This concept of weights is very important. When you hear someone say that a neural network is being trained, it usually means that the network weights are being optimized so that the network ends up computing its outputs in some specific way.
        
Now, a single neuron like this is fairly limited in what it can do and how useful it can be to us. But what if we take the output value of this neuron and feed it into another neuron as one of the inputs? That's when things start to get interesting (and also potentially complicated). 

Mathematically speaking, we are just plugging functions into each other. Say we have three neurons represented by the functions `f, g` and `h` which each take two parameters and return one output number. A simple network `n` could then look like this:

    n(x, y) = h(f(x, y), g(x, y))

What is happening here? Well, our network is just a function that takes two inputs and calculates one output. Internally, all it does is first, give both of its inputs to the functions `f` and `g` and then take those two outputs and use them as inputs for `h`. 

You can imagine `f` and `g` as the first layer of this network and `h` as the second layer. 

You can extend this idea however far you want. Adding inputs, adding layers, routing outputs back to previous layers etc. Since this is just supposed to be a quick overview and introduction to the concept of neural networks I didn't go into a lot of detail or even mention things such as activation functions or backpropagation. There are plenty of resources available if you are truly interested and want to find out more about these concepts.

In "Evolution”, all neurons work the same way and all creatures of the same simulation will have the same network structure, so the only thing that differentiates two networks (brains) are the weights. A creature's movement behaviour is fully determined by its network weights. The network takes a set of inputs (e.g. the current position, height, velocity...) and calculates outputs that determine how far each muscle should be expanded or contracted at any point in time.

The evolutionary algorithm then tries to optimize these weights over the course of multiple generations, by trying out different weight combinations and evaluating which ones work best. The goal is to end up with a set of weights that makes the creature control its muscles in a way that allows it to reach a high fitness score.


