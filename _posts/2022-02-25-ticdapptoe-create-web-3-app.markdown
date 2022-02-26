---
layout: post
title: TicDappToe - Create a Web 3 Dapp with WSL
author: Craig Loewen
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/lagpgqM-Ieg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

This video shows how to create a Web 3 dapp (decentralized app) using the Windows Subsystem for Linux (WSL)! 

---------Install instructions--------
Here are the instructions on how to install what you need to use it:

--1--

[In PowerShell]

`wsl --install`

--2--

[in WSL]

`git clone https://github.com/craigloewen-msft/TicDappToe.git`

--3--

// Install Ganache by downloading from the projects page and renaming the file to whatever you like

// Install depdencies

`sudo apt install libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev`

--4--

`sudo apt install firefox -y`

// Install metamask from here: https://metamask.io/download/

--5--

`curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash`

`nvm install 14`

`nvm use 14`

// Cd into your TicDappToe project

`npm install -g truffle`

`npm install`

--------Useful links----------

My Twitter: https://twitter.com/craigaloewen

The GitHub project: 

https://github.com/craigloewen-msft/TicDappToe

In depth guide I used to create this sample app:

https://www.dappuniversity.com/articles/the-ultimate-ethereum-dapp-tutorial
