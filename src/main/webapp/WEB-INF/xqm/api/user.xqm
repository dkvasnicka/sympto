module namespace page = 'http://basex.org/modules/web-page';
declare namespace rest = 'http://exquery.org/ns/restxq';
declare namespace xslt = 'http://basex.org/modules/xslt';
declare namespace json = 'http://basex.org/modules/json';
declare namespace convert = 'http://basex.org/modules/convert';
declare namespace s = "http://danielkvasnicka.net/sympto";

import module namespace sec = 'http://danielkvasnicka.net/sympto/secure' at "../../xqlib/security.xqm";
import module namespace session = 'http://basex.org/modules/session';

declare %rest:path("api/user/init")
        %restxq:PUT("{$data}")
        %output:method("text")
        %updating
        function page:init-user($data) {

    if (sec:is-user-logged-in()) then                
        let $profile := 
            copy $p := json:parse-ml(convert:binary-to-string($data))
            modify (
                insert node attribute id { sec:get-current-user-id() } into $p
            )                
            return $p
                return insert node $profile as last into db:open("sympto")/s:sympto
    else ()    
};
