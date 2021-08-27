sap.ui.define([
    "sap/ui/core/mvc/Controller"
 ], function (Controller) {
    "use strict";
    return Controller.extend("sap.ui.demo.wt.controller.Content", {
        onInit : function () {
            getJavnaObvestila(this);     
        },

        AddPanel: function(oEvent) {
            // the model
            var oModel   = this.getView().getModel(); 
            // array with all rows in the model
            var aRows    = oModel.getProperty("/rows");

            var oNewRow = {
                title   : "New Title",
                content : "New Content"
            };
            // add the object at index
            aRows.push(oNewRow);
            oModel.setProperty("/rows", aRows);
        }
    });
 });