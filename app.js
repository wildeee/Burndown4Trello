var express = require('express');
var app = express();
var http = require('http').Server(app);
var imageToAsciiConsole = require('ascii-images');


app.use('/JQUERY', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/DEPENDENCIES', express.static(__dirname + '/Public/'));
app.use('/MODULES', express.static(__dirname + '/node_modules/'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/Public/Index/index.html');
});

app.get('/OS002_sprint1', function(req, res){
	res.sendFile(__dirname + '/Public/OS002_sprint1/index.html');
});

app.get('/burndown/:id', function(req, res){
	res.sendFile(__dirname + '/Public/burndown/burndown.html');
});

app.get('/api/burn-list', function(req, res) {
	res.sendFile(__dirname + '/Public/burndowns.json');
});

app.get('/api/config/:id', function(req, res){
	var globalConfig = require('./Public/global-config.json');
	var id = req.params.id;

	var burndown = require('./Public/burndowns.json')[id - 1];


	res.send({ //Adaptação para o formato esperado pelo front end
		sprintConfig: {
			"url_trello": burndown.url_trello

			,"data_inicial": burndown.data_inicial

			,"data_final": burndown.data_final

			,"dias_sem_jornada": burndown.dias_sem_jornada

			,"legenda_burndown": burndown.legenda_burndown

			,"width": burndown.width
		},
		sysConfig: {
			"nome_da_equipe": burndown.nome_da_equipe

			,"cor_de_fundo_do_titulo": globalConfig.cor_de_fundo_do_titulo

			,"cor_de_fundo_da_tela": globalConfig.cor_de_fundo_da_tela

			,"cor_fonte": globalConfig.cor_fonte

			,"key_trello": globalConfig.key_trello

			,"token_trello": globalConfig.token_trello

			,"nome_eixo_y": globalConfig.nome_eixo_y

			,"nome_label_burndown": burndown.nome_label_burndown
		}
	});	
});


var port = 3000;
http.listen(port, function(){
	imageToAsciiConsole(__dirname + '/assets/db1-logo.png', function(result){
  		console.log(result);
		console.log('Rodando na porta ' + port);
	});
});