---
layout: post
title: Reddit's Opinion On the Github Acquisition - Data Science
author: Craig Loewen
---

This post goes over how the data that was analyzed [here]({% post_url 2018-06-11-reddit-opinion-github-acquisition %}) was collected.

The full source code is [available here](https://github.com/craigaloewen/reddit_opinion_analyzer).

The first question that anyone should ask when reading an article like this, is how did you get the data? Because if the data is bad, then no matter what the analysis will be incorrect. Or put more simply: garbage in, garbage out! 

So here's a full explanation of the method:

# Picking comments

 I used a service called [PRAW](https://praw.readthedocs.io/en/latest/) to grab comments from Reddit. I specifically chose to look at comments inside /r/github, /r/microsoft, and /r/programmerhumor as this is where I personally saw the most discussion. The only submissions that were considered were from June 3rd (Acquisition day) to June 8th. 

To make sure the comments were talking about the recent acquisition I only picked comments to analyze that either: 

<ul class="blog-bullet-points">
<li><p>belonged to a submission that had 'Github' and 'Microsoft' in the title</p></li>
<li><p>had 'Github' and 'Microsoft' in the body of the comment</p></li>
</ul>


While not fool proof, I reasoned that these two rules would not include a significant number of false positives (comments that aren't directed towards the acquisiton)

# Determining whether a comment was positive or negative

No, I did not read all 1965 comments! Instead, I used [Google Cloud's Natural Language processing API](https://cloud.google.com/natural-language/) to determine the sentiment of the comment. 

Essentialy, the service allows you to input text which it will analyze and give you a **sentiment score** and **magnitude** value. Basically, sentiment is HOW positive the text is (with 1 being positive and -1 being negative) and magnitude is how MUCH emotion was expressed in the text. 

It's a little confusing, so hopefully [this chart from Google](https://cloud.google.com/natural-language/docs/basics#interpreting_sentiment_analysis_values) will clear it up:

Sentiment |	Sample Values
--- | ---
Clearly Positive | 	"score": 0.8, "magnitude": 3.0
Clearly Negative |	"score": -0.6, "magnitude": 4.0
Neutral |	"score": 0.1, "magnitude": 0.0
Mixed |	"score": 0.0, "magnitude": 4.0

All I needed to do was to input Reddit comments about the acquisition into this service, to find out the opinion of the text.

# Analyzing and Presenting the Comments

From there I used Python and [Plot.ly](https://plot.ly) to visualize the data. I'd recommend looking at the [github repo](https://github.com/craigaloewen/reddit_opinion_analyzer) to check out the code.