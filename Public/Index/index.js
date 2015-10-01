$(function(){
	$.ajax({
        method: 'GET'
        ,url: '/api/burn-list'
    }).done(function(data){
    	var count = 0;

    	var tempoTotal = 500; // Tempo total para que todos os itens sejam mostrados na tela, em milliseconds
    	var deltaTime = tempoTotal / data.length;

        data.forEach(function(burn){
        	count++;
        	$('.item-list').append('<a href="/burndown/' + count + '" target="_blank"><div class="listed-item burn-item" id="burn-' + count + '"><h3><span class="glyphicon glyphicon-fire"></span>' + burn.nome_da_equipe + '</h3></div></a>');
        	$('#burn-' + count).delay(deltaTime * count).fadeIn(1000);
        });
    });
});
