sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    'sap/ui/core/Fragment',
    '../model/formatter'
 ], function (Controller, JSONModel, MessageToast, History, Filter, Fragment, formatter) {
    "use strict";
    return Controller.extend("sap.ui.demo.wt.controller.NaLov", {
        formatter: formatter,

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
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("NaLov").attachPatternMatched(this.onRouteMatched, this);
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
            var cookie = getCookie();
            if(cookie.token !== undefined){
                if(cookie.token == "offline" && window.navigator.onLine){
                    deleteCookie(this);
                    window.open("https://fervent-agnesi-0837b8.netlify.app/", "_self");
                }
                if(globals.puo.token === undefined){
                    globals.puo = cookie;
                }
                getAktivenLov(globals.puo.username);
                getAktivniLovi(this);
                getLovisca(this);
                getDivjad(this);
            }
            else{
                window.open("https://fervent-agnesi-0837b8.netlify.app/", "_self");
            }
            this.byId("ldTitle").setText("Lovska družina " + globals.puo.ime_druzine);

            if(window.navigator.onLine){
                setNaLovIcon(this);
            }
            else{
                readTrenutenLov(this);
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
						new Filter("naziv_lovisca", function (sText) {
							return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						})
					], false)
				];
			}

			this.byId("lovskaPreza").getBinding("suggestionItems").filter(aFilters);
			this.byId("lovskaPreza").suggest();
		},

        onSearch1: function (event) {
			var oItem = event.getParameter("suggestionItem");
		},

		onSuggest1: function (event) {
			var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters = [
					new Filter([
						new Filter("divjad", function (sText) {
							return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						})
					], false)
				];
			}

			this.byId("plenTextInput").getBinding("suggestionItems").filter(aFilters);
			this.byId("plenTextInput").suggest();
		},

        onNavBack: function(){
            var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined && sPreviousHash.length > 0 && sPreviousHash !== "Login") {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("App", true);
			}
        },

        onListItemPress: function(oEvent){
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
            if(oEvent.getParameter("listItem").getTitle() === "Domov"){
                oRouter.navTo("LovskaDruzina");
            }
            else if(oEvent.getParameter("listItem").getTitle() === "Na lov"){
                oRouter.navTo("NaLov");
            }
            else if(oEvent.getParameter("listItem").getTitle() === "Nadzorna plošča"){
                oRouter.navTo("NadzornaPlosca");
            }
            else{
                console.log("Napaka pri navigaciji");
            }
        },

        naprej: function(){
            if(window.navigator.onLine){
                if(checkData(this)){
                    var time = this.byId("zacetekLova").getDateValue();
                    globals.lov = {
                        "username": globals.puo.username,
                        "lovisce": this.byId("lovskaPreza").getValue(),
                        "zacetek": time,
                        "konec" : "",
                        "stevilo_strelov" : "",
                        "plen": ""
                    };
    
                    sendLov(globals.lov, this);
    
                    this.byId("item2").setEnabled(true);
                    this.byId("idIconTabBarMulti").setSelectedKey("item2");
                    this.byId("item1").setEnabled(false);
                    var that = this;
                    setTimeout(function(){ that.byId("prekliciButton").setEnabled(false); }, 600000);
                }
                else{
                    console.log("error");
                }
            }
            else{
                var offlineDialog = new sap.m.Dialog({
					title:"Napaka: ni internetne povezave",
                    content: new sap.m.Text({
                        text:"Vzpostavite internetno povezavo za vpis na lov"
                    }),
                    endButton: new sap.m.Button({
                        text: "OK",
                        press: function() {
                            offlineDialog.close();
                        }
                    }),
                    afterClose: function () {
                        offlineDialog.destroy();
                        offlineDialog = null;
                    }
				});
                offlineDialog.open();
            }
        },

        onPreklici: function(){
            var that = this;
            if (!this.oPrekliciDialog) {
                var that = this;
				this.oPrekliciDialog = new sap.m.Dialog({
					title:"Prekliči lov",
                    content: new sap.m.Text({
                        text:"Ali želite preklicati lov?"
                    }),
                    endButton: new sap.m.Button({
                        text: "Da",
                        press: function() {
                            clearLov();
                            deleteLov(globals.lov, that);
                            that.oPrekliciDialog.close();
                            that.byId("item1").setEnabled(true);
                            that.byId("idIconTabBarMulti").setSelectedKey("item1");
                            that.byId("item2").setEnabled(false);
                            that.byId("zacetekLova").setValueState("None");
                            that.byId("zacetekLova").setDateValue(new Date());
                            that.byId("lovskaPreza").setValue("");
                        }
                    }),
                    beginButton: new sap.m.Button({
                        text: "Ne",
                        press: function() {
                            that.oPrekliciDialog.close();
                        }
                    }),
                    afterClose: function () {
                        that.oPrekliciDialog.destroy();
                        that.oPrekliciDialog = null;
                    }
				});

				//to get access to the controller's model
				this.getView().addDependent(this.oPrekliciDialog);
			}

			this.oPrekliciDialog.open();
        },
        
        onZakljuci: function(){
            if (!this.oDialog) {
                var that = this;
				this.oDialog = new sap.m.Dialog({
					title:"Zaključi lov",
                    content: new sap.m.Text({
                        text:"Ali želite zaključiti lov?"
                    }),
                    endButton: new sap.m.Button({
                        text: "Da",
                        press: function() {
                            that.oDialog.close();
                            that.byId("item3").setEnabled(true);
                            that.byId("idIconTabBarMulti").setSelectedKey("item3");
                            that.byId("item2").setEnabled(false);
                            that.byId("item1").setEnabled(false);
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
        },

        handleStrel: function(oEvent){
            if(oEvent.getParameter("selectedIndex") === 0){
                this.byId("stStrelov").setVisible(true);
            }
            else if(oEvent.getParameter("selectedIndex") === 1){
                this.byId("stStrelov").setVisible(false);
            }
        },

        handlePlen: function(oEvent){
            if(oEvent.getParameter("selectedIndex") === 0){
                this.byId("plenText").setVisible(true);
            }
            else if(oEvent.getParameter("selectedIndex") === 1){
                this.byId("plenText").setVisible(false);
            }
        },

        onLovZakljucen: function(){
            if(checkLovZakljucen(this)){
                globals.lov.konec = new Date();
                globals.lov.stevilo_strelov = this.byId("stStrelovInput").getValue();
                globals.lov.plen = this.byId("plenTextInput").getValue();
                clearAndAddLovOffline(globals.lov);
                if(window.navigator.onLine){
                    sendLov(globals.lov, this);
                }
                else{
                    navigator.serviceWorker.ready.then((swRegistration) => 
                        swRegistration.sync.register('sendLov')
                    ).catch(console.log);

                    var that = this;

                    var lovZakljucenDialog = new sap.m.Dialog({
                        title:"Ni internetne povezave",
                        content: new sap.m.Text({
                            text:"Podatki o lovu se bodo prenesli, ko se vzpostavi internetna povezava."
                        }),
                        endButton: new sap.m.Button({
                            text: "OK",
                            press: function() {
                                lovZakljucenDialog.close();
                            }
                        }),
                        afterClose: function () {
                            lovZakljucenDialog.destroy();
                            lovZakljucenDialog = null;
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                            oRouter.navTo("LovskaDruzina");
                        }
                    });
                    lovZakljucenDialog.open();
                }
            }
            else{
                console.log("err");
            }
        },

        onLogOut: function(){
            deleteCookie(this);
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
        }
    });
 });