---
layout: post
title: Running Puppet Quickly in the Windows Subsytem for Linux 2
author: Craig Loewen
---

I recently wanted to install Puppet in WSL2, so I could start playing around with it to learn more about the tool. Since I found it difficult to find any writing online letting you know how to quickly get up and running I decided to make my own (mostly so I can refer to it later 😁). This certainly isn't any official way to get puppet working, but it worked for me!

# Pre-Reqs

You need to have the following installed: 

- You need to have WSL2 installed - [Instructions](https://aka.ms/wsl2-install)
- Docker installed in your WSL2 Distro - [Instructions for Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
- docker-compose installed in your WSL2 Distro - [Instructions](https://docs.docker.com/compose/install/)

# 🎶 Let's get down to business 🎶 (To install... the app)

We'll be installing Puppet using docker containers and docker-compose.

First, go to the [puppetlabs/pupperware](https://github.com/puppetlabs/pupperware) repo page and clone it into your Linux root file system. I put it in my home folder.

```bash
git clone https://github.com/puppetlabs/pupperware.git
```

Then cd inside the folder.

```bash
cd pupperware/
```

And run docker-compose to start all of the containers. You need to pass it an environment variable for your DNS names. This is described in the README of the pupperware repo. Using an example one is fine for messing around. If you're new to docker make sure you're running as the root user or have permissions to aacess docker. 

```bash
DNS_ALT_NAMES=host.example.com docker-compose up -d
```

From there your puppet server is set up! You can test standing up a puppet client by running:

```bash
docker run --net pupperware_default puppet/puppet-agent-alpine
```

Or:

```bash
docker run --net pupperware_default puppet/puppet-agent-ubuntu
```

As they show in the [docker examples](https://github.com/puppetlabs/puppet-in-docker-examples/tree/master/compose) page for puppet for docker. 

# Going further - Let's write a manifest

Pupperware set up some volume mounts to share files easily with your puppetserver. You can find these volume mounts by running: 

```bash
 docker volume ls
```

And then you can inspect them by running: 

```bash
docker inspect pupperware_puppetserver-code
```

Where `pupperware_puppetserver-code` is the name of the volume that you found by running `docker volume ls`. This will output the details about the volume, what you really care about is the "Mountpoint" option. Mine corresponds to: `"/var/lib/docker/volumes/pupperware_puppetserver-code/_data"` which is where all my code data is stored. So we navigate to there in the shell:

```bash
cd /var/lib/docker/volumes/pupperware_puppetserver-code/_data
```

Then `cd` into the `environments` folder, and then into the `production` folder and then manifests.

```bash
cd environments/production/manifests
```

And we'll add a simple one that just creates a file. Use your editor of choice to add the following content to `manifestFile.pp` in that folder. 

```
file { "/var/tmp/testfile":
        ensure => "present",
        owner => "root",
        group => "root",
        mode => "664",
        content => "This file was automatically deployed to your machine using Puppet! 'Aint that neat.",
}
```

Then we'll make the puppet server apply that manifest. We'll need to get the name of that docker container:

```bash
docker ps | grep server
```

Mine is called: `pupperware_puppet_1`. We can make it apply that manifest. Again, if you're not that comfortable with docker we have a different file location here as the share volume is mounted in a different location inside of our container. 

```
docker exec pupperware_puppet_1 puppet apply /etc/puppetlabs/code/environments/production/manifests/manifestFile.pp
```

Now that we've applied our updated manifest, let's take a peek in a container that runs the puppet agent to see how it played out. We'll need to modify the entry point of the container so we can use bash instead and run the puppet agent command manually. (You can see the code for the Ubuntu agent [at this repo](https://github.com/puppetlabs/puppet-in-docker/tree/master/puppet-agent-ubuntu))

```
docker run -it --network pupperware_default --entrypoint "/bin/bash" puppet/puppet-agent-ubuntu
puppet agent --verbose --onetime --no-daemonize --summarize
```

And now we can check out our file by running:

```
cat /var/tmp/testfile
```

And we should see the text we had above! Now you have a great environment setup where you can play around with different puppet commands. :) 