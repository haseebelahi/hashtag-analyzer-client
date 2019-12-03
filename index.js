'use strict';

(() => {
    
    let tweetsPerHourGraph = null;
    let usersWithMostTweetsGraph = null;
    const TOP_N = 20;
    var maxFrequency = 0;
    var minFrequency = 0;

    const drawTweetsPerUserGraph = (tweetsPerUser) => {
        let labels = [];
        let data = [];
        labels = tweetsPerUser.map(item => `@${item.screen_name}`);
        data = tweetsPerUser.map(item => item.num_of_tweets);
        const utils = new Utils();
        const colors = utils.getColors(data.length);
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Tweet Count',
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 1,
                        data: data
                    }
                ]
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top'
                },
                title: {
                    display: 'true',
                    text: 'Top 10 Tweeters'
                },
                onClick: clickEventHandler,
                onHover: hoverEventHandler
            }
        };
        const ctx1 = document.getElementById('myChart1').getContext('2d');
        if (usersWithMostTweetsGraph) {
            usersWithMostTweetsGraph.destroy();
        }
        usersWithMostTweetsGraph = new Chart(ctx1, config);
    };
    
    const drawTweetsPerHourGraph = (tweetsPerHourGraphData) => {
        const labels = tweetsPerHourGraphData['labels'];
        const data = tweetsPerHourGraphData['data'];
        const highestLikesData = tweetsPerHourGraphData['highestLikesData'];
        const highestRetweetsData = tweetsPerHourGraphData['highestRetweetsData'];
        const mostTweetsInAMinData = tweetsPerHourGraphData['mostTweetsInAMinData'];
        const utils = new Utils();
        const colorPair = utils.getColorPair();
        let config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Tweets by Hour',
                        fill: false,
                        borderColor: colorPair[0],
                        backgroundColor: colorPair[0],
                        borderWidth: 4,
                        data: data,
                    },
                    {
                        label: 'Most retweeted Tweet',
                        type: 'bubble',
                        data: highestRetweetsData,
                        backgroundColor: colorPair[1],
                        hoverBackgroundColor: colorPair[1],
                        pointStyle: 'circle'
                    },
                    // {
                    //     label: 'Most liked Tweet',
                    //     type: 'bubble',
                    //     data: highestLikesData,
                    //     backgroundColor: colorPair[1],
                    //     hoverBackgroundColor: colorPair[1],
                    //     pointStyle: 'circle'
                    // },
                    // {
                    //     label: 'Most tweets in a minute',
                    //     type: 'bubble',
                    //     data: mostTweetsInAMinData,
                    //     backgroundColor: colorPair1[1],
                    //     hoverBackgroundColor: colorPair1[1],
                    //     pointStyle: 'circle'
                    // }
                ],
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Tweets by hour',
                },
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, data) => {
                            let tt = ''
                            if(tooltipItem.datasetIndex == 0) {
                                tt = `Total Tweets: ${tooltipItem.yLabel}`;
                            } else if(tooltipItem.datasetIndex == 1){
                                tt = `Tweet with most retweets (${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].retweets}) @ ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].time} from ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].username}`;
                            } else if(tooltipItem.datasetIndex == 2){
                                tt = `Tweet with most likes (${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].likes}) @ ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].time} from ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].username}`;
                            } else {
                                tt = `Most tweets in a minute (${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].tweets}) @ ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].time}`;
                            }
                            return tt;
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Hour of the day'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Number of Tweets'
                        }
                    }]
                }
            }
        };
        var ctx = document.getElementById('myChart').getContext('2d');
        if(tweetsPerHourGraph) {
            tweetsPerHourGraph.destroy();
        }
        tweetsPerHourGraph = new Chart(ctx, config);
    };

    const buildWordCloud  = (wordFrequency) => {
        const ctx = document.getElementById('word_cloud');
        const ctxParent = document.getElementById('word_cloud_card');
        const ctxAdjacent = document.getElementById('word_cloud_adj_card');
        const ctxWidth = (ctxParent.offsetWidth * 0.9).toString();
        const ctxHeight = Math.ceil(ctxWidth/1.5).toString();
        ctx.setAttribute('width', ctxWidth);
        ctx.setAttribute('height', ctxHeight);
        ctx.style['width'] = `${ctxWidth}px`;
        ctx.style['height'] = `${ctxHeight}px`;

        wordFrequency = wordFrequency.slice(1);
        maxFrequency = wordFrequency[0][1];
        minFrequency = wordFrequency[wordFrequency.length - 1][1];
        
        const utils = new Utils();

        const heighestCount = wordFrequency.slice(1)[0][1];
        let weightFactor = 0.4;
        if (heighestCount > 450) {
            weightFactor = 0.5 / (heighestCount / 450);
        }
        WordCloud(ctx, {
            list: wordFrequency,
            color: function() {
                return utils.randomColor();
            },
            click: (item) => {
                const freqInfo = document.getElementById('word_freq_info');
                freqInfo.innerHTML = `The term <em>'${item[0]}'</em> occured <b>${Math.ceil(item[1])}</b> times in a total of <b>${item[2]}</b> tweets.`
            },
            drawOutOfBound: true,
            shrinkToFit: false,
            weightFactor: function (size) {
                // const transformed = (size * 0.5) * ctx.offsetWidth / 1024;
                // console.log(size + ', ' + transformed);
                // console.log(test);
                // return transformed;
                if(maxFrequency > 145) {
                    const transformed = (((size - minFrequency) * 1.0)/(maxFrequency - minFrequency)) * (160 - 0) + 0;
                    return transformed;
                }
                return size;
                
            },
            rotationSteps: 2
        });
        ctxAdjacent.style['height'] = `${ctxParent.offsetHeight}px`;
        ctxAdjacent.style['max-height'] = `${ctxParent.offsetHeight}px`;
    };
    
    const showTopNTweets = (tweets, by) => {
        const topNContainer = document.getElementById(`topby${by}`);
        const topNTitle = document.getElementById(`topby${by}title`);
        topNTitle.innerText = topNTitle.innerText.replace('#', TOP_N);
        let innerHTML = ''
        if (by == 'time') {
            setFirstTweetTime(tweets[0].time);
        }
        tweets.forEach(tweet => {
            innerHTML += `
            <div class='card tweet-content mb-8'>
                <div class='card-body tweet-card'>
                    <div class='card-title'>
                        <a title='${tweet.username}' href='https://twitter.com/${tweet.screen_name}' target = '_blank'>
                        <img class='avatar-img' src='${tweet.avatar_img}' alt='profile avatar'>
                        @${tweet.username}
                        </a>
                    </div>
                    <div class='card-text'>
                        ${tweet.html}
                        <p><i class='fa fa-clock-o'></i><a title='See tweet on Twitter' href='https://twitter.com/${tweet.url}' target='_blank'> ${tweet.time}</a></p>
                        <p><i class='fa fa-heart'></i> ${tweet.likes}&nbsp;&nbsp <i class='fa fa-retweet'></i> ${tweet.retweets} &nbsp;&nbsp <i class='fa fa-comment'></i> ${tweet.replies}</p>
                    </div>
                </div> 
            </div>
            `;
        });
        topNContainer.innerHTML = innerHTML;
    };

    const hashtagStarters = (hashtagStarters) => {
        let innerHTML = '<ul class="hashtag-starters">';
        hashtagStarters.forEach(user => {
            innerHTML += `
            <li>
                <a title='${user.screen_name}' href='https://twitter.com/${user.screen_name}' target = '_blank'>
                    <img class='avatar-img' src='${user.avatar_img}' alt='profile avatar'>
                    @${user.username}
                </a> at ${user.tweet_time}
            </li>
            `;
        });
        document.getElementById('hashtagStarters').innerHTML = innerHTML;
        document.getElementById('hashtagStartersTitle').innerText = document.getElementById('hashtagStartersTitle').innerText.replace('#', TOP_N);
    };

    const setTotalTweets = (totalTweets) => {
        document.getElementById('totalTweets').innerText = new Utils().numberWithCommas(totalTweets);
    };

    const setFirstTweetTime = (time) => {
        document.getElementById('firstTweetTime').innerText = time;
    };

    const setTotalTweeters = (totalTweeters) => {
        document.getElementById('totalTweeters').innerText = new Utils().numberWithCommas(totalTweeters);
    };

    const setMostTweetsInAMin = (mostTweetsInAMin) => {
        document.getElementById('mostTweetsInAMin').innerText = `${mostTweetsInAMin[0].num_of_tweets} @ ${mostTweetsInAMin[0].time}`;
    };

    const setTotalRetweets = (totalRetweets) => {
        document.getElementById('totalRetweets').innerText = new Utils().numberWithCommas(totalRetweets);
    };

    const setTotalLikes = (totalLikes) => {
        document.getElementById('totalLikes').innerText = new Utils().numberWithCommas(totalLikes);
    };

    const showCommonLinks = (commonLinks) => {
        const commonLinksContainer = document.getElementById('common_links');
        let innerHTML = `<ol>`;
        for(let link in commonLinks) {
            innerHTML += `
            <li>
                <p class='text-elipsis'><a href='${link}' target='_blank'>${link}</a><p>
            </li>
            `;
        }
        innerHTML += `</ol>`;
        commonLinksContainer.innerHTML = innerHTML;
    };
    
    const clickEventHandler = (event) => {
        const firstPoint = usersWithMostTweetsGraph.getElementAtEvent(event)[0];

        if (firstPoint) {
            const label = usersWithMostTweetsGraph.data.labels[firstPoint._index];
            const a = document.createElement('a');
            a.href = `https://twitter.com/${label}`;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
        }
    };
    const hoverEventHandler = (event) => {
        const firstPoint = usersWithMostTweetsGraph.getElementAtEvent(event)[0];
        const canvas = document.getElementById('myChart1');
        if (firstPoint) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'default';
        }
    };
    const fetchData = () => {
        updatingIndicator.innerText = 'Updating Data... Please wait...';
        const hashtag = decodeURIComponent(window.location.hash.substr(1));
        document.getElementById('hashtag').innerText = hashtag;
        document.getElementById('hashtag-ref').href = `https://twitter.com/hashtag/${hashtag}?src=hash`
        fetch(`http://localhost:5000/api/allstats/${hashtag}`)
        .then(response => response.json())
        .then(json => {
            updatingIndicator.innerText = '';
            drawTweetsPerHourGraph(json['tweetsPerHour']);
            showTopNTweets(json['topN']['likes'], 'likes');
            showTopNTweets(json['topN']['retweets'], 'retweets');
            showTopNTweets(json['topN']['time'], 'time');
            hashtagStarters(json['hashtagStarters']);
            setTotalTweets(json['totalTweets']);
            setTotalTweeters(json['totalUsersTweeting']);
            setMostTweetsInAMin(json['tweetCountInFirst5']);
            buildWordCloud(json['wordFreq']);
            showCommonLinks(json['commonLinks']);
            drawTweetsPerUserGraph(json['topTweeters']);
            setTotalRetweets(json['totalRetweets']);
            setTotalLikes(json['totalLikes'])
        });
    };
    
    const updatingIndicator = document.getElementById('updating-indicator');
    const disclaimerDialog = document.getElementById('open-modal');
    fetchData();

    window.onhashchange = fetchData;
    
    const openDisclaimer = () => {
        console.log(disclaimerDialog.classList.add('modal-window-open'));
    };
    const closeDisclaimer = () => {
        console.log(disclaimerDialog.classList.remove('modal-window-open'));
    };

    document.getElementById('close-disc').onclick = closeDisclaimer;
    document.getElementById('open-disc').onclick = openDisclaimer;
    
})();