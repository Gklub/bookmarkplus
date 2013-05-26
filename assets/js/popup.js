/*----------------------------------------
*			codz by PortWatcher
*			2013.3.27 
*			GeeKlub.org
*-----------------------------------------*/
(function() {
	var idOperating1 = 0;
    var idOperating2 = 0;
	var root;
	var children;//The root's children.
    var bookmarksBar;
    var otherBookmarks;
    var index;
    var currentId = 0;//表示当前页面的父节点id，默认是0，即指向书签树的root节点.
    chrome.bookmarks.getTree(
		function(bookmarkTreeNodes){
			root = bookmarkTreeNodes[0];
			children = root.children;
			bookmarksBar = children[0];
			otherBookmarks = children[1];
			console.log(otherBookmarks);
			for (index = 0; index < bookmarksBar.children.length; index++) {
				$('#bookmarks').append(dumpNode(bookmarksBar.children[index]));
			}
			for(index = 0; index < otherBookmarks.children.length; index++){
				$('#bookmarks').append(dumpNode(otherBookmarks.children[index]));
			}
			$('#bookmarks').append(dumpNode(children[2]));
    });
    /*添加显示自定义的书签文件夹*/
	function dumpInsideNodes(bookmarkNodes, query) {
		var i;
		for (i = 0; i < bookmarkNodes.length; i++) {
			$('#inside').append(dumpNode(bookmarkNodes[i], query));
		}
	}
	/*为每个书签（包括书签文件夹）生成一个div，并返回*/
    function dumpNode(bookmarkNode, query) {
		var block = $('<div>');
		var br = $('<br>');
		//设置方块显示的文字，即title
		block.text(bookmarkNode.title);
		block.addClass("span1");
		//添加属性
		block.attr({
			'draggable': "true",
			'data-url': bookmarkNode.url,
			'data-id': bookmarkNode.id
		});

		//绑定ondragstart和ondragover事件
		block.on('dragstart',function(){
			idOperating1 = $(this).attr('data-id');
		});
		block.on('dragover', function(event) {
			event.preventDefault();
		});

		//书签夹和书签的click事件，drop事件，样式都不同，区分方法则为bookmarkNode.children
		if(bookmarkNode.children) {//书签文件夹
			block.addClass("folder"); //添加样式

			block.click(function() {
				currentId = block.attr('data-id');
				clean();
				dumpInsideNodes(bookmarkNode.children);
				$('#folder').modal('show');
			});

			block.on('drop', function(event) {
				event.preventDefault();
				handleFolderDrop(block.attr('data-id'));
			});
		}else{//书签
			block.addClass("block");  //添加样式

			block.click(function() {
				chrome.tabs.create({url: bookmarkNode.url});
			});

			block.on('drop', function(event) {
				event.preventDefault();
				handleBookmarkDrop(block.attr('data-id'));
			});

			var favicon = $('<img>');
			favicon.attr('src', 'chrome://favicon/' + bookmarkNode.url);
			block.prepend(favicon);
		}
		console.log(block);
		return block;
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
				title: "Untitled Folder"
			}, function(bookmarkFolderCreated) {
				console.log("BookmarkFolder has been created successfully." + bookmarkFolderCreated.id);
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
		if(idDrop != idDropped) {
			chrome.bookmarks.move(
				idDropped,
				{parentId: idDrop}
			);
		}
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


	//Update the  name of a bookmark folder-------------------------------
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

	//New a  bookmark folder-----------------------------------------------------------------
	$(
		$('#addFolder').click(function(){
			var newBookMark = {
				parentId:currentId+''
			};
			var newBookMarkNode = chrome.bookmarks.create(newBookMark,function(newBookMarkNode){
				$('#editInput').val('');
				idOperating1 = newBookMarkNode.id;//将idOperationg1设置成新文件夹的id。
				$('#edit').modal('show');
			});
		})
	);

	$(
		$('#folder').on('hidden', function () {
			clean();
		})
	);

	//Add the present bookmark---------------------------------------------------------------
	$(
		$('#addBookMark').click(function(){
			console.log(chrome.tabs.url);
			var tabs = chrome.tabs.query({currentWindow:true,highlighted:true},function(tabs){
				var bookMark ={
					parentId:currentId+''
				};
				bookMark.title = tabs[0].title+'';
				bookMark.url = tabs[0].url+'';
				//添加一个chrome书签
				chrome.bookmarks.create(bookMark);
				location.reload();
			});
		})
	);


	//右键菜单----------------------------------------------------------------------
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

	$(function() {
		$.contextMenu({
			selector: '.folder',
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
				}
			}
		});
	});
})();





