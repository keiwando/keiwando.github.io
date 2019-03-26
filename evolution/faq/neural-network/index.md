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

That was a pretty dry explanation, so let's look at some more concrete examples.

Each neuron is its own small processing unit. It takes some numbers as inputs, performs some computation and then spits out the resulting number. A simple example would be a neuron that takes two numbers and simply adds them up. We can write this neuron as the following function:

    f(x, y) = x + y

A different type of neuron might return `1` if the sum of its inputs are larger than some threshold `b` and return `0` otherwise:

    f_b(x, y):
      if x + y > b:
        return 1
      else 
        return 0