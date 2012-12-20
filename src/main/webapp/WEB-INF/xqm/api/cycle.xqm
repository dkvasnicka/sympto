module namespace page = 'http://basex.org/modules/web-page';
declare namespace rest = 'http://exquery.org/ns/restxq';
declare namespace json = 'http://basex.org/modules/json';
declare namespace convert = 'http://basex.org/modules/convert';
declare namespace s = "http://danielkvasnicka.net/sympto";

import module namespace sec = 'http://danielkvasnicka.net/sympto/secure' at "../../xqlib/security.xqm";
import module namespace fx = 'http://www.functx.com' at "../../xqlib/functx-1.0-nodoc-2007-01.xqm";
import module namespace session = 'http://basex.org/modules/session';

declare %public variable $page:CYCLE_START_ATTR := "activeCycle";

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
        page:get-active-cycle()
    })        
};

declare %rest:path("api/cycle/current")
        %restxq:PUT("{$data}")
        function page:set-current-cycle($data) {
             
    sec:secure(function() {
        session:set($page:CYCLE_START_ATTR, fx:trim($data))
    })        
};

declare %rest:path("api/cycle/{$start}")
        %restxq:GET
        %output:method("jsonml")
        function page:cycle($start as xs:string) {
    
    <restxq:response>
        <http:response>
            <http:header name="Cache-Control"   value="no-cache, no-store"/>
            <http:header name="pragma"          value="no-cache"/>
        </http:response>
    </restxq:response>,            
    sec:secure(function() {
        sec:get-current-profile()/s:cycle[@start = $start]
    })        
};

declare %rest:path("api/cycle/all")
        %restxq:GET
        %output:method("json")
        function page:all-cycles() {
    
    sec:secure(function() {
        <json arrays="json" objects="cycle">
        { 
            for $c in sec:get-current-profile()/s:cycle
            order by $c/@start
            return
                <cycle>
                { for $a in $c/@* return element { name($a) } { string($a) } }
                </cycle>
        }
        </json>
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
        let $c := page:get-active-cycle() return
            let $existingM := $c/s:measurement[@date = $measurement/@date] return
                if (fn:empty($existingM)) then
                    (db:output(<json objects="json"><updated>false</updated></json>), insert node $measurement as last into $c)
                else
                    (db:output(<json objects="json"><updated>true</updated></json>), replace node $existingM with $measurement)
    else db:output($sec:UNAUTHORIZED)    
};

declare %rest:path("api/cycle/new/{$start}")
        %restxq:PUT
        %updating
        function page:new-cycle($start as xs:integer) {

    if (sec:is-user-logged-in()) then                
        if (fn:empty(page:find-overlapping-cycle($start))) then
            insert node 
                <cycle start="{$start}" />
            as last into sec:get-current-profile()    
        else db:output(
            <restxq:response>
                <http:response status="500" 
                    message="The selected date overlaps with an existing cycle! Select a different date and try again." />
            </restxq:response>)

    else db:output($sec:UNAUTHORIZED)    
};

declare %rest:path("api/cycle/delete-measurement/{$time}")
        %restxq:DELETE
        %output:method("text")
        %updating
        function page:delete-measurement($time as xs:unsignedLong) {

    if (sec:is-user-logged-in()) then                
        delete node page:get-active-cycle()/s:measurement[@date = $time]
    else db:output($sec:UNAUTHORIZED)    
};

(: --------- private functions :)

declare %private function page:find-overlapping-cycle($start as xs:integer) {
    sec:get-current-profile()/s:cycle[
        $start ge xs:integer(@start) and $start le xs:integer(@end)]
};    

declare %private function page:get-active-cycle() {
    let $acStart := session:get($page:CYCLE_START_ATTR) return
        if (fn:not(fn:empty($acStart))) then
            sec:get-current-profile()/s:cycle[@start = $acStart]
        else
            let $newActiveCycle := page:get-last-cycle() return
                (session:set($page:CYCLE_START_ATTR, $newActiveCycle/@start),
                $newActiveCycle)
                
};    

declare %private function page:get-last-cycle() {
    sec:get-current-profile()/s:cycle[last()]
};
