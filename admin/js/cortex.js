var exchange_rates = {
    MYR: {
        MYR: [1, 1],
        USD: [4, 1]
    },
    USD: {
        MYR: [1, 4],
        USD: [1, 1]
    }
};

var docElem = {};
var columnGrids = {};
var dragCounter = {};
var boardGrid = {};

Number.prototype.toFixedSpecial = function(n) {
    var str = this.toFixed(n);
    if (str.indexOf('e+') < 0)
        return str;

    // if number is in scientific notation, pick (b)ase and (p)ower
    return str.replace('.', '').split('e+').reduce(function(p, b) {
        return p + Array(b - p.length + 2).join(0);
    }) + '.' + Array(n + 1).join(0);
};

var cortex = {
    accounts: {
        check: function(username, password, account_id)
        {
            var salt = localStorage.getItem('bpcms_salt');
            var address = localStorage.getItem('bpcms_address');
            var network = localStorage.getItem('bpcms_network');
            var hash = ethereum_ux.crypto([salt, username, password]);
            var keys = ethereum_ux.keys(network + '_' + hash);
            if(keys.address == address)
            {
                keys.network = network;
                if(account_id)
                {
                    var main = false;
                    var net = network;
                    var accounts = cortex.accounts.get();
                    if(accounts)
                    {
                        $.each(accounts, function(a)
                        {
                            if(accounts[a].id == account_id)
                            {
                                net = accounts[a].network;
                                if(accounts[a].name == 'Personal')
                                {
                                    main = true;
                                }
                            }
                        });
                    }
                    if(main)
                    {
                        return keys;
                    }
                    else
                    {
                        keys = ethereum_ux.keys(network + '_' + hash + '_' + account_id);
                        keys.network = net;
                        return keys
                    }
                }
                else
                {
                    return keys;
                }
            }
            else
            {
                return false;
            }
        },
        get: function(name)
        {
            var account = false;
            var obj = localStorage.getItem('bpcms_accounts');
            if(typeof name != 'undefined')
            {
                var id = ethereum_ux.crypto([name]);
                obj = localStorage.getItem(id);
            }
            if(obj)
            {
                accounts = JSON.parse(obj);
                if(typeof name == 'undefined')
                {
                    account = [];
                    $.each(accounts, function(i)
                    {
                        var acc = JSON.parse(localStorage.getItem(accounts[i]));
                        account.push(acc);
                    });
                }
                else
                {
                    account = accounts;
                }
            }
            return account;
        },
        set: function(network, name, key, address, balance, txs)
        {
            if(typeof balance == 'undefined') balance = 0;
            if(typeof txs == 'undefined') txs = 0;
            var id = ethereum_ux.crypto([name]);
            var account = {
                id: id,
                name: name,
                key: key,
                address: address,
                network: network,
                balance: balance,
                txs: txs,
                tokens: {}
            };
            localStorage.setItem(id, JSON.stringify(account));
            var accounts = localStorage.getItem('bpcms_accounts');
            if(accounts)
            {
                accounts = JSON.parse(accounts);
                var got_account = false;
                $.each(accounts, function(i)
                {
                    if(accounts[i] == id) got_account = true;
                });
                if(!got_account)
                {
                    accounts.push(id);
                }
            }
            else
            {
                accounts = [];
                accounts.push(id);
            }
            localStorage.setItem('bpcms_accounts', JSON.stringify(accounts));
        }
    },
    assets: {
        get: function(account_id, token_id)
        {
            var assets = false;
            var accounts = cortex.accounts.get();
            if(accounts)
            {
                $.each(accounts, function(a)
                {
                    if(accounts[a].id == account_id)
                    {
                        if(
                            typeof accounts[a].tokens != 'undefined'
                            && $.isPlainObject(accounts[a].tokens)
                            && typeof accounts[a].tokens[token_id] != 'undefined'
                        ){
                            var token = accounts[a].tokens[token_id];
                            var options = ethereum_ux.abi(token.type);
                            var web3 = ethereum_ux.web(accounts[a].network);
                            var contract = web3.eth.contract(options).at(token.address);
                            var account_address = '0x' + accounts[a].address;
                            var tokens = contract.getAllTokens.call(account_address);
                            if($.isArray(tokens))
                            {
                                assets = [];
                                $.each(tokens, function(t)
                                {
                                    var id = tokens[t].toString();
                                    var meta = contract.metadata.call(id);
                                    assets.push({
                                        id: id,
                                        meta: meta
                                    });
                                });
                            }
                        }
                    }
                });
            }
            return assets;
        }
    },
    contracts: {
        get: function(name)
        {
            var contract = false;
            var obj = localStorage.getItem('bpcms_contracts');
            if(typeof name != 'undefined')
            {
                var id = ethereum_ux.crypto([name]);
                obj = localStorage.getItem(id);
            }
            if(obj)
            {
                contracts = JSON.parse(obj);
                if(typeof name == 'undefined')
                {
                    contract = [];
                    $.each(contracts, function(i)
                    {
                        var con = JSON.parse(localStorage.getItem(contracts[i]));
                        contract.push(con);
                    });
                }
                else
                {
                    contract = contracts;
                }
            }
            return contract;
        },
        import: function(temp, callback)
        {
            var template = false;
            if(typeof callback == 'undefined') callback = false;
            if(
                typeof ethereum_smart_contract_abis != 'undefined'
                && $.isPlainObject(ethereum_smart_contract_abis)
                && typeof ethereum_smart_contract_abis[temp] != 'undefined'
            ){
                template = ethereum_smart_contract_abis[temp];
            }
            if(template && $.isArray(template))
            {
                cortex.ux.loader(true, 'IMPORTING');
                $.each(template, function(t)
                {
                    var name = template[t].name;
                    var abi = template[t].abi;
                    var address = template[t].address;
                    var network = template[t].network;
                    var id = ethereum_ux.crypto([name]);
                    var saved_account = localStorage.getItem(id);
                    if(saved_account && !callback)
                    {
                        cortex.ux.modals('Warning', 'This contract already exists');
                    }
                    else
                    {
                        var contract = false;
                        try
                        {
                            var web3 = ethereum_ux.web(network);
                            var contract = web3.eth.contract(JSON.parse(abi)).at(address);
                        }
                        catch(err)
                        {

                        }
                        if(
                            contract 
                            && typeof contract.address != 'undefined'
                            && contract.address == address
                        )
                        {
                            cortex.contracts.set(network, name, address, abi);
                        }
                    }
                });
                if(!callback)
                {
                    $('.modal').modal('hide');
                    $('#sidebar a.active').trigger('click');
                }
                else
                {
                    cortex.ux.loader(false, 'LOADING');
                    if(typeof callback == 'function')
                    {
                        callback();
                    }
                }
            }
        },
        set: function(network, name, address, abi)
        {
            var id = ethereum_ux.crypto([name]);
            var contract = {
                id: id,
                name: name,
                address: address,
                network: network,
                abi: abi
            };
            localStorage.setItem(id, JSON.stringify(contract));
            var contracts = localStorage.getItem('bpcms_contracts');
            if(contracts)
            {
                contracts = JSON.parse(contracts);
                var got_contract = false;
                $.each(contracts, function(i)
                {
                    if(contracts[i] == id) got_contract = true;
                });
                if(!got_contract)
                {
                    contracts.push(id);
                }
            }
            else
            {
                contracts = [];
                contracts.push(id);
            }
            localStorage.setItem('bpcms_contracts', JSON.stringify(contracts));
        }
    },
    filters: function(data)
    {
        if(typeof data.app != 'undefined')
        {
            data.app.user = localStorage.getItem('bpcms_name');
        }
        if(typeof data.func != 'undefined')
        {
            if(data.func == 'accounts')
            {
                //data.contracts = scm_contract_abi;
                data.contracts = cortex.contracts.get();
                data.accounts = cortex.accounts.get();
                data.contract_count = data.contracts.length;
                data.contract_word = 'CONTRACTS';
                data.account_count = data.accounts.length;
                if(data.contract_count == 1) data.contract_word = 'CONTRACT'
                if($.isArray(data.accounts) && data.accounts.length > 0)
                {
                    $.each(data.accounts, function(a)
                    {
                        $.each(ethereum_secrets.networks, function(n)
                        {
                            if(data.accounts[a].network == ethereum_secrets.networks[n].address)
                            {
                                data.accounts[a].network = ethereum_secrets.networks[n].address;
                                data.accounts[a].netname = ethereum_secrets.networks[n].name;
                            }
                        });
                        var tokens = JSON.parse(JSON.stringify(data.accounts[a].tokens));
                        data.accounts[a].tokens = false;
                        if($.isPlainObject(tokens))
                        {
                            data.accounts[a].tokens = [];
                            $.each(tokens, function(id, token)
                            {
                                if(token.symbol == 'TRUSTS')
                                {
                                    if(typeof data.accounts[a].account_trusts == 'undefined')
                                    {
                                        data.accounts[a].account_trusts = [];
                                    }
                                    var stored_assets = cortex.assets.get(data.accounts[a].id, id);
                                    if(stored_assets && $.isArray(stored_assets))
                                    {
                                        data.trusts = true;
                                        $.each(stored_assets, function(ass)
                                        {
                                            var web3 = ethereum_ux.web(stored_assets[ass].network);
                                            var tid = web3.toBigNumber(stored_assets[ass].id).toString(10);
                                            
                                            data.accounts[a].account_trusts.push({
                                                tid: tid.toString(),
                                                meta: stored_assets[ass].meta,
                                                token: token
                                            });
                                        });
                                    }
                                }
                                if(token.symbol == 'MYR')
                                {
                                    var min = 0;
                                    var balance = parseInt((10**token.decimals) * parseFloat(token.balance));
                                    if(balance) min = 1;
                                    
                                    var step = 1;
                                    if(balance > 10) step = parseInt(balance / 10);
                                    if(balance > 100) step = parseInt(balance / 100);
                                    
                                    data.accounts[a].myr_min = min;
                                    data.accounts[a].myr_max = balance;
                                    data.accounts[a].myr_step = step;
                                    data.accounts[a].myr_start = min;
                                }
                                if(token.symbol == 'USD')
                                {
                                    var min = 0;
                                    var balance = parseInt((10**token.decimals) * parseFloat(token.balance));
                                    if(balance) min = 1;
                                    
                                    var step = 1;
                                    if(balance > 10) step = parseInt(balance / 10);
                                    if(balance > 100) step = parseInt(balance / 100);
                                    
                                    data.accounts[a].usd_min = min;
                                    data.accounts[a].usd_max = balance;
                                    data.accounts[a].usd_step = step;
                                    data.accounts[a].usd_start = min;
                                }
                                if(token.symbol == 'SCT')
                                {
                                    if(typeof data.accounts[a].sct_tokens == 'undefined')
                                    {
                                        data.accounts[a].sct_tokens = [];
                                    }
                                    var stored_assets = cortex.assets.get(data.accounts[a].id, id);
                                    if(stored_assets && $.isArray(stored_assets))
                                    {
                                        $.each(stored_assets, function(i)
                                        {
                                            data.accounts[a].sct_tokens.push(stored_assets[i]);
                                        });
                                    }
                                    
                                    var balance = parseInt(token.balance);
                                    var step = 1;
                                    
                                    if(balance > 10) step = parseInt(balance / 10);
                                    if(balance > 100) step = parseInt(balance / 100);
                                    
                                    data.accounts[a].sct_min = 0;
                                    data.accounts[a].sct_max = balance;
                                    data.accounts[a].sct_step = step;
                                    data.accounts[a].sct_start = balance;
                                }
                                if(token.symbol == 'LTT')
                                {
                                    if(typeof data.accounts[a].ltt_tokens == 'undefined')
                                    {
                                        data.accounts[a].ltt_tokens = [];
                                    }
                                    var stored_assets = cortex.assets.get(data.accounts[a].id, id);
                                    if(stored_assets && $.isArray(stored_assets))
                                    {
                                        $.each(stored_assets, function(i)
                                        {
                                            data.accounts[a].ltt_tokens.push(stored_assets[i]);
                                        });
                                    }
                                    
                                    var balance = parseInt(token.balance);
                                    var step = 1;
                                    
                                    if(balance > 10) step = parseInt(balance / 10);
                                    if(balance > 100) step = parseInt(balance / 100);
                                    
                                    data.accounts[a].ltt_min = 0;
                                    data.accounts[a].ltt_max = balance;
                                    data.accounts[a].ltt_step = step;
                                    data.accounts[a].ltt_start = balance;
                                }
                                data.accounts[a].tokens.push({
                                    tid: id,
                                    token: token
                                });
                            });
                        }
                    });
                }
            }
            else
            {
                data.func = false;
            }
        }
        if(
            typeof data.contracts != 'undefined'
            && $.isArray(data.contracts)
        ){
            $.each(data.contracts, function(i)
            {
                var name = data.contracts[i].name;
                data.contracts[i].web3 = ethereum_ux.ux(name);
            });
        }
        return data;
    },
    init: function()
    {
        if(
            (
                is_secretly_logged_in == 'false'
            )
            &&
            (
                window.location.href != ethereum_secrets.url
                && window.location.href != ethereum_secrets.url + 'register/'
            )
        )
        {
            window.location.href = ethereum_secrets.url;
        }
        else
        {
            cortex.ux.html(function()
            {
                cortex.ux.qr();
                cortex.ux.ajax();
                cortex.ux.plugins();
                cortex.ux.buttons();
                cortex.ux.tables();
                cortex.ux.contracts();
                cortex.ux.forms.contracts();
                cortex.ux.forms.selects();
                cortex.ux.forms.accounts();
                cortex.ux.forms.tokens();
                cortex.ux.forms.recover();
                cortex.ux.forms.transfer();
                cortex.ux.forms.plugins();
                cortex.ux.loader(false);
                $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) 
                {
                    var id = $(this).attr('data-id');
                    cortex.ux.plugins(id);
                });
            });
        }
    },
    ux: {
        ajax: function()
        {
            $('body').on('click', '#sidebar a', function(e)
            {
                e.preventDefault();
                var button = $(this);
                var href = $(button).attr('href');
                $('#sidebar a').removeClass('active');
                $(button).addClass('active');
                window.history.pushState(true, document.title, window.location.href + href);
                $("html, body, #content").animate({
                    scrollTop: 0
                }, 450);
                $('#content').animate({left: '-100%'}, 350, function()
                {
                    $('#loading-wrapper-content').addClass('loading');
                    $('#content').css({left: 0});
                    
                    $.ajax({
                        url: window.location.href,
                        dataType: 'html',
                        success: function(res)
                        {
                            var removeScripts = function(a,b){with(new Option){innerHTML=a;for(a=getElementsByTagName('script');b=a[0];)b.parentNode.removeChild(b);return innerHTML}};
                            var content = removeScripts(res);
                            $('body').append('<div id="tempDiv" style="display:none;">'+content+'</div>');
                            var contents = $('#tempDiv').find('#content').html();
                            var title = $('#tempDiv').find('title').text();
                            $('#tempDiv').remove();
                            var data = cortex.filters(ethereum_contracts);
                            var html = Mustache.render(contents, data);
                            $('title').text(title);
                            $('#content').html(html);
                            $('#loading-wrapper-content').addClass('loading');
                            
                            cortex.ux.qr();
                            cortex.ux.plugins();
                            cortex.ux.tables();
                            cortex.ux.forms.selects();
                            
                            $('#content').css({left: '100%', right: '-100%'});
                            $('#loading-wrapper-content').removeClass('loading');
                            
                            $('#content').animate({left: 0, right: 0}, 350, function()
                            {
                                cortex.ux.loader(false, 'LOADING');
                                $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) 
                                {
                                    var id = $(this).attr('data-id');
                                    cortex.ux.plugins(id);
                                });
                            });
                        }
                    });
                });
            });
        },
        buttons: function()
        {
            $('body').on('click', '.btn-asset-toggler', function(e)
            {
                e.preventDefault();
                var id = $(this).attr('data-id');
                var uid = id.split('-')[1];
                var text = $(this).attr('data-text');
                $(this).attr('data-text', $(this).text());
                $(this).text(text);
                $('#' + id).toggle(300, function()
                {
                    setTimeout(function()
                    {
                        $.each(columnGrids[uid], function(c)
                        {
                            columnGrids[uid][c].send(0, columnGrids[uid][c], 0);
                            columnGrids[uid][c].refreshItems();
                            columnGrids[uid][c].layout();
                        });
                    }, 350);
                });
                
            });
            $('body').on('click', '.btn-switch-toggle', function(e)
            {
                e.preventDefault();
                var elem = $(this).parent().parent().parent().parent().parent().find('.bootslider');
                var eid = $(elem).attr('data-slider-id');
                var val = parseInt($(elem).attr('data-value'));
                if($(this).parent().find('.btn:first-child').hasClass('active'))
                {
                    var value = val + 1;
                }
                else
                {
                    var value = val - 1;
                }
                $(elem).slider('setValue', value);
                $(this).find('.btn').toggleClass('active');  
                if ($(this).find('.btn-plain').size()>0) 
                {
                    $(this).find('.btn').toggleClass('btn-plain');
                }
                if ($(this).find('.btn-danger').size()>0) 
                {
                    $(this).find('.btn').toggleClass('btn-danger');
                }
                if ($(this).find('.btn-success').size()>0) 
                {
                    $(this).find('.btn').toggleClass('btn-success');
                }
                if ($(this).find('.btn-info').size()>0) 
                {
                    $(this).find('.btn').toggleClass('btn-info');
                }
                $(this).find('.btn').toggleClass('btn-primary');
            });
            $('body').on('click', '.btn-tabber', function(e)
            {
                e.preventDefault();
                var id = $(this).attr('data-id');
                $('a[href="#trust-' + id + '"]').trigger('click');
            });
            $('body').on('click', '.btn-logout', function(e)
            {
                e.preventDefault();
                localStorage.removeItem('bpcms_key');
                localStorage.removeItem('bp_login_state');
                window.location.href = ethereum_secrets.url;
            });
            $('body').on('click', '.btn-clear-device', function(e)
            {
                e.preventDefault();
                localStorage.removeItem('bpcms_key');
                localStorage.removeItem('bpcms_address');
                localStorage.removeItem('bpcms_salt');
                localStorage.removeItem('bpcms_network');
                localStorage.removeItem('bpcms_name');
                var accounts = cortex.accounts.get();
                $.each(accounts, function(i)
                {
                    localStorage.removeItem(accounts[i].id);
                });
                localStorage.removeItem('bpcms_accounts');
                var contracts = cortex.contracts.get();
                $.each(contracts, function(i)
                {
                    localStorage.removeItem(contracts[i].id);
                });
                localStorage.removeItem('bpcms_contracts');
                window.location.href = ethereum_secrets.url;
            });
            $('body').on('click', '.btn-function-toggler', function(e)
            {
                e.preventDefault();
                var button = this;
                var text = $(button).text();
                var form = $(this).parent().parent();
                var panel = $(form).find('.hidden-function');
                $(panel).toggle();
                $(button).text($(button).attr('data-text'));
                $(button).attr('data-text', text);
            });
            $('body').on('click', '.btn-panel-toggler', function(e)
            {
                e.preventDefault();
                var button = this;
                var text = $(button).text();
                var panel = $(this).parent().parent().parent();
                var hidden = $(panel).find('.hidden-panel');
                $(hidden).toggle();
                $(button).text($(button).attr('data-text'));
                $(button).attr('data-text', text);
            });
            $('body').on('click', '.btn-sidebar-toggler', function(e)
            {
                e.preventDefault();
                var button = this;
                var old_text = $(button).text();
                var new_text = $(button).attr('data-text');
                var old_text = $(button).text();
                $(button).attr('data-text', old_text);
                $(button).text(new_text);
                if(old_text != 'CLOSE')
                {
                    $('.toggled-content').removeClass('col-md-12');
                    $('.toggled-content').addClass('col-md-7');
                    $('.toggled-sidebar').show();
                }
                else
                {
                    $('.toggled-sidebar').hide();
                    $('.toggled-content').addClass('col-md-12');
                    $('.toggled-content').removeClass('col-md-7');
                }
            });
            $('body').on('click', '.toggle-more', function(e)
            {
                e.preventDefault();
                var button = this;
                var old_text = 'More';
                var new_text = 'Less';
                if($(button).text() == old_text) $(button).text(new_text);
                else $(button).text(old_text);
                $('.hidden-field').each(function()
                {
                    $(this).toggle();
                });
            });
            $('body').on('change', 'select.select-function', function(e)
            {
                e.preventDefault();
                var name = $(this).val();
                $('.function-inputs').hide();
                $('#' + name).show();
            });
            $('body').on('click', '.btn-account-new', function(e)
            {
                e.preventDefault();
                var button = $(this);
                var selector = $('#new-account-modal');
                $(selector).modal('show');
            });
            $('body').on('click', '.btn-contract-new', function(e)
            {
                e.preventDefault();
                var button = $(this);
                var selector = $('#new-contract-modal');
                $(selector).modal('show');
            });
            $('body').on('click', '.btn-contract-template', function(e)
            {
                e.preventDefault();
                var button = $(this);
                var selector = $('#import-template-modal');
                $(selector).modal('show');
            });
            $('body').on('click', '.btn-add-tokens', function(e)
            {
                e.preventDefault();
                var button = $(this);
                var id = $(button).attr('data-id');
                var selector = $('#add-modal');
                $(selector).find('#account').val(id);
                $(selector).modal('show');
            });
            $('body').on('click', '.btn-scan-accounts', function(e)
            {
                e.preventDefault();
                cortex.ux.loader(true, 'FETCHING');
                $('.btn-scan-account').each(function(i)
                {
                    var button = $(this);
                    var network = $(button).attr('data-network');
                    var address = $(button).attr('data-address');
                    var web3 = ethereum_ux.web(network);
                    var value = web3.eth.getBalance('0x'+address);
                    var balance = value.dividedBy(1000000000000000000).toString();
                    var txs = web3.eth.getTransactionCount('0x'+address).toString();
                    var accounts = localStorage.getItem('bpcms_accounts');
                    if(accounts)
                    {
                        accounts = JSON.parse(accounts);
                        $.each(accounts, function(i)
                        {
                            var id = accounts[i];
                            var account = JSON.parse(localStorage.getItem(id));
                            if(account.address == address)
                            {
                                account.balance = balance;
                                account.txs = txs;
                            }
                            localStorage.setItem(id, JSON.stringify(account));
                        });
                    }
                    if((i + 1) == $('body').find('.btn-scan-account').length)
                    {
                        if($('body').find('.btn-scan-token').length > 0)
                        {
                            $('.btn-scan-token').each(function(t)
                            {
                                var button = $(this);
                                var account_id = $(button).attr('data-account');
                                var token_id = $(button).attr('data-token');
                                var accounts = cortex.accounts.get();
                                if(accounts)
                                {
                                    $.each(accounts, function(a)
                                    {
                                        if(accounts[a].id == account_id)
                                        {
                                            if(
                                                typeof accounts[a].tokens[token_id] != 'undefined'
                                                && typeof accounts[a].tokens[token_id].type != 'undefined'
                                                && 
                                                (
                                                    accounts[a].tokens[token_id].type == 'erc20'
                                                    || accounts[a].tokens[token_id].type == 'erc721'
                                                )
                                            )
                                            {
                                                var decimals = 0;
                                                var token = accounts[a].tokens[token_id];
                                                var options = ethereum_ux.abi(token.type);
                                                var web3 = ethereum_ux.web(accounts[a].network);
                                                var contract = web3.eth.contract(options).at(token.address);
                                                var balance = parseInt(contract.balanceOf('0x' + accounts[a].address).toString());
                                                if(accounts[a].tokens[token_id].type == 'erc20')
                                                {
                                                    var decimals = parseInt(contract.decimals());
                                                    balance = parseFloat(contract.balanceOf('0x' + accounts[a].address).dividedBy(10**decimals).toString()).toFixed(decimals);
                                                }
                                                accounts[a].tokens[token_id].decimals = decimals;
                                                accounts[a].tokens[token_id].balance = balance;
                                                localStorage.setItem(account_id, JSON.stringify(accounts[a]));
                                            }
                                            if((t + 1) == $('body').find('.btn-scan-token').length)
                                            {
                                                $('#sidebar a.active').trigger('click');
                                            }
                                        }
                                    });
                                }
                            });
                        }
                        else
                        {
                            $('#sidebar a.active').trigger('click');
                        }
                    }
                });
            });
            $('body').on('click', '.btn-scan-account', function(e)
            {
                cortex.ux.loader(true, 'FETCHING');
                e.preventDefault();
                var button = $(this);
                var network = $(button).attr('data-network');
                var address = $(button).attr('data-address');
                var web3 = ethereum_ux.web(network);
                var value = web3.eth.getBalance('0x'+address);
                var balance = value.dividedBy(1000000000000000000).toString();
                var txs = web3.eth.getTransactionCount('0x'+address).toString();
                var accounts = localStorage.getItem('bpcms_accounts');
                if(accounts)
                {
                    accounts = JSON.parse(accounts);
                    $.each(accounts, function(i)
                    {
                        var id = accounts[i];
                        var account = JSON.parse(localStorage.getItem(id));
                        if(account.address == address)
                        {
                            account.balance = balance;
                            account.txs = txs;
                        }
                        localStorage.setItem(id, JSON.stringify(account));
                    });
                    $('#sidebar a.active').trigger('click');
                }
            });
            $('body').on('click', '.btn-send-account', function(e)
            {
                e.preventDefault();
                var button = $(this);
                var network = $(button).attr('data-network');
                var address = $(button).attr('data-address');
                var id = $(button).attr('data-id');
                var selector = $('#send-modal');
                $(selector).find('#transfer_from').val(id).parent().parent().hide();
                $(selector).modal('show');
            });
            $('body').on('click', '.btn-remove-contract', function(e)
            {
                cortex.ux.loader(true);
                e.preventDefault();
                var contracts = [];
                var button = $(this);
                var contract_id = $(button).attr('data-id');
                var current_contracts = cortex.contracts.get();
                if(current_contracts)
                {
                    $.each(current_contracts, function(c)
                    {
                        if(current_contracts[c].id != contract_id)
                        {
                            contracts.push(current_contracts[c].id);
                        }
                        else
                        {
                            localStorage.removeItem(contract_id);
                        }
                    });
                    localStorage.setItem('bpcms_contracts', JSON.stringify(contracts));
                    $('#sidebar a.active').trigger('click');
                }
            });
            $('body').on('click', '.btn-remove-all-contracts', function(e)
            {
                cortex.ux.loader(true);
                e.preventDefault();
                var button = $(this);
                var current_contracts = cortex.contracts.get();
                if(current_contracts)
                {
                    $.each(current_contracts, function(c)
                    {
                        localStorage.removeItem(current_contracts[c].id);
                    });
                    localStorage.setItem('bpcms_contracts', JSON.stringify([]));
                    $('#sidebar a.active').trigger('click');
                }
            });
            $('body').on('click', '.btn-remove-account', function(e)
            {
                cortex.ux.loader(true);
                e.preventDefault();
                var accounts = [];
                var button = $(this);
                var account_id = $(button).attr('data-id');
                var current_accounts = cortex.accounts.get();
                if(current_accounts)
                {
                    $.each(current_accounts, function(a)
                    {
                        if(current_accounts[a].id != account_id)
                        {
                            accounts.push(current_accounts[a].id);
                        }
                        else
                        {
                            localStorage.removeItem(account_id);
                        }
                    });
                    localStorage.setItem('bpcms_accounts', JSON.stringify(accounts));
                    $('#sidebar a.active').trigger('click');
                }
            });
            $('body').on('click', '.btn-remove-token', function(e)
            {
                cortex.ux.loader(true);
                e.preventDefault();
                var accounts = [];
                var button = $(this);
                var account_id = $(button).attr('data-account');
                var token_id = $(button).attr('data-token');
                var current_accounts = cortex.accounts.get();
                if(current_accounts)
                {
                    $.each(current_accounts, function(a)
                    {
                        if(
                            typeof current_accounts[a].tokens != 'undefined'
                            && current_accounts[a].id == account_id
                        ){
                            var tokens = {};
                            $.each(current_accounts[a].tokens, function(id, token)
                            {
                                if(id != token_id)
                                {
                                    tokens[id] = JSON.parse(JSON.stringify(current_accounts[a].tokens[id]));
                                }
                            });
                            current_accounts[a].tokens = tokens;
                            localStorage.setItem(account_id, JSON.stringify(current_accounts[a]));
                            $('#sidebar a.active').trigger('click');
                        } 
                    });
                }
            });
            $('body').on('click', '.btn-send-token', function(e)
            {
                e.preventDefault();
                var button = $(this);
                var account_id = $(button).attr('data-account');
                var token_id = $(button).attr('data-token');
                var selector = $('#send-token-modal');
                $(selector).find('#account').val(account_id);
                $(selector).find('#token').val(token_id);
                $(selector).modal('show');
            });
            $('body').on('click', '.btn-send-asset', function(e)
            {
                e.preventDefault();
                var button = $(this);
                var account_id = $(button).attr('data-account');
                var token_id = $(button).attr('data-token');
                var selector = $('#send-asset-modal');
                var assets = cortex.assets.get(account_id, token_id);
                if(assets && $.isArray(assets))
                {
                    var results = '';
                    var select = $(selector).find('#transfer_value');
                    $.each(assets, function(a)
                    {
                        var web3 = ethereum_ux.web(accounts[a].network);
                        results = results + '<option value="' + web3.toBigNumber(assets[a].id).toString(10) + '">' + assets[a].meta + '</option>';
                    });
                    $(select).html(results);
                }
                $(selector).find('#account').val(account_id);
                $(selector).find('#token').val(token_id);
                $(selector).modal('show');
            });
            $('body').on('click', '.btn-scan-token', function(e)
            {
                cortex.ux.loader(true);
                e.preventDefault();
                var button = $(this);
                var account_id = $(button).attr('data-account');
                var token_id = $(button).attr('data-token');
                var accounts = cortex.accounts.get();
                if(accounts)
                {
                    $.each(accounts, function(a)
                    {
                        if(accounts[a].id == account_id)
                        {
                            if(
                                typeof accounts[a].tokens[token_id] != 'undefined'
                                && typeof accounts[a].tokens[token_id].type != 'undefined'
                                && 
                                (
                                    accounts[a].tokens[token_id].type == 'erc20'
                                    || accounts[a].tokens[token_id].type == 'erc721'
                                )
                            )
                            {
                                var decimals = 0;
                                var token = accounts[a].tokens[token_id];
                                var options = ethereum_ux.abi(token.type);
                                var web3 = ethereum_ux.web(accounts[a].network);
                                var contract = web3.eth.contract(options).at(token.address);
                                var balance = parseInt(contract.balanceOf('0x' + accounts[a].address).toString());
                                if(accounts[a].tokens[token_id].type == 'erc20')
                                {
                                    var decimals = parseInt(contract.decimals());
                                    balance = parseFloat(contract.balanceOf('0x' + accounts[a].address).dividedBy(10**decimals).toString()).toFixed(decimals);
                                }
                                accounts[a].tokens[token_id].decimals = decimals;
                                accounts[a].tokens[token_id].balance = balance;
                                localStorage.setItem(account_id, JSON.stringify(accounts[a]));
                                $('#sidebar a.active').trigger('click');
                            }
                        }
                    });
                }
            });
        },
        contracts: function()
        {
            // Mark Smalley = 007 = 0xB7a43A245e12b69Fd035EA95E710d17e71449f96
            // John Smith = 123 = 0xA0d2736e921249278dA7E872694Ae25a38FB050f
            // Polly Kettle = 007007 = 0xb1412Dad936FADC80ce972C1C1Fe78889B222c2C
            // Floyd Flinkle = 700700 = 0x7201aE4BD0d6cC4D8DB89D5C0E699FA1E78fd431
            jQuery('body').on('submit', 'form.read-functions', function(c)
            {
                c.preventDefault();
                var abi = false;
                var form = this;
                var scanner = jQuery(form).find('.btn-function-toggler');
                var func = jQuery(form).attr('data-func');
                var name = jQuery(form).attr('data-name');
                var inputs = jQuery(form).find('.data-input');
                var contract = ethereum_ux.contract(name);
                if(jQuery(scanner).attr('data-text') == 'CLOSE')
                {
                    jQuery(scanner).trigger('click');
                }
                jQuery.each(contract._abi, function(a)
                {
                    if(
                        typeof contract._abi[a].name != 'undefined'
                        && contract._abi[a].name == func
                    ){
                        abi = contract._abi[a];
                    }
                });
                if(inputs.length < 1)
                {
                    var results = contract[func]();
                }
                else if(inputs.length == 1)
                {
                    var results = contract[func](jQuery(inputs[0]).val());
                }
                else if(inputs.length == 2)
                {
                    var results = contract[func](
                        jQuery(inputs[0]).val(),
                        jQuery(inputs[1]).val()
                    );
                }
                else if(inputs.length == 3)
                {
                    var results = contract[func](
                        jQuery(inputs[0]).val(),
                        jQuery(inputs[1]).val(),
                        jQuery(inputs[2]).val()
                    );
                }
                else if(inputs.length == 4)
                {
                    var results = contract[func](
                        jQuery(inputs[0]).val(),
                        jQuery(inputs[1]).val(),
                        jQuery(inputs[2]).val(),
                        jQuery(inputs[3]).val()
                    );
                }
                
                if(jQuery.isArray(results))
                {
                    var result = '';
                    for(o = 0; o < abi.outputs.length; o++)
                    {
                        if(o > 0) result+= "\n";
                        
                        var is_array = false;
                        if(abi.outputs[o].type.indexOf('[]') > -1)
                        {
                            is_array = true;
                        }
                        
                        if(is_array)
                        {
                            jQuery.each(results, function(r)
                            {
                                if(r > 0) result+= ", ";
                                result+= ethereum_ux.utils.num(results[r]);
                            });
                        }
                        else
                        {
                            if(jQuery.isArray(results[o]))
                            {
                                result+= ethereum_ux.utils.title(
                                    abi.outputs[o].name
                                ) + ":\n";
                                jQuery.each(results[o], function(r)
                                {
                                    if(r > 0) result = result + "\n";
                                    result = result + ethereum_ux.utils.num(results[o][r]);
                                });
                            }
                            else
                            {
                                result+= ethereum_ux.utils.title(
                                    abi.outputs[o].name
                                ) + ': ' + ethereum_ux.utils.num(results[o]);
                            }
                        }
                    };
                    results = result;
                }
                else if(typeof results.c != 'undefined')
                {
                    results = ethereum_ux.utils.num(results);
                }
                jQuery(form).find('textarea').html(results.toString());
                setTimeout(function(e)
                {
                    jQuery(form).trigger('submit');
                }, 60000);
            });
        },
        form: {
            group: function(id, label, alt, type, readonly, value)
            {
                var html = '';
                if(typeof type == 'undefined') type = 'text';
                if(typeof readonly == 'undefined') readonly = '';
                if(typeof value == 'undefined') value = '';
                else readonly = 'readonly="readonly"';
                if(type != 'hidden')
                {
                    html+= '<div class="form-group">';
                    html+= '<label for="'+id+'" class="col-sm-4 control-label">';
                    html+= label;
                    html+= '</label>';
                    html+= '<div class="col-sm-8">';
                }
                
                html+= '<input id="' + id + '" class="form-control" placeholder="' + alt + '" type="' + type + '" ' + readonly + ' value="' + value + '">';
                
                if(type != 'hidden')
                {
                    html+= '</div>';
                    html+= '</div>';
                }
                return html;
            }
        },
        forms: {
            accounts: function()
            {
                $('body').on('submit', 'form.new-account', function(e)
                {
                    e.preventDefault();
                    var form = $(this);
                    var network = $(form).find('#network').val();
                    var name = $(form).find('#accountname').val();
                    var username = $(form).find('#username').val();
                    var password = $(form).find('#password').val();
                    var net = localStorage.getItem('bpcms_network');
                    var salt = localStorage.getItem('bpcms_salt');
                    var address = localStorage.getItem('bpcms_address');
                    var hash = ethereum_ux.crypto([salt, username, password]);
                    var keys = ethereum_ux.keys(net + '_' + hash);
                    if(network && username && password && name)
                    {
                        if(keys.address == address)
                        {
                            var id = ethereum_ux.crypto([name]);
                            if(localStorage.getItem(id))
                            {
                                cortex.ux.modals('Warning', 'This account already exists: ' + id);
                            }
                            else
                            {
                                cortex.ux.loader(true);
                                var account = ethereum_ux.keys(network + '_' + hash + '_' + id);
                                var web3 = ethereum_ux.web(network);
                                var value = web3.eth.getBalance('0x'+account.address);
                                var balance = value.dividedBy(1000000000000000000).toString();
                                var txs = web3.eth.getTransactionCount('0x'+account.address).toString();
                                cortex.accounts.set(network, name, account.public, account.address, balance, txs);
                                $('.modal').modal('hide');
                                $('#sidebar a.active').trigger('click');
                            }
                        }
                        else
                        {
                            cortex.ux.modals('Warning', 'Username and password are not valid');
                        }
                    }
                    else
                    {
                        cortex.ux.modals('Warning', 'All fields are required');
                    }
                });
            },
            plugins: function()
            {
                if(
                    typeof ethereum_secrets.plugins != 'undefined'
                    && $.isPlainObject(ethereum_secrets.plugins)
                ){
                    $.each(ethereum_secrets.plugins, function(id, plugin)
                    {
                        if(typeof cortex.ux.forms[id] == 'function')
                        {
                            cortex.ux.forms[id]();
                        }
                    });
                }
            },
            contracts: function()
            {
                $('body').on('submit', 'form.import-template', function(e)
                {
                    e.preventDefault();
                    var form = $(this);
                    var template = false;
                    if(
                        typeof ethereum_smart_contract_abis != 'undefined'
                        && $.isPlainObject(ethereum_smart_contract_abis)
                        && typeof ethereum_smart_contract_abis[$(form).find('#template').val()] != 'undefined'
                    ){
                        template = ethereum_smart_contract_abis[$(form).find('#template').val()];
                    }
                    if(template && $.isArray(template))
                    {
                        cortex.ux.loader(true);
                        $.each(template, function(t)
                        {
                            var name = template[t].name;
                            var abi = template[t].abi;
                            var address = template[t].address;
                            var network = template[t].network;
                            var id = ethereum_ux.crypto([name]);
                            var saved_account = localStorage.getItem(id);
                            if(saved_account)
                            {
                                cortex.ux.modals('Warning', 'This contract already exists');
                            }
                            else
                            {
                                var contract = false;
                                try
                                {
                                    var web3 = ethereum_ux.web(network);
                                    var contract = web3.eth.contract(JSON.parse(abi)).at(address);
                                }
                                catch(err)
                                {

                                }
                                if(
                                    contract 
                                    && typeof contract.address != 'undefined'
                                    && contract.address == address
                                )
                                {
                                    cortex.contracts.set(network, name, address, abi);
                                }
                            }
                        });
                        $('.modal').modal('hide');
                        $('#sidebar a.active').trigger('click');
                    }
                });
                $('body').on('submit', 'form.new-contract', function(e)
                {
                    e.preventDefault();
                    var form = $(this);
                    var network = $(form).find('#network').val();
                    var name = $(form).find('#contractname').val();
                    var address = $(form).find('#contractaddress').val();
                    var abi = $(form).find('#contractabi').val();
                    if(network && name && address && abi)
                    {
                        var id = ethereum_ux.crypto([name]);
                        var saved_account = localStorage.getItem(id);
                        if(saved_account)
                        {
                            cortex.ux.modals('Warning', 'This contract already exists');
                        }
                        else
                        {
                            var contract = false;
                            try
                            {
                                var web3 = ethereum_ux.web(network);
                                var contract = web3.eth.contract(JSON.parse(abi)).at(address);
                            }
                            catch(err)
                            {
                                
                            }
                            if(
                                contract 
                                && typeof contract.address != 'undefined'
                                && contract.address == address
                            )
                            {
                                cortex.ux.loader(true);
                                cortex.contracts.set(network, name, address, abi);
                                $('.modal').modal('hide');
                                $('#sidebar a.active').trigger('click');
                            }
                            else
                            {
                                cortex.ux.modals('Warning', 'Invalid contract details');
                            }
                        }
                    }
                    else
                    {
                        cortex.ux.modals('Warning', 'All fields required');
                    }
                });
                $('body').on('submit', 'form.function-inputs', function(e)
                {
                    e.preventDefault();
                    var paid = 0;
                    var form = $(this);
                    var payables = $(form).find('.form-group.payable').length;
                    var inputs = $(form).find('input').length - ( 2 + payables );
                    var contract_name = $(form).attr('data-name');
                    var contract_func = $(form).attr('data-func');
                    var account_id = $(form).find('#'+contract_name+'-'+contract_func+'-account').val();
                    var username = $(form).find('#'+contract_name+'-'+contract_func+'-username').val();
                    var password = $(form).find('#'+contract_name+'-'+contract_func+'-password').val();
                    if(payables)
                    {
                        paid = $(form).find('.form-group.payable').find('input').val();
                    }
                    if(account_id && username && password)
                    {
                        var from = 0;
                        var name = false;
                        var network = false;
                        var accounts = cortex.accounts.get();
                        if(accounts)
                        {
                            $.each(accounts, function(a)
                            {
                                if(accounts[a].id == account_id)
                                {
                                    name = accounts[a].name;
                                    from = accounts[a].address;
                                    network = accounts[a].network;
                                }
                            });
                        }
                        var net = localStorage.getItem('bpcms_network');
                        var salt = localStorage.getItem('bpcms_salt');
                        var address = localStorage.getItem('bpcms_address');
                        var hash = ethereum_ux.crypto([salt, username, password]);
                        var keys = ethereum_ux.keys(net + '_' + hash);
                        if(keys.address == address)
                        {
                            cortex.ux.loader(true, 'CALLING');
                            if(name != 'Personal') keys = ethereum_ux.keys(net + '_' + hash + '_' + account_id);
                            var web3 = ethereum_ux.web(network);
                            var contract = ethereum_ux.contract(contract_name);
                            
                            var settings = {
                                network: network,
                                key: keys.private,
                                from: '0x' + from,
                                to: contract.address,
                                value: paid
                            }
                            var web3 = ethereum_ux.web(settings.network);
                            var ether_to_send = web3.fromDecimal(web3.toWei(settings.value), 'ether');
                            var private_key = new Buffer(settings.key, 'hex');
                            var block = web3.eth.getBlock('latest');
                            var gas_limit = 0;
                            var raw_tx = {
                                from: settings.from,
                                nonce: web3.eth.getTransactionCount(settings.from),
                                gasPrice: web3.eth.gasPrice.toNumber(),
                                gasLimit: block.gasLimit,
                                to: settings.to, 
                                value: ether_to_send
                            };
                            var estimate = false;
                            function ia(val)
                            {
                                if(val)
                                {
                                    if(
                                        val.charAt(0) == '['
                                        && val.slice(-1) == ']'
                                    ){
                                        val = JSON.parse(val);
                                    }
                                }
                                return val;
                            }
                            
                            if(inputs == 0)
                            {
                                raw_tx.data = contract[contract_func].getData();
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            else if(inputs == 1)
                            {
                                raw_tx.data = contract[contract_func].getData(
                                    ia($(form).find('input:eq(0)').val())
                                );
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        ia($(form).find('input:eq(0)').val()), 
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            else if(inputs == 2)
                            {
                                raw_tx.data = contract[contract_func].getData(
                                    ia($(form).find('input:eq(0)').val()), 
                                    ia($(form).find('input:eq(1)').val())
                                );
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        ia($(form).find('input:eq(0)').val()), 
                                        ia($(form).find('input:eq(1)').val()),
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            else if(inputs == 3)
                            {
                                raw_tx.data = contract[contract_func].getData(
                                    ia($(form).find('input:eq(0)').val()), 
                                    ia($(form).find('input:eq(1)').val()),
                                    ia($(form).find('input:eq(2)').val())
                                );
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        ia($(form).find('input:eq(0)').val()), 
                                        ia($(form).find('input:eq(1)').val()),
                                        ia($(form).find('input:eq(2)').val()),
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            else if(inputs == 4)
                            {
                                raw_tx.data = contract[contract_func].getData(
                                    ia($(form).find('input:eq(0)').val()),
                                    ia($(form).find('input:eq(1)').val()),
                                    ia($(form).find('input:eq(2)').val()),
                                    ia($(form).find('input:eq(3)').val())
                                );
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        ia($(form).find('input:eq(0)').val()), 
                                        ia($(form).find('input:eq(1)').val()),
                                        ia($(form).find('input:eq(2)').val()),
                                        ia($(form).find('input:eq(3)').val()),
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            else if(inputs == 5)
                            {
                                raw_tx.data = contract[contract_func].getData(
                                    ia($(form).find('input:eq(0)').val()), 
                                    ia($(form).find('input:eq(1)').val()),
                                    ia($(form).find('input:eq(2)').val()),
                                    ia($(form).find('input:eq(3)').val()),
                                    ia($(form).find('input:eq(4)').val())
                                );
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        ia($(form).find('input:eq(0)').val()), 
                                        ia($(form).find('input:eq(1)').val()),
                                        ia($(form).find('input:eq(2)').val()),
                                        ia($(form).find('input:eq(3)').val()),
                                        ia($(form).find('input:eq(4)').val()),
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            else if(inputs == 6)
                            {
                                raw_tx.data = contract[contract_func].getData(
                                    ia($(form).find('input:eq(0)').val()), 
                                    ia($(form).find('input:eq(1)').val()),
                                    ia($(form).find('input:eq(2)').val()),
                                    ia($(form).find('input:eq(3)').val()),
                                    ia($(form).find('input:eq(4)').val()),
                                    ia($(form).find('input:eq(5)').val())
                                );
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        ia($(form).find('input:eq(0)').val()), 
                                        ia($(form).find('input:eq(1)').val()),
                                        ia($(form).find('input:eq(2)').val()),
                                        ia($(form).find('input:eq(3)').val()),
                                        ia($(form).find('input:eq(4)').val()),
                                        ia($(form).find('input:eq(5)').val()),
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            else if(inputs == 7)
                            {
                                raw_tx.data = contract[contract_func].getData(
                                    ia($(form).find('input:eq(0)').val()), 
                                    ia($(form).find('input:eq(1)').val()),
                                    ia($(form).find('input:eq(2)').val()),
                                    ia($(form).find('input:eq(3)').val()),
                                    ia($(form).find('input:eq(4)').val()),
                                    ia($(form).find('input:eq(5)').val()),
                                    ia($(form).find('input:eq(6)').val())
                                );
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        ia($(form).find('input:eq(0)').val()), 
                                        ia($(form).find('input:eq(1)').val()),
                                        ia($(form).find('input:eq(2)').val()),
                                        ia($(form).find('input:eq(3)').val()),
                                        ia($(form).find('input:eq(4)').val()),
                                        ia($(form).find('input:eq(5)').val()),
                                        ia($(form).find('input:eq(6)').val()),
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            else if(inputs == 8)
                            {
                                raw_tx.data = contract[contract_func].getData(
                                    ia($(form).find('input:eq(0)').val()), 
                                    ia($(form).find('input:eq(1)').val()),
                                    ia($(form).find('input:eq(2)').val()),
                                    ia($(form).find('input:eq(3)').val()),
                                    ia($(form).find('input:eq(4)').val()),
                                    ia($(form).find('input:eq(5)').val()),
                                    ia($(form).find('input:eq(6)').val()),
                                    ia($(form).find('input:eq(7)').val())
                                );
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        ia($(form).find('input:eq(0)').val()), 
                                        ia($(form).find('input:eq(1)').val()),
                                        ia($(form).find('input:eq(2)').val()),
                                        ia($(form).find('input:eq(3)').val()),
                                        ia($(form).find('input:eq(4)').val()),
                                        ia($(form).find('input:eq(5)').val()),
                                        ia($(form).find('input:eq(6)').val()),
                                        ia($(form).find('input:eq(7)').val()),
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            else if(inputs == 9)
                            {
                                raw_tx.data = contract[contract_func].getData(
                                    ia($(form).find('input:eq(0)').val()), 
                                    ia($(form).find('input:eq(1)').val()),
                                    ia($(form).find('input:eq(2)').val()),
                                    ia($(form).find('input:eq(3)').val()),
                                    ia($(form).find('input:eq(4)').val()),
                                    ia($(form).find('input:eq(5)').val()),
                                    ia($(form).find('input:eq(6)').val()),
                                    ia($(form).find('input:eq(7)').val()),
                                    ia($(form).find('input:eq(8)').val())
                                );
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        ia($(form).find('input:eq(0)').val()), 
                                        ia($(form).find('input:eq(1)').val()),
                                        ia($(form).find('input:eq(2)').val()),
                                        ia($(form).find('input:eq(3)').val()),
                                        ia($(form).find('input:eq(4)').val()),
                                        ia($(form).find('input:eq(5)').val()),
                                        ia($(form).find('input:eq(6)').val()),
                                        ia($(form).find('input:eq(7)').val()),
                                        ia($(form).find('input:eq(8)').val()),
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            else if(inputs == 10)
                            {
                                raw_tx.data = contract[contract_func].getData(
                                    ia($(form).find('input:eq(0)').val()), 
                                    ia($(form).find('input:eq(1)').val()),
                                    ia($(form).find('input:eq(2)').val()),
                                    ia($(form).find('input:eq(3)').val()),
                                    ia($(form).find('input:eq(4)').val()),
                                    ia($(form).find('input:eq(5)').val()),
                                    ia($(form).find('input:eq(6)').val()),
                                    ia($(form).find('input:eq(7)').val()),
                                    ia($(form).find('input:eq(8)').val()),
                                    ia($(form).find('input:eq(9)').val())
                                );
                                try
                                {
                                    estimate = contract[contract_func].estimateGas(
                                        ia($(form).find('input:eq(0)').val()), 
                                        ia($(form).find('input:eq(1)').val()),
                                        ia($(form).find('input:eq(2)').val()),
                                        ia($(form).find('input:eq(3)').val()),
                                        ia($(form).find('input:eq(4)').val()),
                                        ia($(form).find('input:eq(5)').val()),
                                        ia($(form).find('input:eq(6)').val()),
                                        ia($(form).find('input:eq(7)').val()),
                                        ia($(form).find('input:eq(8)').val()),
                                        ia($(form).find('input:eq(9)').val()),
                                        {from: settings.from, gas: raw_tx.gasLimit, value: ether_to_send}
                                    );
                                }catch(err){}
                            }
                            if(estimate)
                            {
                                var tx = new EthJS.Tx(raw_tx);
                                tx.sign(private_key);
                                var serialized_tx = tx.serialize();
                                web3.eth.sendRawTransaction('0x' + serialized_tx.toString('hex'), function(err, hash) 
                                {
                                    cortex.ux.loader(false, 'LOADING');
                                    if(hash)
                                    {
                                        cortex.ux.modals('Success', 'Transaction ID: ' + hash);
                                    }
                                    else
                                    {
                                        cortex.ux.modals('Error', 'Error: ' + err);
                                    }
                                });
                            }
                            else
                            {
                                cortex.ux.loader(false, 'LOADING');
                                cortex.ux.modals('Warning', 'Unable to process contract call');
                            }
                        }
                        else
                        {
                            cortex.ux.modals('Warning', 'Invalid contract username and password');
                        }
                    }
                    else
                    {
                        cortex.ux.modals('Warning', 'All fields required');
                    }
                });
            },
            login: function()
            {
                $('body').on('submit', 'form.login-form', function(e)
                {
                    e.preventDefault();
                    var form = $(this);
                    var username = $(form).find('#username').val();
                    var password = $(form).find('#password').val();
                    var salt = localStorage.getItem('bpcms_salt');
                    var address = localStorage.getItem('bpcms_address');
                    var network = localStorage.getItem('bpcms_network');
                    var hash = ethereum_ux.crypto([salt, username, password]);
                    var keys = ethereum_ux.keys(network + '_' + hash);
                    if(keys.address == address)
                    {
                        localStorage.setItem('bpcms_key', keys.public);
                        localStorage.setItem('bp_login_state', true);
                        window.location.href = ethereum_secrets.url + 'dashboard/';
                    }
                    else
                    {
                        cortex.ux.modals('Warning', 'Account not registered');
                    }
                });
            },
            recover: function()
            {
                $('body').on('submit', 'form.recover-keys', function(e)
                {
                    e.preventDefault();
                    var form = $(this);
                    var account_id = $(form).find('#account').val();
                    var username = $(form).find('#username').val();
                    var password = $(form).find('#password').val();
                    if(account_id && username && password)
                    {
                        var name = false;
                        var accounts = cortex.accounts.get();
                        if(accounts)
                        {
                            $.each(accounts, function(a)
                            {
                                if(accounts[a].id == account_id)
                                {
                                    name = accounts[a].name;
                                }
                            });
                        }
                        var net = localStorage.getItem('bpcms_network');
                        var salt = localStorage.getItem('bpcms_salt');
                        var address = localStorage.getItem('bpcms_address');
                        var hash = ethereum_ux.crypto([salt, username, password]);
                        var keys = ethereum_ux.keys(net + '_' + hash);
                        if(keys.address == address)
                        {
                            if(name != 'Personal') keys = ethereum_ux.keys(net + '_' + hash + '_' + account_id);
                            var html = '<div class="qr-holder" data-content="' + keys.private + '"></div>';
                            cortex.ux.modals('Private Key', html);
                        }
                    }
                    else
                    {
                        cortex.ux.modals('Warning', 'All fields required');
                    }
                });
            },
            register: function()
            {
                $('#dob_y').each(function(i)
                {
                    var select = $(this);
                    var options = $(select).find('options').length;
                    if(options <= 1)
                    {
                        var now = new Date();
                        var year = now.getFullYear();
                        for(y = year; y > (year - 100); y--)
                        {
                            $(select).append('<option value="' + y +'">' + y + '</option>');
                        }
                    }
                });
                $('body').on('submit', 'form.register-form', function(e)
                {
                    e.preventDefault();
                    var form = $(this);
                    var network = $(form).find('#network').val();
                    var username = $(form).find('#username').val();
                    var name = $(form).find('#fullname').val();
                    var dob_d = $(form).find('#dob_d').val();
                    var dob_m = $(form).find('#dob_m').val();
                    var dob_y = $(form).find('#dob_y').val();
                    var secret = $(form).find('#secret').val();
                    var secrets = $(form).find('#secret-repeat').val();
                    var password = $(form).find('#password').val();
                    var passwords = $(form).find('#password-repeat').val();
                    if(
                        network
                        && username && name 
                        && dob_d && dob_m && dob_y 
                        && secret && secrets 
                        && password && passwords
                    )
                    {
                        if(secret != secrets)
                        {
                            cortex.ux.modals('Warning', 'Secrets do not match');
                        }
                        else if(password != passwords)
                        {
                            cortex.ux.modals('Warning', 'Passwords do not match');
                        }
                        else
                        {
                            var salt = ethereum_ux.crypto([name, dob_d, dob_m, dob_y, secret]);
                            var hash = ethereum_ux.crypto([salt, username, password]);
                            var keys = ethereum_ux.keys(network + '_' + hash);
                            localStorage.setItem('bpcms_salt', salt);
                            localStorage.setItem('bpcms_key', keys.public);
                            localStorage.setItem('bpcms_address', keys.address);
                            localStorage.setItem('bpcms_network', network);
                            localStorage.setItem('bpcms_name', name);
                            var web3 = ethereum_ux.web(network);
                            var value = web3.eth.getBalance('0x'+keys.address);
                            var balance = value.dividedBy(1000000000000000000).toString();
                            var txs = web3.eth.getTransactionCount('0x'+keys.address).toString();
                            cortex.accounts.set(network, 'Personal', keys.public, keys.address, balance, txs);
                            if(
                                typeof ethereum_secrets.plugins != 'undefined'
                                && typeof ethereum_secrets.plugins.cms != 'undefined'
                                && typeof ethereum_secrets.plugins.cms.enabled != 'undefined'
                                && ethereum_secrets.plugins.cms.enabled
                            ){
                                cortex.contracts.import('cms', function()
                                {
                                    window.location.href = ethereum_secrets.url;
                                });
                            }
                            else
                            {
                                window.location.href = ethereum_secrets.url;
                            }
                        }
                    }
                    else
                    {
                        cortex.ux.modals('Warning', 'Missng required fields');
                    }
                });
            },
            selects: function()
            {
                $('body').find('select.neuron-types').each(function(i)
                {
                    var select = $(this);
                    var types = [
                        {
                            id: 'eth',
                            name: 'Ether'
                        },
                        {
                            id: 'erc20',
                            name: 'ERC20'
                        },
                        {
                            id: 'erc721',
                            name: 'ERC721'
                        }
                    ];
                    var options = $(select).find('option').length;
                    if(options <= 1)
                    {
                        $.each(types, function(a)
                        {
                            var id = types[a].id;
                            var name = types[a].name;
                            $(select).append('<option value="' + id + '">' + name + '</option>');
                        });
                    }
                });
                $('body').find('select.neuron-accounts').each(function(i)
                {
                    var select = $(this);
                    var accounts = cortex.accounts.get();
                    var options = $(select).find('option').length;
                    if(options <= 1)
                    {
                        $.each(accounts, function(a)
                        {
                            var id = accounts[a].id;
                            var name = accounts[a].name;
                            $(select).append('<option value="' + id + '">' + name + '</option>');
                        });
                    }
                });
                $('body').find('select.neuron-templates').each(function(i)
                {
                    var select = $(this);
                    var templates = false;
                    if(
                        typeof ethereum_smart_contract_abis != 'undefined'
                        && $.isPlainObject(ethereum_smart_contract_abis)
                    ){
                        templates = ethereum_smart_contract_abis;
                    }
                    var options = $(select).find('option').length;
                    if(templates && $.isPlainObject(templates) && options <= 1)
                    {
                        $.each(templates, function(name, bundle)
                        {
                            var len = bundle.length;
                            $(select).append('<option value="' + name + '">' + name + ' (includes ' + len + ' contracts)</option>');
                        });
                    }
                });
                $('body').find('select.neuron-networks').each(function(i)
                {
                    var select = $(this);
                    var networks = ethereum_secrets.networks;
                    var options = $(select).find('option').length;
                    if(options <= 1)
                    {
                        $.each(networks, function(n)
                        {
                            var name = networks[n].name;
                            var address = networks[n].address;
                            $(select).append('<option value="' + address + '">' + name + '</option>');
                        });
                    }
                });
            },
            transfer: function()
            {
                $('body').on('submit', 'form.neuron-transfer', function(e)
                {
                    e.preventDefault();
                    var form = $(this);
                    var type = $(form).attr('data-type');
                    if(type && (type == 'ether' || type == 'erc20' || type == 'erc721'))
                    {
                        var token = false;
                        var contract = false;
                        var contract_address = 0;
                        var from = $(form).find('#transfer_from').val();
                        var to = $(form).find('#transfer_to').val();
                        var amount = $(form).find('#transfer_value').val();
                        var username = $(form).find('#transfer_user').val();
                        var password = $(form).find('#transfer_pass').val();
                        if(type == 'erc20' || type == 'erc721')
                        {
                            from = $(form).find('#account').val();
                            token = $(form).find('#token').val();
                        }
                        if(from && to && amount && username && password && from != to)
                        {
                            var main = true;
                            var net = false;
                            var account = JSON.parse(JSON.stringify(from));
                            var salt = localStorage.getItem('bpcms_salt');
                            var address = localStorage.getItem('bpcms_address');
                            var network = localStorage.getItem('bpcms_network');
                            var hash = ethereum_ux.crypto([salt, username, password]);
                            var keys = ethereum_ux.keys(network + '_' + hash);
                            var accounts = cortex.accounts.get();
                            if(accounts)
                            {
                                $.each(accounts, function(a)
                                {
                                    if(accounts[a].id == from)
                                    {
                                        net = accounts[a].network;
                                        from = accounts[a].address;
                                        if(accounts[a].name != 'Personal')
                                        {
                                            main = false;
                                        }
                                        if(
                                            typeof accounts[a].tokens != 'undefined'
                                            && $.isPlainObject(accounts[a].tokens)
                                            && typeof accounts[a].tokens[token] != 'undefined'
                                        ){
                                            contract_address = JSON.parse(JSON.stringify(accounts[a].tokens[token].address));
                                        }
                                    }
                                });
                            }
                            if(net && keys.address == address)
                            {
                                if(!main)
                                {
                                    keys = ethereum_ux.keys(network + '_' + hash + '_' + account);
                                }
                                if(type == 'erc20' || type == 'erc721')
                                {
                                    var web3 = ethereum_ux.web(network);
                                    contract = web3.eth.contract(ethereum_ux.abi(type)).at(contract_address);
                                }
                                var tx = {
                                    value: amount,
                                    key: keys.private,
                                    from: '0x' + from,
                                    to: to,
                                    type: type,
                                    contract: contract,
                                    address: contract_address,
                                    network: network
                                };
                                $('.modal').modal('hide');
                                ethereum_ux.txs.send(tx, function(txid)
                                {
                                    cortex.ux.modals('Success', '<p>Transaction sent: <small>' + txid + '</small>');
                                });
                            }
                            else
                            {
                                cortex.ux.modal('Warning', 'Invalid transfer authentication');
                            }
                        }
                        else
                        {
                            cortex.ux.modal('Warning', 'All fields required');
                        }
                    }
                    else
                    {
                        cortex.us.modal('Warning', 'Invalid transfer type');
                    }
                });
            },
            tokens: function()
            {
                $('body').on('submit', 'form.add-tokens', function(e)
                {
                    e.preventDefault();
                    var form = $(this);
                    var id = $(form).find('#account').val();
                    var name = $(form).find('#name').val();
                    var type = $(form).find('#token_type').val();
                    var address = $(form).find('#address').val();
                    if(id && name && type && address && (type == 'erc20' || type == 'erc721'))
                    {
                        var token_id = ethereum_ux.crypto([name]);
                        var account = localStorage.getItem(id);
                        if(account)
                        {
                            account = JSON.parse(account);
                            if(typeof account.tokens[token_id] == 'undefined')
                            {
                                cortex.ux.loader(true);
                                
                                var decimals = 0;
                                var options = ethereum_ux.abi(type);
                                var web3 = ethereum_ux.web(account.network);
                                var contract = web3.eth.contract(options).at(address);
                                var balance = parseInt(contract.balanceOf('0x' + account.address).toString());
                                var erc20 = false;
                                var erc721 = true;
                                
                                if(type == 'erc20')
                                {
                                    erc20 = true;
                                    erc721 = false;
                                    decimals = parseInt(contract.decimals());
                                    balance = parseFloat(contract.balanceOf('0x' + account.address).dividedBy(10**decimals).toString()).toFixed(decimals);
                                }
                                var symbol = contract.symbol().toString();
                                account.tokens[token_id] = {
                                    name: name,
                                    symbol: symbol,
                                    decimals: decimals,
                                    balance: balance,
                                    address: address,
                                    type: type,
                                    erc20: erc20,
                                    erc721: erc721
                                };
                                localStorage.setItem(id, JSON.stringify(account));
                                $('.modal').modal('hide');
                                $('#sidebar a.active').trigger('click');
                            }
                            else
                            {
                                cortex.ux.modals('Warning', 'Token already added');
                            }
                        }
                        else
                        {
                            cortex.ux.modals('Warning', 'Invalid account');
                        }
                    }
                    else
                    {
                        cortex.ux.modals('Warning', 'All fields required');
                    }
                });
            }
        },
        html: function(callback)
        {
            var content = $('body').html();
            var data = cortex.filters(ethereum_contracts);
            var html = Mustache.render(content, data);
            $('body').html(html);
            cortex.ux.loader(true);
            cortex.ux.tables();
            var ajax_url = '/admin/html/modals.html';
            if(window.location.href.indexOf("localhost") > -1) 
            {
                ajax_url = ethereum_secrets.url + 'html/modals.html';
            }
            $.ajax({
                url: ajax_url,
                dataType: 'html',
                success: function(modals)
                {
                    $('body').append(modals);
                    callback();
                }
            });
        },
        loader: function(open, text)
        {
            if(typeof open == 'undefined') open = true;
            if(typeof text == 'undefined') text = 'LOADING';
            $('#loading-wrapper').attr('data-label', text);
            if(open === true)
            {
                $('#loading-wrapper').addClass('loading');
            }
            else
            {
                $('#loading-wrapper').removeClass('loading');
            }
        },
        modals: function(title, content)
        {
            $('.modal').modal('hide');
            var selector = $('#default-modal');
            $(selector).find('.modal-title').html(title);
            $(selector).find('.modal-body').html(content);
            $(selector).on('show.bs.modal', function()
            {
                
            });
            $(selector).on('shown.bs.modal', function()
            {
                cortex.ux.qr();
            });
            setTimeout(function()
            {
                $(selector).modal('show');
            }, 300);
        },
        qr: function()
        {
            $('body').find('.qr-holder').each(function()
            {
                if($(this).find('img').length > 0)
                {
                    $(this).find('img').remove();
                }
                $(this).qrcode({
                    render: 'image',
                    text: $(this).attr('data-content')
                });
            });
        },
        plugins: function(id)
        {
            if(
                typeof ethereum_secrets.plugins != 'undefined'
                && $.isPlainObject(ethereum_secrets.plugins)
            ){
                $.each(ethereum_secrets.plugins, function(pid, plugin)
                {
                    if(typeof cortex.ux[pid] == 'function')
                    {
                        cortex.ux[pid](id);
                    }
                });
            }
        },
        tables: function()
        {
            $('body').find('table.data-table').each(function(i)
            {
                if($(this).hasClass('dataTable'))
                {
                    // May need to redraw...?
                }
                else
                {
                    var dom = 'tlip';
                    var order_by = 1;
                    var order = 'asc';
                    var search = false;
                    var table = $(this);
                    var header_cells = $(this).find('thead tr th');
                    var body_cells = $(this).find('tbody tr td');
                    var callback = false;
                    if($(this).attr('data-search')) search = true;
                    if($(this).attr('data-dom')) dom = $(this).attr('data-dom');
                    if($(this).attr('data-callback')) callback = $(this).attr('data-callback');
                    if($(this).attr('data-order')) order = $(this).attr('data-order');
                    if($(this).attr('data-order-by')) order_by = parseInt($(this).attr('data-order-by'));
                    $(this).DataTable({
                        searching: search,
                        dom: dom,
                        order: [ order_by, order ],
                        fnDrawCallback: function(oSettings)
                        {
                            $(header_cells).each(function(i)
                            {
                                $(this).attr('data-width', $(this).width());
                            });
                            if(typeof window[callback] === "function")
                            {
                                window[callback](table);
                            }
                        }
                    });
                }
            });
        }
    }
};

$(document).ready(function(e)
{
    cortex.init();
});
