---
layout: post
img: img/neuralnetwork.gif
name: FlappyBird AI
modalID: flappybirdAI
headertext: FlappyBird AI
shortdescription: Building an AI to learn to play an iPhone game
---

The picture above shows the 'brain' (read: Neural Network) of a bird that I designed and how it chooses when to flap to complete an obstacle course. 

![ai-learning][birdfitimg]{:class="img-responsive"}

The picture above shows the learning process. By randomly creating a bunch of different brains, having them complete the course, and then creating a new generation based off the birds that went the farthest we can 'evolve' a smarter bird to be better at the game.

### Development
The point of this project was to make a computer learn how to play a game, effectively. I was able to develop a neural network using C++ that evolved using a genetic algorithm. The 'fittest' birds will reproduce the most, and these are the ones that jump through the most obstacles. The brain works by feeding in several inputs (seen above) and the neural network produces an output which will tell the bird to flap or not. After some experimentation I found one layer of six nodes worked best on creating a bird that was quick to learn.

### An explanation of neural networks and genetic algorithms
In a simple manner, neural networks are a way of approximating how neurons function in your brain. Each neuron adds the values of the neurons before it based on a given weight, The last neuron is the output neuron, indicating when the bird should flap. So in short, each neuron's weight is how much the brain cares about that specific input, (so speed, distance to obstacle top, etc.) which allows the brain to make complex actions. 

These weights are modified after all the birds have failed. The one that moved the farthest is the most likely to reproduce. This process follows the biological process in nature. Two bird brains are chosen, and they have a chance where their 'chromosomes', which are their associated weights in the network, are crossed over to form a child. This child also has a chance to have a slight mutation, which will slightly change a weight.

[Get the Source Code](http://www.google.com){: .btn .btn-primary}

[birdfitimg]: img/learningai.gif "Fit Birds"