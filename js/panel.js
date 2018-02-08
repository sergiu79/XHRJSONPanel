var lineIndex=0;
function toggle(e) {
	var li = $(e.currentTarget).closest('li');
	if (li.find('span:first').hasClass('collapsed')){
		li.find('span:first').removeClass('collapsed').addClass('expanded');
		li.find('.json_content').removeClass('hide');
	} else if (li.find('span:first').hasClass('expanded')){
		li.find('span:first').removeClass('expanded').addClass('collapsed');
		li.find('.json_content').addClass('hide');
	} else {
		e.stopPropagation();
		e.stopImmediatePropagation();
	}
}
function clearView (e) {
	$('#loglist').empty();	
}
function expandAll(e) {
	$('.json_content').removeClass('hide');
	$('.json_content').prev().find('span:first').removeClass('collapsed').addClass('expanded');
}
function collapseAll(e){
	$('.json_content').addClass('hide');
	$('.json_content').prev().find('span:first').removeClass('expanded').addClass('collapsed');
}
function extractParameters(jsonArray) {
	var params = {};
	for (var i=0, length=jsonArray.length; i<length; i++) {
		params[jsonArray[i].name]=jsonArray[i].value;
	}
	return params;
}
$('#loglist').off().on('click','span.url', toggle);
$('#loglist').on('click','span.icon', toggle);
$('#clear').off().on('click', clearView);
$('#expandall').off().on('click', expandAll);
$('#collapseall').off().on('click', collapseAll);
chrome.devtools.network.onRequestFinished.addListener(function (netevent) {
	var line;
	var isErrorStatus = (netevent.response.status >= 400 && netevent.response.status < 600);
	if (netevent.response.content.mimeType.indexOf('application/json')>-1 || isErrorStatus ) {
		lineIndex++;
		var cssStatusClass = isErrorStatus ? 'red': '';
		line = '<li id="k' + lineIndex + '" class="' + cssStatusClass + '">';
		line += '	<div class="line">';
		line += '		<span class="icon collapsed"></span><span class="url '+ cssStatusClass + '">' + netevent.request.method + '  '  + netevent.request.url + '</span> <span class="status '+ cssStatusClass + '">' +netevent.response.status + ' ' + netevent.response.statusText + '</span>'; 
		line += '	</div>';
		line += '	<div class="json_content hide">';
		line += '		<div class="response"></div>';
		line += '		<div class="request"> GET Parameters: <p class="get_parameters"></p> </div>';
		line += '		<div class="clear"></div>';
		line += '	</div>';
		line += '</li>';
		$('#loglist').append(line);
		var request = netevent.request.queryString;
		
		$('#k'+lineIndex).find('.get_parameters').JSONView(extractParameters(request));
		if (netevent.request.postData && netevent.request.postData.mimeType.indexOf('application/json')>-1){
			var postContent = JSON.parse(netevent.request.postData.text);
			$('#k'+lineIndex).find('.request').append('<div>POST Payload:</div><div class="request_payload"></div>');
			$('#k'+lineIndex).find('.request_payload').JSONView(postContent);
		}
		netevent.getContent($.proxy(function(body, encoding){ 
			var parsed = JSON.parse(body); 
			$('#k'+this.lineIndex).find('.response').JSONView(parsed);
		}, {lineIndex:lineIndex}));
		var list = $('body');
		list.animate({scrollTop : list.prop('scrollHeight')}, '500');
	}
});
chrome.devtools.network.onNavigated.addListener(function (url){
	if (!$('#preserve_log').is(':checked')){
		clearView();
	}
});