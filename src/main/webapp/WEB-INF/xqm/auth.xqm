module namespace page = 'http://basex.org/modules/web-page';
declare namespace rest = 'http://exquery.org/ns/restxq';
declare namespace random = 'http://basex.org/modules/random';
declare namespace http = 'http://expath.org/ns/http-client';
declare namespace json = 'http://basex.org/modules/json';
declare namespace s = "http://danielkvasnicka.net/sympto";

import module namespace session = 'http://basex.org/modules/session';
import module namespace oa = 'http://basex.org/ns/oauth' at "../xqlib/oauth.xqm";
import module namespace sec = 'http://danielkvasnicka.net/sympto/secure' at "../xqlib/security.xqm";

declare variable $page:FB_STATE_HASH_ATTR_NAME := "fbStateHash";
declare variable $page:FB_TOKEN_ATTR_NAME := "fbToken";

declare %rest:path("auth/oauth/fb/callback")
        %restxq:query-param("state", "{$state}")
        %restxq:query-param("code", "{$code}")   
        function page:fb-oauth-callback($state as xs:string, $code as xs:string) {
   
    if (session:get($page:FB_STATE_HASH_ATTR_NAME) = $state) then
        let $response := http:send-request(
            <http:request method="get" 
                href="https://graph.facebook.com/oauth/access_token?client_id=108170726014554&amp;redirect_uri=https://sympto-dk.rhcloud.com/app/auth/oauth/fb/callback&amp;client_secret=e4f4ee53ef2d35281d304a942403be9f&amp;code={$code}">                
            </http:request>
        )
        let $token := fn:substring-before(fn:substring-after($response[2], "access_token="), "&amp;")
        let $userInfo :=
            http:send-request(
                <http:request method="get" href="https://graph.facebook.com/me?access_token={$token}">               
                </http:request>
            )[2]/json
        let $email := $userInfo/email
        return
            (
                session:set($page:FB_TOKEN_ATTR_NAME, $token),
                session:set($sec:USER_EMAIL_ATTR_NAME, $email),
                session:set($sec:USER_NAME_ATTR_NAME, $userInfo/name),
                <rest:redirect> {
                if (db:open('sympto')/s:sympto/s:profile[@id = $email]) then
                    "/#/dashboard"
                else
                    "/#/new-user"
                } </rest:redirect>
            )
    else
        <rest:redirect>/</rest:redirect>
};

declare %rest:path("auth/oauth/fb/csrf")
        %output:method("json")
        function page:fb-csrf-state() {
    
    let $state := hash:md5(random:integer() cast as xs:string)
    return
        (session:set($page:FB_STATE_HASH_ATTR_NAME, $state cast as xs:string), 
        <json objects="json">
            <state>{fn:encode-for-uri($state cast as xs:string)}</state>
        </json>)
};

declare %rest:path("auth/user")
        %output:method("json")
        function page:user-name() {

    let $userName := session:get($sec:USER_NAME_ATTR_NAME)
    return
        if (fn:empty($userName)) then
            <restxq:response>
                <http:response status="403" message="No user" />
            </restxq:response>
        else
            <json objects="json">
                {$userName}
            </json>
};            

declare %rest:path("auth/logout")
        function page:logout() {

    (session:close(), <rest:redirect>/</rest:redirect>)
};  
