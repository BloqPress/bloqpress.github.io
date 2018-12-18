var ethereum_contracts = {
    app: {
        name: eth_secrets('name', 'BloqPress'),
        address: localStorage.getItem('bpcms_address')
    }
};

document.addEventListener('DOMContentLoaded', function()
{
    cortex.ux.forms.register();
});