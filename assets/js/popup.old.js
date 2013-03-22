function dumpBookmarks(query) {
	var bookmarkTreeNodes = chrome.bookmarks.getTree(
    	function(bookmarkTreeNodes) {
    		$('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes, query));
      	});
}


function dumpTreeNodes(bookmarkNodes, query) {
	var list = $('<ul>');
    var i;
    for (i = 0; i < bookmarkNodes.length; i++) {
    	list.append(dumpNode(bookmarkNodes[i], query));
	}

    return list;
}


function dumpNode(bookmarkNode, query) {
	if (bookmarkNode.title) {
    	if (query && !bookmarkNode.children) {
    		if (String(bookmarkNode.title).indexOf(query) == -1) {
          		return $('<span></span>');
        	}
      	}

     	var anchor = $('<a>');
      	anchor.attr('href', bookmarkNode.url);
      	anchor.text(bookmarkNode.title);      
      	anchor.click(function() {
        	chrome.tabs.create({url: bookmarkNode.url});
      	});
    }

    var li = $(bookmarkNode.title ? '<li>' : '<div>').append(anchor);

    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
      li.append(dumpTreeNodes(bookmarkNode.children, query));
    }

    return li;
}


$(dumpBookmarks());