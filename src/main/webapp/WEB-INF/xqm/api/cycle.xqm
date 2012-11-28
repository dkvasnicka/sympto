module namespace page = 'http://basex.org/modules/web-page';
declare namespace rest = 'http://exquery.org/ns/restxq';
declare namespace json = 'http://basex.org/modules/json';
declare namespace convert = 'http://basex.org/modules/convert';
declare namespace s = "http://danielkvasnicka.net/sympto";

import module namespace sec = 'http://danielkvasnicka.net/sympto/secure' at "../../xqlib/security.xqm";
import module namespace session = 'http://basex.org/modules/session';

declare %rest:path("api/cycle/current")
        %restxq:GET
        %output:method("jsonml")
        function page:current-cycle() {
    
    sec:secure(function() {
        page:get-last-cycle()
    })        
};

declare %rest:path("api/cycle/add-measurement")
        %restxq:PUT("{$data}")
        %output:method("text")
        %updating
        function page:add-measurement($data) {

    if (sec:is-user-logged-in()) then                
        let $measurement := 
            copy $m := json:parse-ml(convert:binary-to-string($data))
            modify (
                delete node $m/*[not(node())]
            )                
            return $m
        let $c := page:get-last-cycle()
                return insert node $measurement as last into $c
    else ()    
};

declare %private function page:get-last-cycle() {
    db:open("sympto")/s:sympto/s:profile[@id = sec:get-current-user-id()]/s:cycle[last()]
};
