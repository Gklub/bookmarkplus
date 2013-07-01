/*----------------------------------------
*			codz by PortWatcher
*			2013.3.27 
*			GeeKlub.org
*-----------------------------------------*/

(function () {
	var idOperating1 = '0';
	var idOperating2 = '0';
	var index;
	var idCurrentDir = '0'; // Stands for the current directory.
	load(idCurrentDir);
	/*load*/
	function load(id){
		clean();
		chrome.bookmarks.getSubTree(id,function(subtree){
			subtree= subtree[0].children;
			dumpInsideNodes(subtree);
		});
		$('.path').click(function(){
			if($(this).hasClass('active')){
				return;
			}else{
				$(this).parent().find('.active').removeClass('active');
				$(this).addClass("active");
				load($(this).attr('idDir'));
			}
		});
	}
	/*添加显示自定义的书签文件夹*/
	function dumpInsideNodes(bookmarkNodes, query) {
		var i;
		for (i = 0; i < bookmarkNodes.length; i++) {
			$('#bookmarks').append(dumpNode(bookmarkNodes[i], query));
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

			block.click(function () {
				idCurrentDir = block.attr('data-id');
				if($('#dirPath').find('.active').next().length !== 0){
					$('#dirPath').find('.active').nextAll().remove();
				}
				$('#dirPath').find('.active').removeClass();
				if(block.text() === ""){
					block.text('空');
				}
				$('#dirPath').append("<li class='path active' idDir="+idCurrentDir+"><p>"+block.text()+"</p></li>");
				clean();
				load(idCurrentDir);
			});

			block.on('drop', function (event) {
				event.preventDefault();
				handleFolderDrop(block.attr('data-id'));
			});
		} else {//书签
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

			block.popover({
				content: bookmarkNode.title,
				placement: 'top'
			});
		}
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
		idOperating1 = '0';
		idOperating2 = '0';
		$('#bookmarks').html("");
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

	function changePath(idPath){

	}
	$(

	);

	$(
		$('#btnConfirm').click(function() {
			var titleChanged = $('#editInput').val();
			chrome.bookmarks.update(
				idOperating1,
				{title: titleChanged}
			);
			$('#edit').modal('hide');
			load(idCurrentDir);
		})
	);
	//New a bookmark folder-----------------------------------------------------------------
	$(
		$('#addFolder').click(function(){
			var newBookMark = {
				'parentId':idCurrentDir
			};
			chrome.bookmarks.create(newBookMark,function(newBookMarkNode){
				$('#editInput').val('');
				$('#edit').modal('show');
				idOperating1 = newBookMarkNode.id;
				console.log("idOperating1:"+idOperating1+".idCurrentDir:"+idCurrentDir);
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
		$('#addBookmark').click(function(){
			var tabs = chrome.tabs.query({currentWindow:true,highlighted:true}, function (tabs) {
				var bookmark = {
					'parentId':idCurrentDir+''
				};
				bookmark.title = tabs[0].title+'';
				bookmark.url = tabs[0].url+'';
				//添加一个chrome书签
				chrome.bookmarks.create(bookmark);
				load(idCurrentDir);
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
						$('#edit').modal('show');
						idOperating1 = $(this).attr('data-id');
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





