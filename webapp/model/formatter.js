sap.ui.define([], function() {
    'use strict';
    return{
        date: function(sStatus) {
            var oFormat = sap.ui.core.format.DateFormat.getInstance({
                pattern: "d. MMM yyyy hh:mm:ss"
            })
            return oFormat.format(new Date(sStatus));
        }
    }
});