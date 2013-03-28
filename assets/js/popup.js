/*----------------------------------------
*			codz by PortWatcher
*			2013.3.27 
*			GeeKlub.org
*-----------------------------------------*/



//全局变量，用于存放正在操作的书签id
var idOperating1 = 0;
var idOperating2 = 0;

//初始化，绑定事件监听－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
$(dumpBookmarks());

//绑定编辑功能
$(
	$('#btnConfirm').click(function() {
		var titleChanged = $('#editInput').val();
		console.log(titleChanged);
		var id = idOperating1;
		chrome.bookmarks.update(
			id,
			{title: titleChanged}
		);
		$('[data-id=' + id +']').text(titleChanged);
		$('#edit').modal('hide');
		
		//clean
		clean();
	})
);

$(
	$('#folder').on('hidden', function () {
		clean();
	})
);


//右键菜单----------------------------------------------------------------------------
$(function() {
	$.contextMenu({
		selector: '.block',
		items: {
			"edit": {
				name: "Edit",
				callback: function(key, options) {
					$('#editInput').val($(this).text());
					idOperating1 = $(this).attr('data-id');
					$('#edit').modal('show');
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



//遍历书签夹----------------------------------------------------------------------
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

function dumpInsideNodes(bookmarkNodes, query) {
	var i;
	for (i = 0; i < bookmarkNodes.length; i++) {
		$('#inside').append(dumpNode(bookmarkNodes[i], query));
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
		
		//绑定书签block的点击事件，点击的时候弹出新tab，若为文件夹，出现内部内容
		if (bookmarkNode.url) {
			block.click(function() {
				chrome.tabs.create({url: bookmarkNode.url});
			});
		}else { //绑定书签夹的点击事件
			block.click(function() {
				clean();
				dumpInsideNodes(bookmarkNode.children);
				$('#folder').modal('show');
			});
		}
		//绑定ondragstart事件
		block.on('dragstart', function() {
			$('#dustbin').show();
			idOperating1 = $(this).attr('data-id');
		});
		block.on('dragover', function(event) {
			event.preventDefault();
		});
		
		//绑定书签block的ondrop事件，当两个block重叠时将它们合并到一个书签夹里
		if(bookmarkNode.url) {
			block.on('drop', function(event) {
				event.preventDefault();
				handleBookmarkDrop(block.attr('data-id'));
			});
		}else {			//绑定书签夹block的ondrop事件，将书签移动到书签夹里
			block.on('drop', function(event) {
				event.preventDefault();
				handleFolderDrop(block.attr('data-id'));
			});
		}
	}
	//console.log(bookmarkNode);
	if (bookmarkNode.children && bookmarkNode.id <= 3) {
		dumpTreeNodes(bookmarkNode.children, query);
		//console.log("This is the No." + count + " loop dump.I am dumping " + bookmarkNode.title);
	}
	if(bookmarkNode.id != 1 && bookmarkNode.id != 2) {
		return block;
	}
}

//handleBookmarkDrop-----------------------------------------------------------
function handleBookmarkDrop(idDrop) {
	var idDropped = idOperating1;
	if(idDrop != idDropped && idDrop) {
		//将被拖过来的书签从用户界面上删除
		$('[data-id=' + idDropped + ']').remove();
		
		//创建书签夹，不指定url
		var bookmarkFolderCreated =  chrome.bookmarks.create({
			parentId: "1",
			title: "Bookmark Folder"
		}, function(bookmarkFolderCreated) {
			console.log("BookmarkFolder has been created successfully." + bookmarkFolderCreated);
			//将两个书签都移动到书签夹里
			chrome.bookmarks.move(
				idDropped,
				{parentId: bookmarkFolderCreated.id}
			);
			chrome.bookmarks.move(
				idDrop,
				{parentId: bookmarkFolderCreated.id}
			);
		});
		
		//clean
		clean();
		
		location.reload();
	}
}


//handleFolderDrop---------------------------------------------------------------
function handleFolderDrop(idDrop) {
	var idDropped = idOperating1;
	chrome.bookmarks.move(
		idDropped,
		{parentId: idDrop}
	);
	
	//clean
	clean();
	
	location.reload();
}


//clean------------------------------------------------------------------------------
function clean() {
	idOperating1 = 0;
	idOperating2 = 0;
	
	$('#inside').html("");
}



//复制到剪切板，其实就是临时创建一个div然后把text放进去再设置焦点，最后模拟ctrl+c行为----
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