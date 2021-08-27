var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var checkAuth = require('../app/middleware/auth-check')

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


var mysql = require("mysql");
var con = mysql.createPool({
    connectionLimit : 10,
    host: "eu-cdbr-west-01.cleardb.com",
    user: "bf1cb1a1da13fc",
    password: "ccace55e",
    database: "heroku_940e359a52b768c"
});

/*con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});*/

app.post('/user_exists', checkAuth, function (req, res) {
    var username = req.body.username;

    con.query("SELECT uporabniskoIme FROM uporabnik WHERE uporabniskoIme=?", [username], function(err, rows){
        if(err){
            console.log(err);
            res.send("Napaka");
        }
        else{
            if(rows[0] == undefined){
                res.status(200).send({
                    UserExists : false
                })
            }
            else{
                res.status(200).send({
                    UserExists : true
                })
            }
        }
    })
})

app.post('/addUser', checkAuth, function (req, res) {
    var ld = req.body.ld;
    var ime = req.body.ime;
    var priimek = req.body.priimek;
    var username = req.body.username;
    var pass = req.body.password;
    var prvaPrijava = 1;

    bcrypt.hash(pass, 10, function(err, hash) {
        con.query("INSERT INTO uporabnik(druzina_id, ime, priimek, password, uporabniskoIme, prva_prijava) VALUES((SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?),?,?,?,?,?)", [ld, ime, priimek, hash, username, prvaPrijava], function(err, rows){
            if(err){
                console.log(err);
                res.send("Napaka");
            }
            else{
                res.send("Dodan");
            }
        })
    });
})

app.post('/get_users', checkAuth, function (req, res) {
    var ld = req.body.ld;

    con.query("SELECT uporabniskoIme FROM uporabnik WHERE druzina_id IN (SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?)", [ld], function(err, rows){
        if(err){
            console.log(err);
            res.send("Napaka");
        }
        else{
            if(rows.length > 0 && rows[0].uporabniskoIme != undefined){
                res.status(200).json({
                    uporabniki: rows
                })
            }
            else{
                res.send("Napaka");
            }
        }
    })
})

app.post('/delete_users', checkAuth, function (req, res) {
    var username = req.body.username;
    var ld = req.body.ld;

    con.query("UPDATE uporabnik SET druzina_id=NULL WHERE uporabniskoIme=? AND druzina_id IN (SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?)", [username, ld], function(err, rows){
        if(err){
            console.log(err);
            res.send("Napaka");
        }
        else{
            if(rows.affectedRows == 0){
                res.status(200).json({
                    Error : "Ni izbrisan"
                })
            }
            else if(rows.affectedRows > 0){
                res.status(200).json({
                    Success : "Uspešno izbrisan"
                })
            }
            else{
                res.send("Napaka");
            }
        }
    })
})

app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    con.query("SELECT u.uporabniskoime, u.ime, u.priimek, u.password, l.ime_druzine FROM uporabnik u JOIN lovska_druzina l ON u.druzina_id=l.druzina_id WHERE uporabniskoime = ?", [username], function(err, rows){
        if(err){
           console.log(err);
        }
        else{
            if(rows.length > 0){
                var hash = rows[0].password;
                bcrypt.compare(password, hash, function(err, result) {
                    if(err){
                        console.log(err);
                        res.send("err");
                    }
                    else if(result == true){
                        var token = jwt.sign({username}, "secret_key");
                        res.status(200).json({
                           username: rows[0].uporabniskoime,
                           ime: rows[0].ime,
                           priimek: rows[0].priimek,
                           ime_druzine: rows[0].ime_druzine,
                           token: token
                        })
                    }
                    else{
                        res.send("Napačno geslo");
                    }
                });
            }
            else{
               res.send("Napačno uporabniško ime");
            }
       }    
    })
})

app.post('/aktivenLov', checkAuth, function (req, res) {
    var username = req.body.username;
    con.query("SELECT l2.naziv_lovisca, l1.zacetek FROM lov l1 JOIN lovisce l2 ON l1.lovisce_id = l2.lovisce_id WHERE l1.uporabnik_id IN (SELECT uporabnik_id FROM uporabnik WHERE uporabniskoIme=?) AND l1.konec IS NULL", [username], function(err, rows){
        if(err){
            console.log(err);
            res.send("Napaka");
        }
        else{
            if(rows.length > 0){
                res.status(200).json({
                    AktivniLov : rows
                })
            }
            else{
                res.status(200).json({
                    info : "Ni aktivnih lovov"
                })
            }
        }
    })
})

app.post('/vloge', checkAuth, function (req, res) {
    var username = req.body.username;
    con.query("SELECT v.vloga FROM uporabnik_vloge uv JOIN vloge v ON uv.vloga_id=v.vloga_id WHERE uporabnik_id IN (SELECT uporabnik_id FROM uporabnik WHERE uporabniskoIme=?)", [username], function(err, rows){
        if(err){
            console.log(err);
            res.send("Napaka");
        }
        else{
            if(rows.length > 0){
                res.send({vloge : rows});
            }
            else{
                res.status(200).json({
                    info : "Ni vlog"
                })
            }
        }
    })
})

app.get('/all_vloge', checkAuth, function (req, res) {
    con.query("SELECT * FROM vloge", function(err, rows){
        if(err){
            console.log(err);
            res.send("Napaka");
        }
        else{
            if(rows.length > 0){
                res.send({vloge : rows});
            }
            else{
                res.status(200).json({
                    info : "Ni vlog"
                })
            }
        }
    })
})

app.post('/get_user_vloga', checkAuth, function (req, res) {
    var username = req.body.username;
    con.query("SELECT vloga_id FROM uporabnik_vloge WHERE uporabnik_id IN (SELECT uporabnik_id FROM uporabnik WHERE uporabniskoIme=?)", [username], function(err, rows){
        if(err){
            console.log(err);
            res.send("Napaka");
        }
        else{
            if(rows.length > 0){
                res.send({vloge : rows});
            }
            else{
                res.status(200).json({
                    info : "Ni vlog"
                })
            }
        }
    })
})

app.post('/delete_vloge', checkAuth, function (req, res) {
    var username = req.body.username;
    var vloge = req.body.vloge;

    con.query("DELETE FROM uporabnik_vloge WHERE vloga_id IN (" + vloge + ") AND uporabnik_id IN (SELECT uporabnik_id FROM uporabnik WHERE uporabniskoIme=?)", [username], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        else{
            res.status(200).json({
                Success : "X"
            })
        }
    })
})

app.post('/user_id', checkAuth, function (req, res) {
    var username = req.body.username;

    con.query("SELECT uporabnik_id FROM uporabnik WHERE uporabniskoIme=?", [username], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        if(rows.length > 0){
            res.status(200).json({
                id : rows[0]
            })
        }
        else{
            res.status(400).json({
                error : "X"
            })
        }
    })
})

app.post('/add_vloge', checkAuth, function (req, res) {
    var user_id = req.body.user_id;
    var vloge = req.body.vloge;

    var values = [];

    vloge.forEach(element => {
        values.push([user_id, element]);
    });

    con.query("INSERT INTO uporabnik_vloge VALUES ?", [values], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        else{
            res.status(200).json({
                Success : "X"
            })
        }
    })
})

app.post('/user_count', checkAuth, function (req, res) {
    var ld = req.body.ld;
    con.query("SELECT COUNT(*) FROM uporabnik WHERE druzina_id IN (SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?)", [ld], function(err, rows){
        if(err){
            console.log(err);
            res.send("Napaka");
        }
        else{
            if(rows.length > 0 && rows[0]["COUNT(*)"] != undefined){
                res.send({stevilo_clanov : rows[0]["COUNT(*)"]});
            }
            else{
                res.status(200).json({
                    info : "Ni članov"
                })
            }
        }
    })
})

app.get('/vloge_count', checkAuth, function (req, res) {
    con.query("SELECT COUNT(*) FROM vloge", function(err, rows){
        if(err){
            console.log(err);
            res.send("Napaka");
        }
        else{
            if(rows.length > 0 && rows[0]["COUNT(*)"] != undefined){
                res.send({stevilo_vlog : rows[0]["COUNT(*)"]});
            }
            else{
                res.status(200).json({
                    info : "Ni članov"
                })
            }
        }
    })
})

app.post('/zasebna_obvestila_count', checkAuth, function (req, res) {
    var ld = req.body.ld;
    con.query("SELECT COUNT(*) FROM obvestilo WHERE javno='0' AND druzina_id IN (SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?)", [ld], function(err, rows){
        if(err){
            console.log(err);
            res.send("Napaka");
        }
        else{
            if(rows.length > 0 && rows[0]["COUNT(*)"] != undefined){
                res.send({stevilo_obvestil : rows[0]["COUNT(*)"]});
            }
            else{
                res.status(200).json({
                    info : "Ni članov"
                })
            }
        }
    })
})

app.post('/zasebna_obvestila', checkAuth, function (req, res) {
    con.query("SELECT obvestilo_id as id, naslov, obvestilo FROM obvestilo WHERE javno=0", function(err, rows){
        if(err){
            console.log(err);
        }
        else{
            if(rows.length > 0){
                res.send(rows);
            }
            else{
                res.status(200).json({
                    info : "Ni obvestil"
                })
            }
        }
    })
 })

 app.post('/lovisca', checkAuth, function (req, res) {
     var LD = req.body.LD;
    con.query("SELECT naziv_lovisca FROM lovisce WHERE druzina_id IN (SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?)", [LD], function(err, rows){
        if(err){
            console.log(err);
        }
        else{
            if(rows.length > 0){
                res.send(rows);
            }
            else{
                res.status(200).json({
                    info : "Ni lovišč"
                })
            }
        }
    })
 })

 app.get('/divjad', checkAuth, function (req, res) {
    con.query("SELECT divjad FROM divjad", function(err, rows){
        if(err){
            console.log(err);
        }
        else{
            if(rows.length > 0){
                res.send(rows);
            }
            else{
                res.send("Ni divjadi");
            }
        }
    })
 })

 app.post('/lov', checkAuth, function (req, res) {
    var username = req.body.username;
    var lovisce = req.body.lovisce;
    var zacetek = req.body.zacetek;
    var konec = req.body.konec;
    var stevilo_strelov = req.body.stevilo_strelov;
    var plen = req.body.plen;

    zacetek = zacetek.split(".")[0];
    konec = konec.split(".")[0];

    if(konec == ""){
        con.query("INSERT INTO lov (uporabnik_id, lovisce_id, zacetek) VALUES ((SELECT uporabnik_id FROM uporabnik WHERE uporabniskoIme=?), (SELECT lovisce_id FROM lovisce WHERE naziv_lovisca=?), ?)", [username, lovisce, zacetek], function(err, rows){
            if(err){
                console.log(err);
                res.status(400).json({
                    Error : "X"
                })
            }
            else{
                res.status(200).json({
                    Success : "X"
                })
            }
        })
    }
    else{
        con.query("UPDATE lov SET konec=?, stevilo_strelov=?, divjad_id=(SELECT divjad_id FROM divjad WHERE divjad=?) WHERE zacetek=? AND uporabnik_id IN (SELECT uporabnik_id FROM uporabnik WHERE uporabniskoIme=?)", [konec, stevilo_strelov, plen, zacetek, username], function(err, rows){
            if(err){
                console.log(err);
                res.status(400).json({
                    Error : "X"
                })
            }
            else{
                res.status(200).json({
                    Success : "X"
                })
            }
        })
    }
})

app.post('/aktivniLov', checkAuth, function (req, res) {
    var LD = req.body.LD;

    con.query("SELECT u.ime, u.priimek, l1.zacetek, l2.naziv_lovisca FROM lov l1 JOIN lovisce l2 ON l1.lovisce_id = l2.lovisce_id JOIN uporabnik u ON u.uporabnik_id = l1.uporabnik_id WHERE l1.konec IS NULL AND l2.druzina_id IN (SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?)", [LD], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        else{
            res.status(200).json({
                aktivniLovi : rows
            })
        }
    })
})

app.post('/update_plan', checkAuth, function (req, res) {
    var lovisce = req.body.lovisce;
    var plen = req.body.plen;

    con.query("INSERT INTO plan_odstrela (druzina_id, divjad_id, izvrsen_odstrel) values ((SELECT druzina_id FROM lovisce WHERE naziv_lovisca=?), (SELECT divjad_id FROM divjad WHERE divjad=?), 1) ON DUPLICATE KEY UPDATE izvrsen_odstrel = izvrsen_odstrel+1", [lovisce, plen], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        else{
            res.status(200).json({
                Success : "X"
            })
        }
    })
})

app.post('/pregled_odstrela', checkAuth, function (req, res) {
    var LD = req.body.LD;

    con.query("SELECT p.planiran_odstrel, p.izvrsen_odstrel, d.divjad FROM plan_odstrela p JOIN divjad d ON p.divjad_id=d.divjad_id WHERE druzina_id IN (SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?)", [LD], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        else{
            res.status(200).json({
                PregledOdstrela : rows
            })
        }
    })
})

app.post('/odstotek_odstrela', checkAuth, function (req, res) {
    var LD = req.body.LD;

    con.query("SELECT SUM(planiran_odstrel) as planiran, SUM(izvrsen_odstrel) as izvrsen FROM plan_odstrela WHERE druzina_id IN (SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?)", [LD], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        else{
            res.status(200).json({
                odstrel : rows[0]
            })
        }
    })
})

app.post('/neprebrana_obvestila', checkAuth, function (req, res) {
    var LD = req.body.LD;

    con.query("SELECT COUNT(*) as neprebrana FROM prijava_skode WHERE pregledano='0' AND druzina_id IN (SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?)", [LD], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        else{
            res.status(200).json({
                obvestila : rows[0]
            })
        }
    })
})

app.post('/pregled_skode', checkAuth, function (req, res) {
    var LD = req.body.LD;

    con.query("SELECT ime_oskodovanca, priimek_oskodovanca, telefonska_stevilka, opombe, pregledano FROM prijava_skode WHERE druzina_id IN (SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?)", [LD], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        else{
            res.status(200).json({
                PregledSkode : rows
            })
        }
    })
})

app.post('/update_skoda', checkAuth, function (req, res) {
    var pregledano = req.body.pregledano;
    var ime = req.body.ime;
    var priimek = req.body.priimek;
    var telefonska = req.body.telefonska;
    var opombe = req.body.opombe;

    con.query("UPDATE prijava_skode SET pregledano=? WHERE ime_oskodovanca=? AND priimek_oskodovanca=? AND telefonska_stevilka=? AND opombe=?", [pregledano, ime, priimek, telefonska, opombe], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        else{
            if(rows.changedRows == "1"){
                res.status(200).json({
                    Updated : "true"
                })
            }
            else{
                res.status(200).json({
                    Updated : "false"
                })
            }
        }
    })
})

app.post('/delete_lov', checkAuth, function (req, res) {
    var username = req.body.username;
    var zacetek = req.body.zacetek;

    zacetek = zacetek.split(".")[0];
    
    con.query("DELETE FROM lov WHERE zacetek=? AND uporabnik_id IN (SELECT uporabnik_id FROM uporabnik WHERE uporabniskoIme=?)", [zacetek, username], function(err, rows){
        if(err){
            console.log(err);
            res.status(400).json({
                Error : "X"
            })
        }
        else{
            res.status(200).json({
                Success : "X"
            })
        }
    })
})

app.post('/prijava_skode', function (req, res) {
    var LD = req.body.LD;
    var ime = req.body.ime;
    var priimek = req.body.priimek;
    var tel = req.body.tel;
    var opombe = req.body.opombe;
    if(opombe == undefined){
        opombe = "Brez opomb";
    }

    con.query("INSERT INTO prijava_skode (druzina_id, ime_oskodovanca, priimek_oskodovanca, telefonska_stevilka, opombe) VALUES ((SELECT druzina_id FROM lovska_druzina WHERE ime_druzine=?), ?, ?, ?, ?)", [LD, ime, priimek, tel, opombe], function(err, rows){
        if(err){
            console.log(err);
            res.send(err);
        }
        else{
            res.send("Success");
        }
    })
})

app.get('/javna_obvestila', function (req, res) {
   con.query("SELECT naslov, obvestilo FROM obvestilo WHERE javno=1", function(err, rows){
       if(err){
           console.log(err);
           res.send("Napaka");
       }
       else{
           if(rows.length > 0){
               res.send(rows);
           }
           else{
               res.send("Ni javnih obvestil");
           }
       }
   })
})

app.get('/lovske_druzine', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
   con.query("SELECT ime_druzine FROM lovska_druzina", function(err, rows){
       if(err){
           console.log(err);
       }
       else{
           if(rows.length > 0){
               res.send(rows);
           }
           else{
               res.send("Ni lovskih družin");
           }
       }
   })
})

var server = app.listen(process.env.PORT || 8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://127.0.0.1:%s", port)
})