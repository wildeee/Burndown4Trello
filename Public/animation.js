var addAnimations = function(){
	closeTargetAnimation();
};

var closeTargetAnimation = function(){
	$('.btn-close').on('click', function(){
		var target = $(this).attr('close-target');
		$('#' + target).slideToggle('slow');
	});
};