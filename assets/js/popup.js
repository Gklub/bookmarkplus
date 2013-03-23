$(dumpBookmarks());

$(function() {
	$.contextMenu({
		selector: '.block',
		items: {
			"edit": {
				name: "Edit",
				callback: function(key, options) {
					var m = "clicked: " + key + " on " + $(this).text();
            		window.console && console.log(m) || alert(m); 
				}
			},
			"copy": {
				name: "Copy URL",
				callback: function(key, options) {
					var url = $(this).attr('data-url');
					copyToClipboard(url);
				}
			},
			"sepl": "-------",
			"delete": {
				name: "Delete",
				callback: function(key, options) {
					var id = $(this).attr('data-id');
					chrome.bookmarks.remove(id);
					$(this).remove();
				}
			}
		}
	});
});

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
		block.addClass("span1");
		block.attr({
			'draggable': "true",
			'data-url': bookmarkNode.url,
			'data-id': bookmarkNode.id,
		});
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

function copyToClipboard( text ){
	var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
	document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);
}