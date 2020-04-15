var domains = [];

$( 'h3' ).parent('a').each(function() {
    var url = $(this).attr('href');
    url =  new URL(url, location)
    domains.push(url.origin);
});

chrome.runtime.sendMessage({action: "get_reviews", packet: domains}, function(response) {
    console.log(response);
    $( 'h3' ).parent('a').each(function() {
        $(this).parent().parent().append( response.reviews.review );
    });
});

