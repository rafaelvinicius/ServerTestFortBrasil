const Mongoose = require("mongoose"), Admin = Mongoose.mongo.Admin;
var express = require('express');
var app = express();
const bodyParser = require("body-parser");
var fs = require('fs');
var request = require('request');
const cors = require("cors");
const moment = require('moment');
moment.locale('pt-br');
var Funcoes = require('./funcoes');

require("dotenv-safe").config();
const jwt = require('jsonwebtoken');

var corsOptions = { origin: "*" };
app.use(cors(corsOptions));

var http = require('http');
var httpServer = http.createServer(app);
const PORT = process.env.PORT || 5021;
httpServer.listen(PORT, () => { console.log(`Server is running on port ${PORT}.`); });

var io = require('socket.io').listen(httpServer);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

Mongoose.connect(`mongodb+srv://usermongodb:angel098@cluster0.oe0mm.gcp.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true`, {  
  useNewUrlParser: true,  useUnifiedTopology: true,
  dbName: 'FortBrasil',
 });

var conn = Mongoose.connection;

conn.on('open', function() {
  app.set('db', conn);
  Mongoose.connection.db.listCollections().toArray(function (err, names) {
    module.exports.Collection = names;
  });
});

conn.on('connected',()=>{
  console.log('MongoDB connected');    
});

conn.on('error',(err)=>{
  if(err)
  console.log(err)
});




//Listar
app.get('/Listar', verifyJWT, async function (req, res) {

  var tb_local = conn.collection('tb_local');

  await tb_local.find({}, {}).toArray(function(err, result) {
  if (err) throw err;
    if (result) {
      return res.json(result);
    }
  });

});


//Excluir
app.delete('/Excluir', async function (req, res) {

  var IdLocal = Mongoose.Types.ObjectId(req.body.IdLocal);
  var tb_local = conn.collection('tb_local');

  var filtro = {_id: IdLocal};

  tb_local.deleteOne(filtro, (err, d) => {
    if (err)
      return res.status(400);
    if (d.deletedCount == 1) {
      // console.log("Local removido");
      return res.json({ excluir: "sim" });
    } else {
      // console.log("Local não removido");
      return res.json({ excluir: "não" });
    }
  });

});


//Cadastrar
app.post('/Cadastrar', async (req, res, next) => {

  var tb_local = conn.collection('tb_local');
  var RazaoSocial = req.body.c_razao_social;
  var NomeFantasia = req.body.c_nome_fantasia;
  var CNPJ = req.body.c_cnpj;
  var Telefone = req.body.c_telefone;
  var Email = req.body.c_email;
  var Endereco = req.body.c_endereco;
  var Numero = req.body.c_numero;
  var CEP = req.body.c_cep;
  var Bairro = req.body.c_bairro;
  var Cidade = req.body.c_cidade;
  var Estado = req.body.c_estado;
  var Lat = req.body.c_lat;
  var Lon = req.body.c_lon;

  await tb_local.findOne({c_cnpj: CNPJ}, {}, function(err, result) {
    if (err)
      throw err;
    if (result) {
      return res.json({
        c_retorno: 0,
        c_msg: "já existe, não cadastrar!"
      });
    } else {
      tb_local.insertOne({
        c_razao_social: RazaoSocial,
        c_nome_fantasia: NomeFantasia,
        c_cnpj: CNPJ,
        c_telefone: Telefone,
        c_email: Email.toLowerCase(),
        c_endereco: Endereco,
        c_numero: Numero,
        c_cep: CEP,
        c_bairro: Bairro,
        c_cidade: Cidade,
        c_estado: Estado,
        c_lat: Lat,
        c_lon: Lon,
      });      
      return res.json({
        c_retorno: 1,
        c_msg: "nao existe, cadastrar!"
      });
    }
  });

});


//Editar
app.put('/Editar', async (req, res, next) => {

  var IdLocal = Mongoose.Types.ObjectId(req.body.IdLocal);
  var tb_local = conn.collection('tb_local');

  var RazaoSocial = req.body.c_razao_social;
  var NomeFantasia = req.body.c_nome_fantasia;
  var CNPJ = req.body.c_cnpj;
  var Telefone = req.body.c_telefone;
  var Email = req.body.c_email;
  var Endereco = req.body.c_endereco;
  var Numero = req.body.c_numero;
  var CEP = req.body.c_cep;
  var Bairro = req.body.c_bairro;
  var Cidade = req.body.c_cidade;
  var Estado = req.body.c_estado;
  var Lat = req.body.c_lat;
  var Lon = req.body.c_lon;

  // console.log('Passou', RazaoSocial)

  var filtro = {_id: IdLocal};

  await tb_local.updateOne(filtro,{$set:{

    c_razao_social: RazaoSocial,
    c_nome_fantasia: NomeFantasia,
    c_cnpj: CNPJ,
    c_telefone: Telefone,
    c_email: Email.toLowerCase(),
    c_endereco: Endereco,
    c_numero: Numero,
    c_cep: CEP,
    c_bairro: Bairro,
    c_cidade: Cidade,
    c_estado: Estado,
    c_lat: Lat,
    c_lon: Lon,

  }}, function(err, resultado) {
    if (err)
      throw err;
    if (resultado.modifiedCount) { 
      return res.json({
        c_retorno: 1,
        c_msg: "Local atualizado!"
      });
    } else {
      return res.json({
        c_retorno: 0,
        c_msg: "Local não atualizado!"
      });
    }
  }) 

});


//ListarLocal
app.get('/ListarLocal/:IdLocal', verifyJWT, async (req, res, next) => {
  
  var tb_local = conn.collection('tb_local');
  var IdLocal = Mongoose.Types.ObjectId(req.params.IdLocal);

  var filtro = {_id: IdLocal};  
  await tb_local.find(filtro, {}).toArray(function(err, result) {
      if (err) throw err;

      if (result) {

        res.json(result);
        res.end();
              
      } else {

          // console.log('Local não encontrado');
          res.json(null);
          res.end();

      }

  });
  
});


//Login
app.post('/Login', async (req, res, next) => {

  var Email = req.body.c_email;
  var Senha = req.body.c_senha;

  var tb_usuario = conn.collection('tb_usuario');

  // console.log('Passou', Email, Senha)

  var filtro = {c_email: Email};
  await tb_usuario.findOne(filtro, {}, function(err, result) {
      if (err)
        throw err;

      if (result) {

        if(Email === result.c_email && Senha === result.c_senha){ 
          const id = result._id;
          var privateKey  = fs.readFileSync('./private.key', 'utf8');
          var token = jwt.sign({ id }, privateKey, { 
              expiresIn: 600,
              algorithm:  "RS256"
          });
          res.json({
            auth: true,
            token: token,
            c_nome: result.c_nome,
            c_email: result.c_email
          } );
        } else {
          res.json({ auth: false } );
        }

      } else {
          // console.log('Usuário não encontrado');
          res.json({auth: false});
          res.end();

      }
  });

})


//Logout
app.post('/Logout', function(req, res) {
  console.log("Fez logout e cancelou o token!");
  res.status(200).send({ auth: false, token: null }); 
});


//Verifica o Token
function verifyJWT(req, res, next){ 
  var token = req.headers['x-access-token'];
  if (!token) 
      return res.status(401).send({ auth: false, message: 'Token não informado.' }); 
  
  var publicKey  = fs.readFileSync('./public.key', 'utf8');
  jwt.verify(token, publicKey, {algorithm: ["RS256"]}, function(err, decoded) { 
      if (err) 
          return res.status(500).send({ auth: false, message: 'Token inválido.' }); 
      
      req.userId = decoded.id; 
      // console.log("User Id: " + decoded.id)
      next(); 
  }); 
}


//Buscar
app.post('/Buscar', async (req, res, next) => {

  var tb_local = conn.collection('tb_local'); 

  await tb_local.find({"c_razao_social": new RegExp(req.body.c_busca, "i") }, {}).toArray(function(err, result) {
  if (err) throw err;
    if (result) {
      return res.json(result);
    }
  });

});