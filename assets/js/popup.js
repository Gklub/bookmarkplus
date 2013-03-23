/*----------------------------------------
			codz by PortWatcher
			2013.3.23 
			GeeKlub.org
------------------------------------------
*/


//全局变量，用于存放正在操作的书签id
var operateID;

//初始化，绑定事件监听－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
$(dumpBookmarks());
$($('#dustbin').on('dragover', function(event) {
	event.preventDefault();
}));

$($('#dustbin').on('drop', function(event) {
	event.preventDefault();
	var id = operateID;
	chrome.bookmarks.remove(id);
	$('#block').attr('data-id', id).remove();
	$('#dustbin').hide();
}));



//右键菜单－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
$(function() {
	$.contextMenu({
		selector: '.block',
		items: {
		//edit功能未实现
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



//遍历书签夹－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
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
		block.addClass("block");  //添加样式
		block.addClass("span1");
		//添加属性
		block.attr({
			'draggable': "true",
			'data-url': bookmarkNode.url,
			'data-id': bookmarkNode.id
		});
		//设置方块显示的文字，即title
		block.addClass("block");
		block.addClass("span1");
		block.attr({
			'draggable': "true",
			'data-url': bookmarkNode.url,
			'data-id': bookmarkNode.id,
		});
		block.text(bookmarkNode.title);
		//绑定block的点击事件，点击的时候弹出新tab
		block.click(function() {
			chrome.tabs.create({url: bookmarkNode.url});
		});
		block.on('dragstart', function() {
			$('#dustbin').show();
			operateID = $(this).attr('data-id');
			console.log(operateID); //chrome控制台调试
		}); 
	}
	if (bookmarkNode.children && bookmarkNode.children.length > 0) {		
		dumpTreeNodes(bookmarkNode.children, query);
    }

	return block;
}



//复制到剪切板，其实就是临时创建一个div然后把text放进去再设置焦点，最后模拟ctrl+c行为－－－－－－
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