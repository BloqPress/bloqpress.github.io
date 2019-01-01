var bp_demo = {
    html: {
        articles: function(network, address, callback)
        {
            var html = '';
            var all_tags = {};
            bp_cms.articles.get(network, address, function(articles)
            {
                for(i = 0; i < articles.length; i++)
                {
                    var content = '';
                    var tag_clases = '';
                    var slug = articles[i][0];
                    var title = articles[i][1];
                    var url = articles[i][2];
                    var tags = articles[i][3];
                    var time = articles[i][4];
                    var author = articles[i][5];
                    var description = articles[i][6];
                    var comments = articles[i][7];
                    
                    var img = '<img class="img img-thumbnail img-responsive img-block" src="../img/'+slug+'.png" />';
                    var header = '<a href="'+url+'" target="_blank" class="card-img-top">'+img+'</a>';
                    var ago = $.timeago(new Date(time * 1000));
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
                    content+= '<small>Published ' + ago;
                    
                    if(author)
                    {
                        content+= ' by ' + author;
                    }
                    
                    if(tags)
                    {
                        content+= '<br/>Tagged with: ' + tags;
                    }
                    
                    if(comments && $.isArray(comments) && comments.length > 0)
                    {
                        content+= '<br/>Comments: ' + comments.length;
                    }
                    
                    content+= '<br/>( <a href="'+url+'" target="_blank">'+url+'</a> )</small>';
                    if(comments && $.isArray(comments) && comments.length > 0)
                    {
                        content+= '<hr>';
                        for(c = 0; c < comments.length; c++)
                        {
                            content+= '<small class="bp-comment">' + comments[c] + '</small>';
                        }
                    }
                    html+= '<div class="col-md-4 iso'+tag_clases+'" data-new="'+time+'" data-old="'+time+'" data-comments="'+comments.length+'">';
                        html+= '<div class="card iso">';
                            html+= header;
                            html+= '<div class="card-header">'+title+'</div>';
                            html+= '<div class="card-body">'+content+'</div>';
                        html+= '</div>';
                    html+= '</div>';
                };
                callback(html);
            });
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
                    var wrapper = this;
                    address = $(this).attr('data-address');
                    network = $(this).attr('data-network');
                    bp_demo.html.articles(network, address, function(html)
                    {
                        $(wrapper).prepend(html);
                        bp_demo.html.tags(network, address, function(html)
                        {
                            $('.bp-filters').html(html);
                            setTimeout(function()
                            {
                                bp_demo.isotope();
                                bp_demo.ux.loader(false);
                            }, 1000);
                        });
                    });
                });
            }
            else
            {
                var network = ethereum_smart_contract_abis.cms[2].network;
                var address = ethereum_smart_contract_abis.cms[2].address;
                bp_cms.articles.get(network, address, function(article)
                {

                });
            }
        },
        tags: function(network, address, callback)
        {
            var filters = '';
            var all_tags = {};
            bp_cms.articles.get(network, address, function(articles)
            {
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
                filters+= '<button data-filter="*" class="btn btn-primary">all</button>';
                $.each(all_tags, function(k, v)
                {
                    filters+= '<button data-filter=".'+k+'" class="btn btn-secondary">'+k+' <small>('+v+')</small></button>';
                });
                callback(filters);
            });
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
          layoutMode: 'masonry',
          getSortData: {
            name: '.card-header',
            newest: '[data-new] parseInt',
            oldest: '[data-old] parseInt',
            popularity: '[data-comments] parseInt'
          },
          sortBy: 'newest',
          sortAscending: {
            name: true,
            newest: false,
            oldest: true,
            popularity: false
          }
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
        $('.bp-sorts').on( 'click', 'button', function() 
        {
            $('.bp-sorts .btn-primary').addClass('btn-secondary');
            $('.bp-sorts .btn-primary').removeClass('btn-primary');
            $(this).addClass('btn-primary');
            $(this).removeClass('btn-secondary');
            var sortByValue = $(this).attr('data-sort-by');
            $grid.isotope({ sortBy: sortByValue });
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
        admin: function()
        {
            if($('form.bp-add-article').length > 0)
            {
                var network = ethereum_smart_contract_abis.cms[1].network;
                var address = ethereum_smart_contract_abis.cms[1].address;
                bp_cms.articles.stored(network, address, function(articles)
                {
                    var article_count = articles.length;
                    var tag_count = 0;
                    var tag_html = '';
                    var tags = {};
                    for(i = 0; i < articles.length; i++)
                    {
                        var tag_array = articles[i][3].split(', ');
                        for(t = 0; t < tag_array.length; t++)
                        {
                            if(typeof tags[tag_array[t]] == 'undefined')
                            {
                                tags[tag_array[t]] = tag_array[t];
                                tag_count++;
                                if(!tag_html)
                                {
                                    tag_html+= tag_array[t];
                                }
                                else
                                {
                                    tag_html+= ', ' + tag_array[t];
                                }
                            }               
                        }
                    }
                    $('.bp-article-count').text(article_count);
                    $('.bp-tag-count').text(tag_count);
                    $('.bp-tags').text(tag_html);
                });
                $('body').on('submit', 'form.bp-add-article', function(e)
                {
                    e.preventDefault();
                    var form = this;
                    var slug = $(form).find('#bp_slug').val();
                    var title = $(form).find('#bp_title').val();
                    var url = $(form).find('#bp_url').val();
                    var tags = $(form).find('#bp_tags').val();
                    var content = $(form).find('#bp_content').val();
                    var username = $(form).find('#bp_username').val();
                    var password = $(form).find('#bp_password').val();
                    if(slug && title && url && tags && content && username && password)
                    {
                        /*

                        TODO: REPLACE WITH WORKING FORM
                        
                        -- Use mist in order to add, update or remove article
                        -- Contract launcher and inline articles coming soon!
                        
                        */
                        cortex.ux.modals('Warning', 'You do not have the required funds');
                    }
                    else
                    {
                        cortex.ux.modals('Warning', 'All article fields are required');
                    }
                });
            }
        },
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
    bp_demo.ux.admin();
});