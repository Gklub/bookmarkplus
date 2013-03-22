function dumpBookmarks(query) {
	var bookmarkTreeNodes = chrome.bookmarks.getTree(
    	function(bookmarkTreeNodes) {
    		dumpTreeNodes(bookmarkTreeNodes, query);
      	});
}

function dumpTreeNodes(bookmarkNodes, query) {
	var i;
	for (i = 0; i < bookmarkNodes.length; i++) {
		$('#bookmarks').append(dumpNode(bookmarkNodes[i], query));
	}
}

function dumpNode(bookmarkNode, query) {
	if(bookmarkNode.title) {
		var block = $('<div>');
		block.addClass("block");
		block.text(bookmarkNode.title);
		block.click(function() {
			chrome.tabs.create({url: bookmarkNode.url});
		});
	}
	if (bookmarkNode.children && bookmarkNode.children.length > 0) {		
		dumpTreeNodes(bookmarkNode.children, query);
    }

	return block;
}

$(dumpBookmarks());