var bp_cms = {
    articles: {
        get: function(network, address, callback)
        {
            var articles =[];
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
                        articles.push(article);
                    }
                    bp_cms.articles.store(network, address, articles);
                }
                else
                {
                    articles = stored_articles;
                }
                callback(articles); 
            });
        },
        store: function(network, address, articles)
        {
            var articleID = Web3.prototype.sha3(network + '_' + address);
            localStorage.setItem('articles_' + articleID, JSON.stringify(articles));
        },
        stored: function(network, address, callback)
        {
            var articles = false;
            var articleID = Web3.prototype.sha3(network + '_' + address);
            if(localStorage.getItem('articles_' + articleID))
            {
                articles = JSON.parse(localStorage.getItem('articles_' + articleID));
            }
            callback(articles);
        }
    }
};