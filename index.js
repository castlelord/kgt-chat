var express = require("express");
var app = express();
var port = process.env.PORT || 3000;
var server = app.listen(port);

var bodyParser = require("body-parser");

var pg = require("pg");
var conString = process.env.DATABASE_URL || "postgres://localhost:5432/jonathan";

var id = 1;

app.use(bodyParser.json());

app.post("/send",new_message_query,hit_db,end);

app.get("/chat",chat_query,hit_db,end);

function end(req,res){
  res.end;
}

function new_message_query(req,res,next){
  console.dir(req.body);
  var query = "INSERT INTO kgt_chat VALUES(" + id + ", '" + req.body.name + "' , '" + req.body.message + "')";
  id++;
  next(query);
}

function chat_query(req,res,next){
  currentchatlocation = id - 10;
  var query = "SELECT id,name, message FROM kgt_chat";
  if(id > 10){
    query = query + " WHERE id > " + currentchatlocation
  }
  next(query);
  console.log("get");
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
      res.json(result.rows);
    });
  });
  next();
}
