---
layout: post
title: How to set your default browser in WSL to Microsoft Edge
author: Craig Loewen
---

I was trying to set up PyCharm in WSL, and it asked me to register, and had a link to my default browser. So I wanted to set up my default browser in WSL to be my Edge browser on Windows. Here's how I did it. Props to [akimon658 for their original solution that was the entire basis for my solution below](https://akimon658.github.io/en/p/2021/wsl-default-browser/).

First I created a file in my home directory called `startEdge.sh`. Here are the contents:

```
#!/bin/bash

powershell.exe /c start msedge $1
```

Then I ran `sudo chmod +x ./startEdge.sh` to make it executable. 

From there I ran: `sudo update-alternatives --install /usr/bin/x-www-browser x-www-browser $HOME/startEdge.sh 1`

And just like that it was my default! Hopefully this helps others in the same spot.
