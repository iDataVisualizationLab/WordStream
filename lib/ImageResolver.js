// HTTP Request to other domain are blocked
    // We need a CORS proxy
    function proxify( request ) {
        request.url = "http://www.inertie.org/ba-simple-proxy.php?mode=native&url=" + encodeURIComponent( request.url );
        return request;
    }

    // Create an instance of ImageResolver
    // The proxy function is passed as an option
    var resolver = new ImageResolver( { requestPlugin : proxify } );

    // Register plugins we want to use
    // You can use the built-in plugin, or create your own
    // Plugins will be called in the order of their registration
    resolver.register(new ImageResolver.FileExtension());
    resolver.register(new ImageResolver.NineGag());
    resolver.register(new ImageResolver.Instagram());
    resolver.register(new ImageResolver.ImgurPage());

    resolver.register(new ImageResolver.MimeType());
    resolver.register(new ImageResolver.Flickr( '6a4f9b6d16c0eaced089c91a2e7e87ad' ));
    resolver.register(new ImageResolver.Opengraph());
    resolver.register(new ImageResolver.Webpage());


    $(function(){
        $('form').on('submit', function(e){
            //e.preventDefault();
            /*var url = "http://www.cs.uic.edu/~tdang/";
            console.log( url );
            resolver.resolve( url, function( result ){
                console.log( result );
                if ( result ) {
                  console.log("result.image="+result.image);
                    $('body').css('background-image', 'url(' + result.image + ')');
                } else {
                    alert('Can not find image');
                }
            });*/

        });
    });