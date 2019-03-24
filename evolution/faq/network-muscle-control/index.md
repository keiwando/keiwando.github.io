---
layout: evolution/evolution-faq-page
faq: evolution
published: true
category: mechanics
order: 5
title: How does the Neural Network control the muscles?
---

The neural network computes one output number for each muscle (e.g. 10 muscles = 10 outputs). This computation happens at a fixed time interval 30 times per second. The output generated for each muscle is a floating point number between -1 and 1. 

The sign of the output determines whether or not the muscle should expand or contract and the magnitude determines the amount of force to apply in the respective direction or expansion/contraction. 