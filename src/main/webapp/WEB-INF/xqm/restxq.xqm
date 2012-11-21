module namespace page = 'http://basex.org/modules/web-page';
declare namespace rest = 'http://exquery.org/ns/restxq';
declare namespace xslt = 'http://basex.org/modules/xslt';
declare namespace json = 'http://basex.org/modules/json';
declare namespace convert = 'http://basex.org/modules/convert';
declare namespace s = "http://danielkvasnicka.net/sympto";

import module namespace sec = 'http://danielkvasnicka.net/sympto/secure' at "../xqlib/security.xqm";

declare %rest:path("api/users/init")
        %restxq:PUT("{$data}")
        %output:method("text")
        function page:init-user($data) {

    sec:secure(function() {            
        let $profile := json:parse-ml(convert:binary-to-string($data))
        return
            (
                insert node attribute id { sec:get-current-user-id() } into $profile,
                insert node $profile as last into db:open("sympto")/s:sympto
            )
    })
};
