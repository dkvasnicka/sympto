sympto.factory('Cycle', function() {
    var Cycle = {};
    var data = [];

    Cycle.getItem = function(index) { return list[i]; }
    Cycle.addItem = function(item) { list.push(item); }
    Cycle.removeItem = function(item) { list.splice(list.indexOf(item), 1) }
    Cycle.size = function() { return list.length; }

    return Cycle;
});
