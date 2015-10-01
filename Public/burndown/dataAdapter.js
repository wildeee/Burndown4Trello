var getConfig = function(callback){

	var temp = window.location.href.split('/');
	var burnId = temp[temp.length - 1];

	$.ajax({
        method: 'GET'
        ,url: '/api/config/' + burnId
    }).done(function(data){
    	callback(data);
    });
};