var bp_cms = {
    articles: {
        get: function(network, address)
        {
            var articles =[];
            var web3 = new Web3(
                new Web3.providers.HttpProvider(network), 
                "utils"
            );
            var abi = ethereum_smart_contract_abis.cms[1].abi;
            var contract = web3.eth.contract(JSON.parse(abi)).at(address);
            var articleIDs = contract.getArticles();
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
            return articles;
        }
    }
};