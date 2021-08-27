sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
    'sap/ui/core/Fragment'
 ], function (Controller, JSONModel, MessageToast, History, Fragment) {
    "use strict";
    return Controller.extend("sap.ui.demo.wt.controller.NadzornaPlosca", {
        tajli : [
            {
                id : "clani",
                ime : "Člani",
                vloga : "Člani",
                opis : "Dodaj/odstrani člana",
                unit : "",
                footer : "Število članov"
            },
            {
                id : "vloge",
                ime : "Vloge",
                vloga : "Vloge",
                opis : "Dodaj/odvzemi vloge",
                unit : "",
                footer : "Število vlog"
            },
            {
                id : "odstrel",
                ime : "Pregled odstrela",
                vloga : "Pregled_odstrela",
                opis : "",
                unit : "%",
                footer : "Izvršenost odstrela"
            },
            {
                id : "obvestila",
                ime : "Obvestila",
                vloga : "Obvestila",
                opis : "Napiši obvestilo",
                unit : "",
                footer : "Število obvestil"
            },
            {
                id : "pregledPrijaveSkode",
                ime : "Pregled škode",
                vloga : "Pregled_škode",
                opis : "Preglej/potrdi škodo",
                unit : "",
                footer : "Nepregledane škode"
            }
        ],
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
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("NadzornaPlosca").attachPatternMatched(this.onRouteMatched, this);
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
            }
            else{
                window.open("https://fervent-agnesi-0837b8.netlify.app/", "_self");
            }
            this.byId("ldTitle").setText("Lovska družina " + globals.puo.ime_druzine);

            var oModel = new sap.ui.model.json.JSONModel();

            var filteredTiles = [];

            var vloge = [];
            for(var key in globals.puo.vloge){
                vloge.push(globals.puo.vloge[key].vloga);
            }

            this.tajli.filter(function(r) {
                if(!window.navigator.onLine){
                    if(r.id == "odstrel"){
                        filteredTiles.push(r);
                    }
                }
                else{
                    if(vloge.indexOf(r.vloga) !== -1){
                        filteredTiles.push(r);
                    }
                }
            });

            oModel.setData(filteredTiles);

            this.getView().setModel(oModel, "tajli");

            if(window.navigator.onLine){
                globals.puo.vloge.forEach(element => {
                    if(element.vloga == "Člani"){
                        steviloClanov(this);
                    }
                    if(element.vloga == "Vloge"){
                        steviloVlog(this);
                    }
                    if(element.vloga == "Obvestila"){
                        steviloObvestil(this);
                    }
                    if(element.vloga == "Pregled_odstrela"){
                        getOdstotekOdstrela(this);
                    }
                    if(element.vloga == "Pregled_škode"){
                        getNeprebranaObvestila(this);
                    }
                });
            }
            else{
                readPregledOdstrelaOdstotek(this);
            }
        },

        onLogOut: function(){
            deleteCookie(this);
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

        onTilePress: function(oEvent){
            var tile = oEvent.getSource().getHeader();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            if(tile.startsWith("Člani")){
                oRouter.navTo("Clani");
            }
            else if(tile.startsWith("Vloge")){
                oRouter.navTo("Vloge");
            }
            else if(tile.startsWith("Pregled odstrela")){
                oRouter.navTo("PregledOdstrela");
            }
            else if(tile.startsWith("Obvestila")){
                oRouter.navTo("Obvestila");
            }
            else if(tile.startsWith("Pregled škode")){
                oRouter.navTo("PregledSkode");
            }
        }
    });
 });