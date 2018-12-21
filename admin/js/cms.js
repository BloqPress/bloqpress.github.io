var bp_cms = {
    articles: {
        comment: function(network, address, articleIndex, comments)
        {
            var articleID = Web3.prototype.sha3(network + '_' + address);
            var articles = JSON.parse(localStorage.getItem('articles_' + articleID));
            var article = articles[articleIndex];
            if(article)
            {
                article.push(comments);
                articles[articleIndex] = article;
                localStorage.setItem('articles_' + articleID, JSON.stringify(articles));
            }
        },
        get: function(network, address, callback)
        {
            var articles = [];
            var web3 = new Web3(
                new Web3.providers.HttpProvider(network), 
                "utils"
            );
            var abi = ethereum_smart_contract_abis.cms[1].abi;
            var contract = web3.eth.contract(JSON.parse(abi)).at(address);
            var articleIDs = contract.getArticles();
            
            bp_cms.articles.stored(network, address, function(stored_articles)
            {
                if(articleIDs.length != stored_articles.length)
                {
                    var completed_articles = 0;
                    for(i = 0; i < articleIDs.length; i++)
                    {
                        var article = contract.getArticle(articleIDs[i].toString());
                        var description = '';
                        var stringArray = contract.getLongString(articleIDs[i].toString());
                        for(o = 0; o < stringArray.length; o++)
                        {
                            if(o > 0) description+= ' ';
                            description+= web3.toUtf8(stringArray[o]);
                        }
                        article.push(description);
                        var comment_address = ethereum_smart_contract_abis.cms[2].address;
                        articles[i] = article;
                        bp_cms.comments.get(network, comment_address, articleIDs[i].toString(), i, function(comments, c)
                        {
                            articles[c].push(comments);
                            if(completed_articles < articleIDs.length)
                            {
                                completed_articles++;
                            }
                            else
                            {
                                bp_cms.articles.store(network, address, articles);
                                callback(articles);
                            }
                        });
                    }
                }
                else
                {
                    articles = stored_articles;
                    callback(articles);
                }
            });
        },
        store: function(network, address, articles)
        {
            var articleID = Web3.prototype.sha3(network + '_' + address);
            localStorage.setItem('articles_' + articleID, JSON.stringify(articles));
            localStorage.setItem('bp_article_v', ethereum_secrets.v);
        },
        stored: function(network, address, callback)
        {
            var articles = false;
            var articleID = Web3.prototype.sha3(network + '_' + address);
            if(localStorage.getItem('articles_' + articleID))
            {
                articles = JSON.parse(localStorage.getItem('articles_' + articleID));
            }
            var stored_version = 0;
            if(localStorage.getItem('bp_article_v'))
            {
                stored_version = localStorage.getItem('bp_article_v');
            };
            if(ethereum_secrets.v > stored_version)
            {
                articles = false;
            }
            callback(articles);
        }
    },
    comments: {
        get: function(network, address, article, articleIndex, callback)
        {
            var comments = [];
            var web3 = new Web3(
                new Web3.providers.HttpProvider(network), 
                "utils"
            );
            var abi = ethereum_smart_contract_abis.cms[2].abi;
            var contract = web3.eth.contract(JSON.parse(abi)).at(address);
            var commentsIDs = contract.getComments(article);
            
            bp_cms.comments.stored(network, address, article, function(stored_comments)
            {
                if(commentsIDs.length != stored_comments.length)
                {
                    for(i = 0; i < commentsIDs.length; i++)
                    {
                        var html = '';
                        var comment = contract.getCommentByIndex(article, i);
                        for(o = 0; o < comment[0].length; o++)
                        {
                            if(o > 0) html+= ' ';
                            html+= web3.toUtf8(comment[0][o]);
                        }
                        comments.push(comment[2] + ':<br/>' + html);
                    }
                    bp_cms.comments.store(network, address, article, comments);
                }
                else
                {
                    comments = stored_comments;
                }
                callback(comments, articleIndex); 
            });
        },
        store: function(network, address, article, comments)
        {
            var commentID = Web3.prototype.sha3(network + '_' + address);
            localStorage.setItem('comments_' + commentID, JSON.stringify(comments));
            localStorage.setItem('bp_comment_v', ethereum_secrets.v);
        },
        stored: function(network, address, article, callback)
        {
            var comments = false;
            var commentID = Web3.prototype.sha3(network + '_' + address);
            if(localStorage.getItem('comments_' + commentID))
            {
                comments = JSON.parse(localStorage.getItem('comments_' + commentID));
            }
            var stored_version = 0;
            if(localStorage.getItem('bp_comment_v'))
            {
                stored_version = localStorage.getItem('bp_comment_v');
            };
            if(ethereum_secrets.v > stored_version)
            {
                comments = false;
            }
            callback(comments);
        }
    }
};