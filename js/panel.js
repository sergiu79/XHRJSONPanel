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
	console.log(netevent);
	var line;
	if (netevent.response.content.mimeType.indexOf('application/json')>-1) {
		lineIndex++;
		var cssStatusClass = netevent.response.status !==200 ? 'red': ''; 
		line = '<li id="k' + lineIndex + '" class="' + cssStatusClass + '">';
		line += '	<div class="line">';
		line += '		<span class="icon collapsed"></span><span class="url">' + netevent.request.method + '  '  + netevent.request.url + '</span> <span class="status">' +netevent.response.status + ' ' + netevent.response.statusText + '</span>'; 
		line += '	</div>';
		line += '	<div class="json_content hide">';
		line += '		<div class="response"></div>';
		line += '		<div class="request"></div>';
		line += '		<div class="clear"></div>';
		line += '	</div>';
		line += '</li>';
		$('#loglist').append(line);
		var request = netevent.request.queryString;
		
		$('#k'+lineIndex).find('.request').JSONView(extractParameters(request));
		if (netevent.request.postData && netevent.request.postData.mimeType.indexOf('application/json')>-1){
			var postContent = JSON.parse(netevent.request.postData.text);
			$('#k'+lineIndex).find('.request').append('<div>POST Payload:</div><div class="request_payload"></div>');
			$('#k'+lineIndex).find('.request_payload').JSONView(postContent);
		}
		netevent.getContent($.proxy(function(body, encoding){ 
			var parsed = JSON.parse(body); 
			$('#k'+this.lineIndex).find('.response').JSONView(parsed);
		}, {lineIndex:lineIndex}));
	}
});