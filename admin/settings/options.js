var ethereum_sidebar = [
    {
        href: '../dashboard/',
        css: 'icon-dashboard btn-nav',
        text: 'Dashboard'
    },
    {
        href: '../accounts/',
        css: 'icon-contacts btn-nav',
        text: 'Accounts'
    },
    {
        href: '../contracts/',
        css: 'icon-contracts btn-nav',
        text: 'Contracts'
    },
    {
        href: '../settings/',
        css: 'icon-settings btn-nav active',
        text: 'Settings'
    }
];

var ethereum_contracts = {
    app: {
        name: eth_secrets('name', 'NEURON')
    },
    header: [
        {
            css: 'logo scm-logo-small',
            text: eth_secrets('name', 'NEURON')
        },
        {
            href: '#',
            css: 'btn-nav btn-logout',
            text: 'Logout'
        }
    ],
    sidebar: ethereum_sidebar,
    func: 'accounts'
};