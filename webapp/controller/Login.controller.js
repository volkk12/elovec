sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
    "sap/ui/model/Filter",
	"sap/ui/core/routing/History"
 ], function (Controller, JSONModel, MessageToast, Filter, History) {
    "use strict";
    return Controller.extend("sap.ui.demo.wt.controller.Login", {
        onInit : function () {
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("Login").attachPatternMatched(this.onRouteMatched, this);
        },

		onRouteMatched: function(){
			var cookie = getCookie();
			if(cookie.token !== undefined){
                if(globals.puo.token === undefined){
                    globals.puo = cookie;
                }
				if(globals.puo.token == "offline" && !window.navigator.onLine){
					deleteCookie(this);
				}
				else{
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("LovskaDruzina");
				}
            }
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
			if (oItem) {
				MessageToast.show("Search for: " + oItem.getText());
			} else {
				MessageToast.show("Search is fired!");
			}
		},

		onSuggest: function (event) {
			var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters = [
					new Filter([
						new Filter("name", function (sText) {
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

        login: function(oEvent){
			var username = this.byId("user").getValue();

			var password = this.byId("password").getValue();

			login(username, password, this);
        }
    });
 });