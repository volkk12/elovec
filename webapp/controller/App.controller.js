sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/Fragment'
 ], function (Controller, Fragment) {
    "use strict";
    return Controller.extend("sap.ui.demo.wt.controller.App", {
        onInit : function () {
            getJavnaObvestila(this);
            if(!ifSupported()){
                indexedDBSupport = false;
            }
            else{
                indexedDBSupport = true;
                //openDB();
            }
            getLovskeDruzine();
        },

        onAfterRendering : function(){
            if(window.navigator.onLine){
                this.byId("bar").addStyleClass("bar")
            }
            else{
                this.byId("bar").addStyleClass("barOffline");
            }
            if(!indexedDBSupport){
                if (!this.errDialog) {
                    var that = this;
                    this.errDialog = new sap.m.Dialog({
                        title:"Napaka",
                        content: new sap.m.Text({
                            text:"Vaš brskalnik ne podpira lokalnega shranjevanja podatkov. Aplikacija v načinu brez povezave ne bo delovala."
                        }),
                        beginButton: new sap.m.Button({
                            text: "OK",
                            press: function() {
                                that.errDialog.close();
                            }
                        }),
                        afterClose: function () {
                            that.errDialog.destroy();
                            that.errDialog = null;
                        }
                    });
    
                    //to get access to the controller's model
                    this.getView().addDependent(this.errDialog);
                }
    
                this.errDialog.open();
            }
        },

        navToLogin: function(){
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Login");
        },
        
        navToPrijavaSkode: function(){
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("PrijavaSkode");
        },

        onPress: function () {
            var oView = this.getView(),
                oButton = oView.byId("button");

            if (!this._oMenuFragment) {
                this._oMenuFragment = Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.wt.fragment.Menu",
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
            if(item.getKey() === "login"){
                this.navToLogin();
            }
            else if(item.getKey() === "skoda"){
                this.navToPrijavaSkode();
            }
        }
    });
 });