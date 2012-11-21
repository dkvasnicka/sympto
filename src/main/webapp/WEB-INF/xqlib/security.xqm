module namespace secure = 'http://danielkvasnicka.net/sympto/secure';

declare namespace rest = 'http://exquery.org/ns/restxq';
import module namespace session = 'http://basex.org/modules/session';

declare %public variable $secure:USER_EMAIL_ATTR_NAME := "userId";
declare %public variable $secure:USER_NAME_ATTR_NAME := "userName";

declare function secure:secure($fun) {
    
    if (fn:empty(secure:get-current-user-id())) then
        (session:close(), <rest:redirect>/</rest:redirect>)
    else
        $fun()        
};

declare function secure:get-current-user-id() {
    session:get($secure:USER_EMAIL_ATTR_NAME)
};    
