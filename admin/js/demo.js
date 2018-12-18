var bp_demo = {
    html: {
        articles: function(network, address)
        {
            var html = '';
            var all_tags = {};
            var articles = bp_cms.articles.get(network, address);
            for(i = 0; i < articles.length; i++)
            {
                var content = '';
                var tag_clases = '';
                var slug = articles[i][0];
                var title = articles[i][1];
                var url = articles[i][2];
                var tags = articles[i][3];
                var description = articles[i][4];
                var img = '<img class="img img-thumbnail img-responsive img-block" src="../img/'+slug+'.png" />';
                var header = '<a href="'+url+'" target="_blank" class="card-img-top">'+img+'</a>';
                if(tags)
                {
                    var tag_array = tags.split(', ');
                    $.each(tag_array, function(i)
                    {
                        tag_clases+= ' ' + tag_array[i];
                    })
                }
                if(description)
                {
                    content+= '<p>' + description + '</p><hr>';
                };
                content+= '<small><a href="'+url+'" target="_blank">'+url+'</a></small>';
                html+= '<div class="col-md-4 iso'+tag_clases+'">';
                    html+= '<div class="card iso">';
                        html+= header;
                        html+= '<div class="card-header">'+title+'</div>';
                        html+= '<div class="card-body">'+content+'</div>';
                    html+= '</div>';
                html+= '</div>';
            };
            return html;
        },
        init: function()
        {
            if($('.bp.articles').length > 0)
            {
                var address;
                var network;
                bp_demo.ux.loader(true, 'FETCHING DATA');
                $('.bp.articles').each(function()
                {
                    address = $(this).attr('data-address');
                    network = $(this).attr('data-network');
                    var html = bp_demo.html.articles(network, address);
                    $(this).prepend(html);
                });
                $('.bp-filters').html(bp_demo.html.tags(network, address));
                setTimeout(function()
                {
                    bp_demo.isotope();
                    bp_demo.ux.loader(false);
                }, 1000);
            }
        },
        tags: function(network, address)
        {
            var filters = '';
            var all_tags = {};
            var articles = bp_cms.articles.get(network, address);
            for(i = 0; i < articles.length; i++)
            {
                var tags = articles[i][3];
                if(tags)
                {
                    var tag_array = tags.split(', ');
                    $.each(tag_array, function(i)
                    {
                        if(typeof all_tags[tag_array[i]] == 'undefined')
                        {
                            all_tags[tag_array[i]] = 0;
                        }
                        all_tags[tag_array[i]]++;
                    })
                }
            };
            filters+= '<button data-filter="*" class="btn btn-primary">show all</button>';
            $.each(all_tags, function(k, v)
            {
                filters+= '<button data-filter=".'+k+'" class="btn btn-secondary">'+k+' <small>('+v+')</small></button>';
            });
            return filters;
        }
    },
    init: function()
    {
        bp_demo.html.init();
    },
    isotope: function()
    {
        var $grid = $('.row.articles').isotope({
          // options
          itemSelector: '.col-md-4.iso',
          layoutMode: 'masonry'
        });
        $('.bp-filters').on( 'click', 'button', function() 
        {
            $('.bp-filters .btn-primary').addClass('btn-secondary');
            $('.bp-filters .btn-primary').removeClass('btn-primary');
            $(this).addClass('btn-primary');
            $(this).removeClass('btn-secondary');
            var filterValue = $(this).attr('data-filter');
            $grid.isotope({ filter: filterValue });
        });
    },
    strings: {
        splitter: function(str, l)
        {
            var web3 = new Web3();
            var strs = [];
            while(str.length > l){
                var pos = str.substring(0, l).lastIndexOf(' ');
                pos = pos <= 0 ? l : pos;
                strs.push(web3.fromAscii(str.substring(0, pos)));
                var i = str.indexOf(' ', pos)+1;
                if(i < pos || i > pos+l)
                    i = pos;
                str = str.substring(i);
            }
            strs.push(web3.fromAscii(str));
            return strs;
        }
    },
    ux: {
        loader: function(open, text)
        {
            if(open === true)
            {
                if(typeof text == 'undefined' || !text) text = 'LOADING';
                $('#loading-wrapper-content').attr('data-label', text);
                $('#loading-wrapper-content').addClass('loading');
            }
            else
            {
                $('#loading-wrapper-content').removeClass('loading');
                $('#loading-wrapper-content').attr('data-label', 'LOADING');
            }
        }
    }
};

$(document).ready(function(e)
{
    bp_demo.init();
});