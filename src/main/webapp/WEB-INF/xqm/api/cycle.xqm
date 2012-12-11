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
    
    <restxq:response>
        <http:response>
            <http:header name="Cache-Control"   value="no-cache, no-store"/>
            <http:header name="pragma"          value="no-cache"/>
        </http:response>
    </restxq:response>,            
    sec:secure(function() {
        page:get-last-cycle()
    })        
};

declare %rest:path("api/cycle/save-measurement")
        %restxq:PUT("{$data}")
        %output:method("json")
        %updating
        function page:save-measurement($data) {

    if (sec:is-user-logged-in()) then                
        let $measurement := 
            copy $m := json:parse-ml(convert:binary-to-string($data))
            modify (
                delete node $m/*[not(node())]
            )                
            return $m
        let $c := page:get-last-cycle() return
            let $existingM := $c/s:measurement[@date = $measurement/@date] return
                if (fn:empty($existingM)) then
                    (db:output(<json objects="json"><updated>false</updated></json>), insert node $measurement as last into $c)
                else
                    (db:output(<json objects="json"><updated>true</updated></json>), replace node $existingM with $measurement)
    else ()    
};

declare %rest:path("api/cycle/delete-measurement/{$time}")
        %restxq:DELETE
        %output:method("text")
        %updating
        function page:delete-measurement($time as xs:unsignedLong) {

    if (sec:is-user-logged-in()) then                
        delete node page:get-last-cycle()/s:measurement[@date = $time]
    else ()    
};

declare %private function page:get-last-cycle() {
    db:open("sympto")/s:sympto/s:profile[@id = sec:get-current-user-id()]/s:cycle[last()]
};
