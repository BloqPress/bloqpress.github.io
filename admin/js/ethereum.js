// Personal = 0xd1389b1a127603abff6f42f4c4e6894c6a968986
// Business = 0x82c09c3966ff2499e58beedf9b6333beb54f8f91
// Madeline = 0x9031c0583446ed13217e8e6dde5794de096ebce5

// Mark Smalley = 0xf4b8cc6e1d77bbc8cf36e1770e9249b3e95c4244

var ethereum_ux = {
    abi: function(type)
    {
        var results = false;
        var options = {
            erc20: [
            {
                "constant":true,
                "inputs":[

                ],
                "name":"name",
                "outputs":[
                    {
                        "type":"string"
                    }
                ],
                "type":"function"
            },
            {
                "constant":true,
                "inputs":[

                ],
                "name":"totalSupply",
                "outputs":[
                    {
                        "type":"uint256"
                    }
                ],
                "type":"function"
            },
            {
                "constant":true,
                "inputs":[
                    {
                        "type":"address"
                    }
                ],
                "name":"balanceOf",
                "outputs":[
                    {
                        "type":"uint256"
                    }
                ],
                "type":"function"
            },
            {
                "constant":true,
                "inputs":[

                ],
                "name":"symbol",
                "outputs":[
                    {
                        "type":"string"
                    }
                ],
                "type":"function"
            },
            {
                "constant":false,
                "inputs":[
                    {
                        "name":"_to",
                        "type":"address"
                    },
                    {
                        "name":"_amount",
                        "type":"uint256"
                    }
                ],
                "name":"transfer",
                "outputs":[
                    {
                      "name": "",
                      "type": "bool"
                    }
                ],
                "type":"function"
            },
            {
                "constant":true,
                "inputs":[

                ],
                "name":"decimals",
                "outputs":[
                    {
                        "type":"uint8"
                    }
                ],
                "type":"function"
            }
            ],
            erc721: [
            {
                "constant":true,
                "inputs":[

                ],
                "name":"name",
                "outputs":[
                    {
                        "type":"string"
                    }
                ],
                "type":"function"
            },
            {
                "constant":true,
                "inputs":[

                ],
                "name":"totalSupply",
                "outputs":[
                    {
                        "type":"uint256"
                    }
                ],
                "type":"function"
            },
            {
                "constant":true,
                "inputs":[
                    {
                        "name": "_owner",
                        "type":"address"
                    }
                ],
                "name":"balanceOf",
                "outputs":[
                    {
                      "name": "",
                      "type": "uint256"
                    }
                ],
                "type":"function"
            },
            {
                "constant":true,
                "inputs":[

                ],
                "name":"symbol",
                "outputs":[
                    {
                      "name": "",
                      "type": "string"
                    }
                ],
                "type":"function"
            },
            {
                "constant":false,
                "inputs":[
                    {
                        "name":"_id",
                        "type":"uint256"
                    }
                ],
                "name":"metadata",
                "outputs":[
                    {
                        "type":"string"
                    }
                ],
                "type":"function"
            },
            {
                "constant":false,
                "inputs":[
                    {
                        "name":"_owner",
                        "type":"address"
                    }
                ],
                "name":"getAllTokens",
                "outputs":[
                    {
                        "type":"uint[]"
                    }
                ],
                "type":"function"
            },
            {
                "constant":false,
                "inputs":[
                    {
                        "name":"_owner",
                        "type":"address"
                    },
                    {
                        "name":"_index",
                        "type":"uint"
                    }
                ],
                "name":"tokenOfOwnerByIndex",
                "outputs":[
                    {
                        "type":"uint"
                    }
                ],
                "type":"function"
            },
            {
                "constant":false,
                "inputs":[
                    {
                        "name":"_id",
                        "type":"uint256"
                    }
                ],
                "name":"ownerOf",
                "outputs":[
                    {
                        "type":"address"
                    }
                ],
                "type":"function"
            },
            {
                "constant":false,
                "inputs":[
                    {
                        "name":"_to",
                        "type":"address"
                    },
                    {
                        "name":"_id",
                        "type":"uint256"
                    }
                ],
                "name":"transfer",
                "outputs":[

                ],
                "type":"function"
            }
            ]
        };
        if(type && typeof options[type] != 'undefined')
        {
            results = options[type];
        }
        return results;
    },
    config: function(name, params)
    {
        var abi = false;
        var network = false;
        var address = false;
        var results = false;
        if(
            typeof name != 'undefined'
            && typeof params != 'undefined'
            && typeof ethereum_contracts.contracts != 'undefined'
            && $.isArray(params)
            && $.isArray(ethereum_contracts.contracts)
            && ethereum_contracts.contracts.length > 0
            && params.length > 0
        )
        {
            $.each(ethereum_contracts.contracts, function(i)
            {
                var objs = ethereum_contracts.contracts[i];
                $.each(params, function(p)
                {
                    var result = false;
                    var param = params[p];
                    if(
                        typeof objs[param] != 'undefined'
                        && typeof objs.name != 'undefined'
                        && objs.name == name
                        && objs[param]
                    ){
                        if(!$.isPlainObject(results)) results = {};
                        result = objs[param];
                        if(param == 'abi') result = JSON.parse(objs[param]);
                        results[param] = result;
                    }
                });
            });
        }
        return results;
    },
    contract: function(name)
    {
        var contract = false;
        var options = ethereum_ux.config(name.replace('-', ' '), ['address', 'network', 'abi']);
        if(options)
        {
            var web3 = ethereum_ux.web(options.network);
            contract = web3.eth.contract(options.abi).at(options.address);
            contract._abi = options.abi;
        }
        return contract;
    },
    crypto: function(params)
    {
        var results = '';
        if($.isArray(params))
        {
            $.each(params, function(p)
            {
                results = Web3.prototype.sha3(results + '_' + Web3.prototype.sha3(params[p]));
            });
        }
        return results;
    },
    keys: function(hash)
    {
        var eth_wallet = new Wallet(ethUtil.sha3(hash));
        var keys = {
            address: eth_wallet.getAddress().toString('hex'),
            private: eth_wallet.privKey.toString('hex'),
            public: eth_wallet.getPublicKey().toString('hex')
        };
        return keys;
    },
    txs: {
        send: function(options, callback)
        {
            var settings = {
                value: 0,
                key: false,
                from: 0,
                to: 0,
                type: 'ether',
                contract: false,
                address: 0,
                network: false
            }
            if(typeof options != 'undefined' && $.isPlainObject(options))
            {
                if(typeof options.value != 'undefined') settings.value = options.value;
                if(typeof options.key != 'undefined') settings.key = options.key;
                if(typeof options.from != 'undefined') settings.from = options.from;
                if(typeof options.to != 'undefined') settings.to = options.to;
                if(typeof options.type != 'undefined') settings.type = options.type;
                if(typeof options.contract != 'undefined') settings.contract = options.contract;
                if(typeof options.address != 'undefined') settings.address = options.address;
                if(typeof options.network != 'undefined') settings.network = options.network;
            }
            if(options.network)
            {
                var web3 = ethereum_ux.web(settings.network);
                var ether_to_send = web3.fromDecimal(web3.toWei(settings.value), 'ether');
                var private_key = new Buffer(settings.key, 'hex');
                var block = web3.eth.getBlock('latest');
                var raw_tx = {
                    gasPrice: web3.eth.gasPrice.toNumber(),
                    gasLimit: block.gasLimit,
                    nonce: web3.eth.getTransactionCount(settings.from),
                    to: settings.to, 
                    from: settings.from,
                    value: ether_to_send
                }
                var hex_data = false;
                if(settings.contract && settings.address)
                {
                    if(settings.type == 'erc20')
                    {
                        var token_decimals = parseInt(settings.contract.decimals().toString());
                        var tokens_to_send = parseInt(parseFloat(settings.value * (10**token_decimals)));
                        settings.value = tokens_to_send;
                        hex_data = settings.contract.transfer.getData(settings.to, tokens_to_send);
                    }
                    else if(settings.type == 'erc721')
                    {
                        hex_data = settings.contract.transfer.getData(settings.to, settings.value);
                    }
                    if(hex_data)
                    {
                        raw_tx.value = 0;
                        raw_tx.data = hex_data;
                        raw_tx.to = settings.address;
                    }
                }
                var estimate = false;
                try
                {
                    if(settings.address)
                    {
                        estimate = settings.contract.transfer.estimateGas(settings.to, settings.value, {from: settings.from, gas: raw_tx.gasLimit, value: 0});
                    }
                }
                catch(err)
                {

                }
                
                if(estimate || !hex_data)
                {
                    var tx = new EthJS.Tx(raw_tx);
                    tx.sign(private_key);
                    var serialized_tx = tx.serialize();
                    web3.eth.sendRawTransaction('0x' + serialized_tx.toString('hex'), function(err, hash) 
                    {
                        if(hash && typeof callback == 'function')
                        {
                            callback(hash);
                        }
                        else
                        {
                            cortex.ux.modals('Error', '<p>Error sending transaction:</p><p>' + err + '</p>');
                        }
                    });
                }
                else
                {
                    cortex.ux.modals('Error', 'Unable to process transfer');
                }
            }
            else
            {
                cortex.ux.modals('Error', 'Missing required transfer information');
            }
        }
    },
    utils: {
        num: function(num)
        {
            if(num && typeof num.c != 'undefined')
            {
                var id = '';
                $.each(num.c, function(bit)
                {
                    if(bit > 0)
                    {
                        id+= ethereum_ux.utils.pad(num.c[bit], 14);
                    }
                    else
                    {
                        id+= num.c[bit];
                    }
                });
                return id;
            }
            else
            {
                return num;
            }
        },
        pad: function(n, width, z) 
        {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        },
        sorts: function(array, key)
        {
            array.sort(function(a, b) 
            {
                if(a[key] < b[key]) return -1;
                if(a[key] > b[key]) return 1;
                return 0;
            });
            return array;
        },
        title: function(str) 
        {
            var words = str.split(/(?=[A-Z])/);
            var text = words[0].toUpperCase();
            if(words.length > 1)
            {
                for(i = 1; i < words.length; i++)
                {
                    text = text + ' ' + words[i];
                }
            }
            return text.replace(/\w\S*/g, function(txt)
            {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
    },
    ux: function(name)
    {
        var abi = false;
        var results = {
            reads: [],
            writes: []
        };
        var options = ethereum_ux.config(name, ['abi']);
        if(options)
        {
            options.abi = ethereum_ux.utils.sorts(options.abi, 'name');
            $.each(options.abi, function(i)
            {
                var func = options.abi[i];
                if(typeof func.name != 'undefined')
                {
                    func.id = name.replace(' ', '-');
                    func.text = ethereum_ux.utils.title(func.name);
                    func.ins = 0;
                    func.outs = 0;
                    if(func.inputs.length > 0)
                    {
                        func.ins = func.inputs.length;
                        $.each(func.inputs, function(input)
                        {
                            func.inputs[input].index = i;
                            func.inputs[input].label = ethereum_ux.utils.title(func.inputs[input].name);
                        });
                    }
                    if(typeof func.outputs != 'undefined' && func.outputs.length > 0)
                    {
                        func.outs = func.outputs.length;
                        $.each(func.outputs, function(output)
                        {
                            func.outputs[output].index = i;
                            func.outputs[output].label = ethereum_ux.utils.title(func.outputs[output].name);
                        });
                    }
                    if(func.constant === true) results.reads.push(func);
                    if(func.constant === false) results.writes.push(func);
                }
            });
        }
        results.read = results.reads.length;
        results.write = results.writes.length;
        return results;
    },
    web: function(network)
    {
        return new Web3(new Web3.providers.HttpProvider(network), "utils");
    }
}