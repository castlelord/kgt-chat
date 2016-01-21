var express = require("express");
var app = express();
var port = process.env.PORT || 3000;
var server = app.listen(port);

var bodyParser = require("body-parser");

var pg = require("pg");
var conString = process.env.DATABASE_URL || "postgres://localhost:5432/jonathan";

var id;
var id_query = "SELECT MAX(id) FROM kgt_chat";
function id_updater(qry){
  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error("error fetching client from pool", err);
    }
    client.query(qry,function(err, result) {
      done();
      if(err) {
        return console.error("error running query", err);
      }
      id = result.rows[0].max;
      console.log("Server started, ID seet to: " + id);
    });
  });
}

id_updater(id_query);

app.use(bodyParser.json());

app.post("/send",new_message_query,hit_db,end);

app.get("/chat/list",chat_list_query,hit_db,end);

app.get("/chat/last",chat_last_query,hit_db,end);

function end(req,res){
  res.end;
}

function new_message_query(req,res,next){
  console.dir(req.body);
  id++;
  var query = "INSERT INTO kgt_chat VALUES(" + id + ", '" + req.body.name + "' , '" + req.body.message + "')";
  next(query);
}

function chat_list_query(req,res,next){
  currentchatlocation = id - 10;
  var query = "SELECT id,name, message FROM kgt_chat";
  if(id > 10){
    query = query + " WHERE id > " + currentchatlocation
  }
  next(query);
  console.log("get-list");
}

function chat_last_query(req,res,next){
  var query = "SELECT id,name, message FROM kgt_chat WHERE id = " + id;
  next(query);
  console.log("get-last");
}

function hit_db(qry,req,res,next){
  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error("error fetching client from pool", err);
    }
    client.query(qry,function(err, result) {
      done();
      if(err) {
        return console.error("error running query", err);
      }
      res.json({'chat' : result.rows});
    });
  });
  next();
}
