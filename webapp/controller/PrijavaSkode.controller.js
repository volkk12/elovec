sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
    "sap/ui/model/Filter",
	"sap/ui/core/routing/History"
 ], function (Controller, JSONModel, MessageToast, Filter, History) {
    "use strict";
    return Controller.extend("sap.ui.demo.wt.controller.PrijavaSkode", {
        onInit : function () {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(lovske_druzine);
            this.oSF = this.byId("LD");
            this.oSF.setModel(oModel);
        },

		onAfterRendering : function(){
            if(window.navigator.onLine){
                this.byId("bar").addStyleClass("bar")
            }
            else{
                this.byId("bar").addStyleClass("barOffline");
            }
        },

        onSearch: function (event) {
			var oItem = event.getParameter("suggestionItem");
		},

		onSuggest: function (event) {
			var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters = [
					new Filter([
						new Filter("ime_druzine", function (sText) {
							return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						})
					], false)
				];
			}

			this.oSF.getBinding("suggestionItems").filter(aFilters);
			this.oSF.suggest();
		},

        onNavBack: function(){
            var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined && sPreviousHash.length > 0) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("App", true);
			}
        },

        prijavi: function(){
			var prijavaSkode = checkPrijavaSkode(this);
            if(prijavaSkode.valid){
				sendPrijavaSkode(prijavaSkode.data, this);
			}
        }
    });
 });