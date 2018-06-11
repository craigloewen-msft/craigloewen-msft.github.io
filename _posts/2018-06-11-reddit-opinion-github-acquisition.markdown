---
layout: post
title: Reddit's Opinion On the Github Acquisition
author: Craig Loewen
---

*Before you start this article, I'd like to state that I've accepted a full time position with Microsoft at the time of writing this post, and so I have bias. Please bear this in mind while reading. Enjoy!*

***

There has been a lot of online debate surrounding [Microsoft's new acquisiton of Github](https://www.theverge.com/2018/6/3/17422752/microsoft-github-acquisition-rumors) this past week.
I tuned into the discussion, mostly on Reddit, but found it hard to tell what most people thought given the large amount of comments. There simply isn't enough time in the day to read them all! So instead, I decided to dig into it using some data science techniques. 

The goal was to answer the question: **How do Reddit commenters feel about the acquisition?**

I grabbed a bunch of comments from Reddit that were related to both Microsoft and Github. I only took comments from /r/microsoft, /r/github and /r/ProgrammerHumor. I then fed each comment into a program that automatically determines its sentiment: -1 is very negative and +1 is very positive. 

In this article I'm going to go over the general results, and then try and take a deeper look into some more insights that the data can give us. If you're interested in the data science process you can check out [this blog post]({% post_url 2018-06-10-reddit-opinion-github-acquisition-ds %}) where I go over the details, and give source code.

# The overall result

Most of the Reddit comments about the change are negative. 

After analyzing 1965 reddit comments, 41%(808) were negative, 32%(624) were positive, the rest were either mixed or  neutral. 

The interactive graph below summarizes the data.

<div class="chart-display">
    <a href="https://plot.ly/~craigaloewen/4/?share_key=oUHIHg4Awremjt073MANyg" target="_blank" title="Sentiment Pie Chart" style="display: block; text-align: center;"><img src="https://plot.ly/~craigaloewen/4.png?share_key=oUHIHg4Awremjt073MANyg" alt="Sentiment Pie Chart" style="max-width: 100%;width: 600px;"  width="600" onerror="this.onerror=null;this.src='https://plot.ly/404.png';" /></a>
    <script data-plotly="craigaloewen:4" sharekey-plotly="oUHIHg4Awremjt073MANyg" src="https://plot.ly/embed.js" async></script>
</div>



This isn't too surprising. In my opinion people are more likely to comment on something they disagree with, because it gives them the opportunity to explain their opinion on *why* this new acquisition is bad, while someone who thinks the acquistion is a good thing might just read it and move along. 

Given that point, these results certainly do not give concrete evidence that most **people** think negatively about the acquisition, but instead only indicates that the majority of the **online discussion** is negative. 

We can get better insight into these discussions by posing some more specific questions, such as the one in the next section:

# How different are the opinions of each subreddit?

Since the data was gathered from three subreddits: /r/microsoft, /r/github, and /r/ProgrammerHumor I wondered if each subreddit had its own 'opinion' on the acquisition. 

From the pie chart in the previous section, you can find that all subreddits mostly had negative comments, but had different proportions of comment sentiments. 

To better view these differences, I graphed the distribution of comment sentiments for each subreddit.

<div class="chart-display">
    <a href="https://plot.ly/~craigaloewen/6/?share_key=RLocNmEe04JlhCLWGFqZx1" target="_blank" title="Sentiment Distribution Plot by Subreddit" style="display: block; text-align: center;"><img src="https://plot.ly/~craigaloewen/6.png?share_key=RLocNmEe04JlhCLWGFqZx1" alt="Sentiment Distribution Plot by Subreddit" style="max-width: 100%;width: 600px;"  width="600" onerror="this.onerror=null;this.src='https://plot.ly/404.png';" /></a>
    <script data-plotly="craigaloewen:6" sharekey-plotly="RLocNmEe04JlhCLWGFqZx1" src="https://plot.ly/embed.js" async></script>
</div>


The subreddits definitely have their own prevailing opinions. /r/github is by far the most negative, with a much larger proportion of comments in the 0 to -0.5 range, while /r/microsoft is the most positive since it has a higher proportion of positive comments from the 0.1 to 0.6 range. Programmer Humor is inbetween these two.

My theory, is that Programmer Humor gives the best sample set for programmer's opinions, as obviously any user who is commenting on /r/github or /r/microsoft is biased one way or another just by their choice of subreddit. Given that /r/ProgrammerHumor has the most unbiased distribution of comments this begs our next question:

# Is /r/ProgrammerHumor the place to go for online discussion about tech issues?

From a data science point of view, the above question is incredibly difficult to answer, because *what metrics do you use to judge whether someone would want to read the comments in that subreddit?* The Reddit algorithm populates your newsfeed with posts that have high karma, and lots of comments. So, we can use the number of comments submitted in each subreddit to give us an idea of what subreddit may be more interesting to read. Obviously quantity does not imply quality of the comments, but since Reddit uses it as a measure of how 'interesting' a submission is it's worth looking into.

Let's find out: **what are the posting habits about the three subreddits with regards to the acquisiton?** by graphing a histogram of the submission date and time of each comment.

<div class="chart-display">
    <a href="https://plot.ly/~craigaloewen/12/?share_key=UdcnZ7dIf0NArmMvdfSM5S" target="_blank" title="Comment Times by Subreddit" style="display: block; text-align: center;"><img src="https://plot.ly/~craigaloewen/12.png?share_key=UdcnZ7dIf0NArmMvdfSM5S" alt="Comment Times by Subreddit" style="max-width: 100%;width: 600px;"  width="600" onerror="this.onerror=null;this.src='https://plot.ly/404.png';" /></a>
    <script data-plotly="craigaloewen:12" sharekey-plotly="UdcnZ7dIf0NArmMvdfSM5S" src="https://plot.ly/embed.js" async></script>
</div>


It's obvious that /r/ProgrammerHumor *dominates* /r/microsoft and /r/github in terms of the number of comments posted. I'd recommend interacting with the graph and clicking on ProgrammerHumor in the legend to filter it out so you can see the posting habits of the other two subreddits more clearly.

The first spike of comments on June 4th is obviously generated by the news that Microsoft is acquiring Github. But why was there also a spike around 12 AM on June 7th?

My first guess was the spike was due to more exposure in the news, as the new CEO of Github was doing his [AMA](https://www.reddit.com/r/AMA/comments/8pc8mf/im_nat_friedman_future_ceo_of_github_ama/) on June 7th at 1:30 PM. but most of the comment activity in these subreddits had already died down by then, so I don't believe it was the cause.

I opted to take a look at the posts that users were commenting on at that time to see if that could explain the spike. Here are the posts with the highest amount of analyzed comments for June 6th and 7th:

<div class="container">
    <div class="row">
        <div class="col-md-6">
            <a href="https://www.reddit.com/r/ProgrammerHumor/comments/8p1csy/tried_to_post_this_to_rgithub_boy_lots_of/">
            <b>Title:</b><h4>Tried to post this to r/github... boy, lots of Microsoft fanboys over there :)</h4>
            <img class="img-responsive" src="https://i.redd.it/p2n5vvgsbe211.png" />
            <h5>Submitted by: /u/bfrigon</h5>
            </a>
        </div>
        <div class="col-md-6">
            <a href="https://www.reddit.com/r/ProgrammerHumor/comments/8oyndj/calm_down_microsoft_already_knows_enough_about_you/">
            <b>Title:</b><h4>Calm down. Microsoft already knows enough about you...</h4>
            <img class="img-responsive" src="https://i.redd.it/k9kvevzj0c211.jpg" />
            <h5>Submitted by: /u/uvero</h5>
            </a>
        </div>
    </div>
</div>

Both are pretty funny, and certainly generated lots of comments and upvotes, which is the primary factor for the average reddit user to see a post in their newsfeed, giving them higher incentive to join in on the conversation. Both are also very opinionated, speculative, and provocative. 

I noticed that a high volume of comments in /r/ProgrammerHumor correlates with comment activity in both /r/microsoft and /r/github. I believe this is because /r/ProgrammerHumor users are also commenting in the other two subreddits, and I would go even further to say that seeing a controversial post like the two that I showed above would cause users to go and seek out discussion in the othe subreddits. This is supported by the fact that when there are spikes in /r/ProgrammerHumor, there are delayed spikes in /r/github and /r/microsoft.

This gives a startling realization: 

### Image macro posts could be a significant root cause for online discussion.

In fact, when I think back on why I wanted to write this article in the first place it was because I was seeing posts on Reddit like the two above.

# Conclusions

What can we take away?

<ul class="blog-bullet-points">
<li><p>Most of the online discussion about the acquisition is negative.</p></li>
<li><p>/r/github has the most negative opinions, and /r/microsoft has the most positive opinions.</p></li>
<li><p>Most of the discussion is taking place on less serious image macro posts, which could be fueling discussion in the other subreddits</p> </li>
</ul>

Overall the result that most Reddit commenters have negative things to say shouldn't be surprising. Change is scary. It's easy to speculate all of the ways Github could 'go wrong' for developers.

The most surprising information is the effect that the humor posts have on online discussion. These posts are creating a huge amount of online discussion, and in my opinion are influencing commenting habits in other non-humor based subreddits. It's almost scary to think of the widereaching effect on public opinion that these image posts have.

Lastly, I was surprised by the amount of positive comments I saw. Even though they weren't the majority, they were pretty close at 32%. I think this gives a lot of credence to the positive effect of Microsoft's new initiatives on open source, such as VSCode.

### Overall, I think I'm going to be a little more speculative about the next upvoted meme I see on /r/ProgrammerHumor.
