'use strict';

(() => {
    function random_rgb() {
        var o = Math.round, r = Math.random, s = 255;
        // return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
        return [o(r()*s), o(r()*s), o(r()*s)];
    }

    function randomColor(){
        const whiteRGB = [255, 255, 255];
        let randomRGB = random_rgb();
        while(contrast(whiteRGB, randomRGB) < 3) {
            randomRGB = random_rgb();
        }
        return `rgba(${randomRGB[0]}, ${randomRGB[1]}, ${randomRGB[2]}, 0.8)`
    }

    function luminanace(r, g, b) {
        var a = [r, g, b].map(function (v) {
            v /= 255;
            return v <= 0.03928
                ? v / 12.92
                : Math.pow( (v + 0.055) / 1.055, 2.4 );
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function contrast(rgb1, rgb2) {
        const luminanace1 = luminanace(rgb1[0], rgb1[1], rgb1[2]) + 0.05;
        const luminanace2 = luminanace(rgb2[0], rgb2[1], rgb2[2]) + 0.05;
        return luminanace1 > luminanace2 ? luminanace1/luminanace2 : luminanace2/luminanace1;
    }

    const getColorPair = () => {
        let constrastRatio = 0;
        let color1 = [];
        let color2 = [];
        while(constrastRatio < 3.5) {
            color1 = random_rgb();
            color2 = random_rgb();
            constrastRatio = contrast(color1, color2);
        }
        return [`rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, 0.9)`, `rgb(${color2[0]}, ${color2[1]}, ${color2[2]}, 0.9)`];
    };

    
    const colors = ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)', 'rgb(235, 98, 134)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)'];

    const colorsLight = ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'];

    const TOP_N = 15;
    const getColors = (size) => {
        // const newColors = colors.slice();
        // if(size > colors.length) {
        //     for (let i = 0; i <= size - colors.length; i++) {
        //         newColors.push(colors[i%colors.length]);
        //     }
        // }
        const newColors = [];
        for (let i = 0; i < size; i++){
            newColors.push(randomColor());
        }
        return newColors;
    }

    const drawTweetsPerUserGraph = (tweetsPerUser) => {
        let labels = [];
        let data = [];
        tweetsPerUser.sort((a, b) => {
            return a.num_of_tweets - b.num_of_tweets;
        });
        labels = tweetsPerUser.map(item => item.screen_name);
        data = tweetsPerUser.map(item => item.num_of_tweets);
        
        const colors = getColors(data.length);
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
                }
            }
        };
        const ctx1 = document.getElementById('myChart1').getContext('2d');
        new Chart(ctx1, config);
    };
    
    const drawTweetsPerHourGraph = (tweetsByTime) => {
        let labels = [];
        let data = [];
        let highestLikesData = [];
        parseTime(tweetsByTime);
        tweetsByTime.sort((a, b) => a.time - b.time);
        setFirstTweetTime(tweetsByTime[0].time);
        let hash = {};
        tweetsByTime.forEach(tweet => {
            let tweetTime = moment(tweet.time);
            let key = tweetTime.format('D-M-YY hA') + ' - ' + tweetTime.add(1, 'h').format('hA');
            console.log('hour: ' + key);
            if(!hash[key]) {
                hash[key] = {x: key, y: 0}
                
            }
            hash[key].y += 1;
        });
        for (let prop in hash) {
            labels.push(prop);
            data.push(hash[prop].y);
        }
        tweetsByTime.sort((a, b) => b.likes - a.likes).splice(0, 1).forEach(tweet => {
            let tweetTime = moment(tweet.time);
            const hour = tweetTime.format('D-M-YY hA') + ' - ' + tweetTime.add(1, 'h').format('hA');
            labels.forEach(label => {
                if(label == hour) {
                    highestLikesData.push({
                        x: hour,
                        y: hash[hour].y,
                        r: 8,
                        likes: tweet.likes,
                        time: tweet.time.format('h:mA'),
                        username: tweet.username
                    });
                } else {
                    highestLikesData.push({});
                }
            });
        });
        
        const colorPair = getColorPair();
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
                        label: 'Most liked Tweet',
                        type: 'bubble',
                        data: highestLikesData,
                        backgroundColor: colorPair[1],
                        hoverBackgroundColor: colorPair[1],
                        pointStyle: 'circle'
                    }
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
                            } else {
                                tt = `Tweet with most likes (${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].likes}) @ ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].time} from ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].username}`;
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
        new Chart(ctx, config);
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
        
        WordCloud(ctx, {
            list: wordFrequency['word_frequency_list'].slice(1),
            color: function() {
                return randomColor();
            },
            click: (item) => {
                const freqInfo = document.getElementById('word_freq_info');
                freqInfo.innerHTML = `The term <em>'${item[0]}'</em> occured <b>${Math.ceil(item[1])}</b> times in a total of <b>${item[2]}</b> tweets.`
            },
            drawOutOfBound: true,
            shrinkToFit: false,
            weightFactor: 0.27
        });
        ctxAdjacent.style['height'] = `${ctxParent.offsetHeight}px`;
        ctxAdjacent.style['max-height'] = `${ctxParent.offsetHeight}px`;
    };

    const showTopNTweets = (tweets, by, sort = 'desc') => {
        const topNContainer = document.getElementById(`topby${by}`);
        const topNTitle = document.getElementById(`topby${by}title`);
        topNTitle.innerText = topNTitle.innerText.replace('#', TOP_N);
        let innerHTML = ''
        parseTime(tweets);
        tweets.sort((a, b) => sort == 'desc' ? (b[by] - a[by]) : (a[by] - b[by])).slice(0, TOP_N).forEach(tweet => {
            const regEx = new RegExp('href="/', "g");
            tweet.text_html = tweet.text_html.replace(regEx, 'href="https://twitter.com/')
            innerHTML += `
            <div class='card tweet-content mb-8'>
                <div class='card-body tweet-card'>
                    <div class='card-title'>
                        <a href='https://twitter.com/${tweet.screen_name}' target = '_blank'>@${tweet.username}</a>
                    </div>
                    <div class='card-text'>
                        ${tweet.text_html}
                        <p><i class='fa fa-clock-o'></i><a href='https://twitter.com/${tweet.tweet_url}' target='_blank'> ${moment(tweet.timestamp+'Z').format('LLLL')}</a></p>
                        <p><i class='fa fa-heart'></i> ${tweet.likes}&nbsp;&nbsp <i class='fa fa-retweet'></i> ${tweet.retweets} &nbsp;&nbsp <i class='fa fa-comment'></i> ${tweet.replies}</p>
                    </div>
                </div> 
            </div>
            `;
        });
        topNContainer.innerHTML = innerHTML;
    };

    const hashtagStarters = (tweets) => {
        parseTime(tweets);
        const uniqueUsers = tweets.sort((a, b) => a.time - b.time).reduce((unique, item) => {
            // console.log(item, unique, unique.some(x => x.username == item.username), unique.some(x => x.username == item.username) ? unique : [...unique, item]);
            return unique.some(x => x.username == item.username) ? unique : [...unique, item];
        }, []).map(item => {
            return {
                username: item.username,
                screen_name: item.screen_name,
                tweet_time: item.time
            };
        });
        setTotalTweeters(uniqueUsers.length);
        let innerHTML = '<ul>';
        uniqueUsers.slice(0, TOP_N).forEach(user => {
            innerHTML += `
            <li>
                <a href='https://twitter.com/${user.screen_name}' target = '_blank'>@${user.username}</a> at ${user.tweet_time.format('LLLL')}
            </li>
            `;
        });
        document.getElementById('hashtagStarters').innerHTML = innerHTML;
        document.getElementById('hashtagStartersTitle').innerText = document.getElementById('hashtagStartersTitle').innerText.replace('#', TOP_N);
    };

    const setTotalTweets = (tweets) => {
        document.getElementById('totalTweets').innerText = tweets.length;
    };

    const setFirstTweetTime = (time) => {
        document.getElementById('firstTweetTime').innerText = time.format('LLLL');
    };

    const setTotalTweeters = (totalTweeters) => {
        document.getElementById('totalTweeters').innerText = totalTweeters;
    };

    const showCommonLinks = (commonLinks) => {
        const commonLinksContainer = document.getElementById('common_links');
        let innerHTML = `<ol>`;
        for(let link in commonLinks['links']) {
            innerHTML += `
            <li>
                <p><a href='${link}' target='_blank'>${link}</a><p>
            </li>
            `;
        }
        innerHTML += `</ol>`;
        commonLinksContainer.innerHTML = innerHTML;
    };

    const parseTime = tweets => tweets.forEach(tweet => tweet.time = moment(tweet.timestamp+'Z'));


    /** TODO:
     * get user profile picture link scrapped from profile and show pp in tweets 
     * */ 
    

    fetch('api/tweets_by_time.json', {mode: 'no-cors'})
        .then(response => response.json())
        .then(json => {
            drawTweetsPerHourGraph(json.slice());
            showTopNTweets(json.slice(), 'likes');
            showTopNTweets(json.slice(), 'retweets');
            showTopNTweets(json.slice(), 'time', 'asc');
            hashtagStarters(json.slice());
            setTotalTweets(json.slice());
        });
    fetch('api/top_10_tweeters.json', {mode: 'no-cors'})
        .then(response => response.json())
        .then(json => drawTweetsPerUserGraph(json));
    fetch('api/word_frequency.json', {mode: 'no-cors'})
        .then(response => response.json())
        .then(json => buildWordCloud(json));
    fetch('api/common_links.json', {mode: 'no-cors'})
        .then(response => response.json())
        .then(json => showCommonLinks(json));
    
})();