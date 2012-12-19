module namespace secure = 'http://danielkvasnicka.net/sympto/secure';

declare namespace rest = 'http://exquery.org/ns/restxq';
import module namespace session = 'http://basex.org/modules/session';

declare %public variable $secure:USER_EMAIL_ATTR_NAME := "userId";
declare %public variable $secure:USER_NAME_ATTR_NAME := "userName";
declare %public variable $secure:UNAUTHORIZED :=    <restxq:response>
                                                        <http:response status="403" />
                                                    </restxq:response>;


declare function secure:secure($fun) {
    
    if (secure:is-user-logged-in()) then
        $fun()
    else
        (session:close(), <rest:redirect>/</rest:redirect>)        
};

declare function secure:is-user-logged-in() as xs:boolean {
    fn:not(fn:empty(secure:get-current-user-id()))
};    

declare function secure:get-current-user-id() {
    session:get($secure:USER_EMAIL_ATTR_NAME)
};    
