sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
    "sap/ui/model/Filter",
	"sap/ui/core/routing/History",
    'sap/ui/core/Fragment'
 ], function (Controller, JSONModel, MessageToast, Filter, History, Fragment) {
    "use strict";
    return Controller.extend("sap.ui.demo.wt.controller.Vloge", {
        onInit : function () {
            var cookie = getCookie();
            if(cookie.token !== undefined){
                if(globals.puo.token === undefined){
                    globals.puo = cookie;
                }
            }
            else{
                window.open("https://fervent-agnesi-0837b8.netlify.app/", "_self");
            }
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("Vloge").attachPatternMatched(this.onRouteMatched, this);
        },

        onAfterRendering : function(){
            if(window.navigator.onLine){
                this.byId("bar").addStyleClass("bar")
            }
            else{
                this.byId("bar").addStyleClass("barOffline");
            }
        },

        onRouteMatched: function(){
            if(window.navigator.onLine){
                var cookie = getCookie();
                if(cookie.token !== undefined){
                    if(cookie.token == "offline" && window.navigator.onLine){
                        deleteCookie(this);
                        window.open("https://fervent-agnesi-0837b8.netlify.app/", "_self");
                    }
                    if(globals.puo.token === undefined){
                        globals.puo = cookie;
                    }
                }
                else{
                    deleteCookie(this);
                    window.open("https://fervent-agnesi-0837b8.netlify.app/", "_self");
                }
                this.byId("ldTitle").setText("Lovska družina " + globals.puo.ime_druzine);
                getUsers(this, "vloge");
                getAllVloge(this);
            }
            else{
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("App", true);
            }
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

        onSearch: function (event) {
			var oItem = event.getParameter("suggestionItem");
            if(oItem != undefined){
                var username = oItem.getText();
                getUserVloga(this, username);
            }
            else{
                this.byId("vloge").setSelectedKeys([]);
            }
		},

		onSuggest: function (event) {
			var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters = [
					new Filter([
						new Filter("uporabniskoIme", function (sText) {
							return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						})
					], false)
				];
			}

			this.byId("claniVlogeField").getBinding("suggestionItems").filter(aFilters);
			this.byId("claniVlogeField").suggest();
		},

        onPress: function () {
            var oView = this.getView(),
                oButton = oView.byId("button");

            if (!this._oMenuFragment) {
                this._oMenuFragment = Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.wt.fragment.UserMenu",
                    controller: this
                }).then(function(oMenu) {
                    oMenu.openBy(oButton);
                    this._oMenuFragment = oMenu;
                    return this._oMenuFragment;
                }.bind(this));
            } else {
                this._oMenuFragment.openBy(oButton);
            }
        },

        onMenuAction: function(oEvent) {
            var item = oEvent.getParameter("item");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
            if(item.getKey() === "domov"){
                oRouter.navTo("LovskaDruzina");
            }
            else if(item.getKey() === "naLov"){
                oRouter.navTo("NaLov");
            }
            else if(item.getKey() === "nadzornaPlosca"){
                oRouter.navTo("NadzornaPlosca");
            }
            else if(item.getKey() === "prvaStran"){
                oRouter.navTo("App");
            }
        },

        onNav: function(oEvent){
            var navTo = oEvent.getParameter("id").split("--")[1];
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            if (navTo != undefined && navTo === "domov"){
                oRouter.navTo("LovskaDruzina");
            }
            else if (navTo != undefined && navTo === "naLov"){
                oRouter.navTo("NaLov");
            }
            else if (navTo != undefined && navTo === "nadzornaPlosca"){
                oRouter.navTo("NadzornaPlosca");
            }
            else if (navTo != undefined && navTo === "prvaStran"){
                oRouter.navTo("App");
            }
        },

        onLogOut: function(){
            deleteCookie(this);
        },

        changePermission: function(){
            if (!this.oDialog) {
                var that = this;
				this.oDialog = new sap.m.Dialog({
					title:"Spremeni vloge",
                    content: new sap.m.Text({
                        text:"Ali želite spremeniti vloge člana?"
                    }),
                    endButton: new sap.m.Button({
                        text: "Da",
                        press: function() {
                            that.oDialog.close();
                            checkVloge(that.byId("vloge").getSelectedKeys(), that.byId("claniVlogeField").getValue());
                        }
                    }),
                    beginButton: new sap.m.Button({
                        text: "Ne",
                        press: function() {
                            that.oDialog.close();
                        }
                    }),
                    afterClose: function () {
                        that.oDialog.destroy();
                        that.oDialog = null;
                    }
				});

				//to get access to the controller's model
				this.getView().addDependent(this.oDialog);
			}

			this.oDialog.open();
        }
    });
 });