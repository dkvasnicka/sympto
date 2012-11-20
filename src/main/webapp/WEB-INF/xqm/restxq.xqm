module namespace page = 'http://basex.org/modules/web-page';
declare namespace rest = 'http://exquery.org/ns/restxq';
declare namespace xslt = 'http://basex.org/modules/xslt';
declare namespace json = 'http://basex.org/modules/json';

declare %rest:path("api/measurements")
        %output:method("jsonml")
        function page:measurements() {
   
    <measurement date="01-01-2012" sex="false" temp="36.4">
        <vaginal-sensation>dry</vaginal-sensation>
        <observation>spotting</observation>
        <cervix>HARD_CLOSED_LONG</cervix>
        <comment />
        <medications>
            <medication>Ibalgin</medication>
        </medications>
     </measurement> 

};
