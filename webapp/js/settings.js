function initLovec(){
    globals.puo = {};
    globals.lov = {};
}

var indexedDBSupport;

var globals = {};

var lovske_druzine;

const backend = "https://elovec.herokuapp.com/"

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

Date.prototype.subtractHours= function(h){
    this.setHours(this.getHours()-h);
    return this;
}

initLovec();