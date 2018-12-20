var is_secretly_logged_in = localStorage.getItem('bpcms_key');

var ethereum_secrets = {
    name: 'BloqPress',
    url: 'http://bloq.press/admin/',
    v: 2,
    networks: [
        {
            name: 'NeuroNet',
            address: 'http://104.215.146.84:20545'
        },
        {
            name: 'Localhost',
            address: 'http://127.0.0.1:8545'
        },
        {
            name: 'Public',
            address: 'https://mainnet.infura.io/'
        }
    ],
    plugins: {
        cms: {
            enabled: true
        }
    }
};

if(window.location.href.indexOf("localhost") > -1) 
{
    ethereum_secrets.url = 'http://localhost/neuroware/websites/bloq.press/admin/';
}

function eth_secrets(key, default_value)
{
    if(
        typeof ethereum_secrets != 'undefined'
        && typeof ethereum_secrets[key] != 'undefined'
    ){
        return ethereum_secrets[key];
    }
    else
    {
        return default_value;
    }
}

function cortex_plugin_activated(name)
{
    if(
        typeof ethereum_secrets.plugins != 'undefined'
        && typeof ethereum_secrets.plugins[name] != 'undefined'
        && typeof ethereum_secrets.plugins[name].enabled != 'undefined'
        && ethereum_secrets.plugins[name].enabled == true
    ){
        return true;
    }
    else
    {
        return false;
    }
}
