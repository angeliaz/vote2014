var pollUpdate;
(function(win, $) {
	// 州基础数据
	var Params = {
		baseName: ["alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana", "nebraska", "nevada", "newhampshire", "newjersey", "newmexico", "newyork", "northcarolina", "northdakota", "ohio", "oklahoma", "oregon", "pennsylvania", "rhodeisland", "southcarolina", "southdakota", "tennessee", "texas", "utah", "vermont", "virginia", "washington", "westvirginia", "wisconsin", "wyoming", "dc"],
		baseNameCN: ["亚拉巴马州", "阿拉斯加州", "亚利桑那州", "阿肯色州", "加利福尼亚州", "科罗拉多州", "康涅狄格州", "特拉华州", "佛罗里达州", "佐治亚州", "夏威夷州", "爱达荷州", "伊利诺伊州", "印第安纳州", "艾奥瓦州", "堪萨斯州", "肯塔基州", "路易斯安那州", "缅因州", "马里兰州", "马萨诸塞州", "密歇根州", "明尼苏达州", "密西西比州", "密苏里州", "蒙大拿州", "内布拉斯加州", "内华达州", "新罕布什尔州", "新泽西州", "新墨西哥州", "纽约州", "北卡罗来纳州", "北达科他州", "俄亥俄州", "俄克拉何马州", "俄勒冈州", "宾夕法尼亚州", "罗得岛州", "南卡罗来纳州", "南达科他州", "田纳西州", "德克萨斯州", "犹他州", "佛蒙特州", "弗吉尼亚州", "华盛顿州", "西弗吉尼亚州", "威斯康星州", "怀俄明州", "哥伦比亚特区"],
		zyStateId:  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49], // 众议院参加选举州的州id
		cyStateId:  [0,1,3,5,7,9,10,11,12,14,15,16,17,18,20,21,22,23,25,26,28,29,30,32,35,35,36,38,39,39,40,41,42,45,47,49],
		zzStateId:  [0,1,2,3,4,5,6,8,9,10,11,12,14,15,18,19,20,21,22,26,27,28,30,31,34,35,36,37,38,39,40,41,42,44,48,49],
		zySeats:    [7,1,9,4,53,7,5,1,27,14,2,2,18,9,4,4,6,6,2,8,9,14,8,4,8,1,3,4,2,12,3,27,13,1,16,5,5,18,2,7,1,9,36,4,1,11,10,3,8,1], // 参选州总席位
		zyTime:     [],
		cyTime: 	[],
		zzTime: 	[]
	};

	// 状态所对应的颜色，数组中 0 是默认颜色，1 鼠标hover的颜色，2 字体颜色
	var stateColor = {
		// 共和党领先
		r_lead: ["#e97373", "#bb5959", "#fff"],
		// 共和党获胜
		r_win: ["#ab2f2f", "#862222", "#FFFFFF"],
		// 民主党领先
		d_lead: ["#b1c7e7", "#859ab8", "#fff"],
		// 民主党获胜
		d_win: ["#3d538e", "#1e3265", "#FFFFFF"],
		// 其它党领先
		o_lead: ["#b8e2bc", "#8db190", "#fff"],
		// 其它党获胜
		o_win: ["#7cad52", "#648c42", "#fff"],
		// 两派领先
		twins_lead: ["#7d7d7d", "#565656", "#fff"],
		// 两派获胜
		twins_win: ["#7d7d7d", "#565656", "#fff"],
		// 尚未开始投票
		prepare: ["#cfcfcf", "#aeaeae", "#000000"],
		// 不参选
		not_join: ["#f6f6f6", "#e9e9e9", "#000000"]
	};

	// 工具
	var Util = {
		// 是否是移动设备
		find: function(a, b) {
			return a.indexOf(b) + 1;
		},

		// 格式化数字中的逗号
		formatDot: function(iNumber) {
			var s = iNumber + '';
			return s.replace(/(?=(?!\b)(?:\d{3})+(?!\d))/g, ',');
		},

		// 获取最大值的索引
		// 如果返回0, 说明最大值为两个
		getMaxIndex: function(n1, n2, n3) {
			var count = 0, index = 0;
			var maxNum = Math.max(n1, n2, n3);
			if(maxNum === n1) {count++; index = 1;}
			if(maxNum === n2) {count++; index = 2;}
			if(maxNum === n3) {count++; index = 3;}
			return (count === 1) ? index : 0;
		},

		// 根据州名称获取索引
		getIndexByState: function(type, stateId) {
			var stateIndex = $.inArray(stateId, Params.baseName);
			if(type === 0) {
				stateIds = Params.zyStateId;
			} else if(type === 1) {
				stateIds = Params.cyStateId;
			} else {
				stateIds = Params.zzStateId;
			}
			return $.inArray(stateIndex, stateIds);
		},

		perNum: function(arr,a,b,c){   //百分比数据
			num = arr[a] + arr[b] + arr[c] ;
			numD = arr[a] == 0 ? 0 :  parseInt(arr[a] * 100 / num) ;
			numR = arr[b] == 0 ? 0 :  parseInt(arr[b] * 100/ num) ;
			numO = arr[c] == 0 ? 0 :  100 - numR ;
			return [numD,numR,numO] ; 
		},

		shared: function(a) {
            var b = {};
            b.type = a;
            b.pic = 'http://y0.ifengimg.com/2014/05/06/16295828.jpg';
            b.title = encodeURIComponent('【2014美国大选_资讯频道_凤凰网】');
            b.url = 'http://www.ifeng.com';
            var c = '';
            //b.title = '【' + encodeURIComponent(b.title) + '】';
            //alert(b.title)
            var d = {};

            if ('sina' === b.type) {
                c = 'http://v.t.sina.com.cn/share/share.php';
                d.url = b.url;
                d.title = b.title;
                d.pic = b.pic;
                d.searchPic = !1;
                //d.appkey = '2512457640';d.ralateUid = '2615417307';
                d.appkey = '2512457640';
                d.ralateUid = '2615417307';
                d.rcontent = encodeURIComponent('');
                d.source = 'ifeng';
            } else if ('qq' === b.type) {
                c = 'http://v.t.qq.com/share/share.php';
                d.url = b.url;
                d.title = b.title;
                d.pic = b.pic;
                d.site = encodeURIComponent(window.location.host);
                d.appkey = '801cf76d3cfc44ada52ec13114e84a96';
                d.rcontent = encodeURIComponent('');
            } else if ('qqZone' === b.type) {
                c = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey';
                d.title = b.title;
                d.url = b.url;
                d.pics = b.pic;
            }

            var e = [];

            var f = new Date();
            f.setHours(0), f.setMinutes(0), f.setSeconds(0), f.setMilliseconds(0), d.url += '?tp=' + f.getTime() + '&_share_' + b.type;

            for (var g in d) {
                e.push(g + '=' + d[g]);
            }
            c += '?' + e.join('&');
            var h = 600,
                i = 450,
                j = (window.screen.availHeight - 30 - i) / 2,
                k = (window.screen.availWidth - 10 - h) / 2,
                l = 'scrollbars=no,width=' + h + ',height=' + i + ',left=' + k + ',top=' + j + ',status=no,resizable=yes';
            window.open(c, '_blank', l);
        }

	};

	var timestamp = 0 ;
	var listDomStr = "" ;  // 列表dom字符串 
	var winStr = "" ; // 输赢字符串
	var voteStr = "" ; //计票字符串
	var pieceStr = ""; //数据条字符串
	var status = "" ; //开票状态
	var seat = "";
	var iconStr = "" ; //图标字符串
	var time = 0 ; //开票时间
	
	var title = []; //选情列表title
	var per = [] ; //占比数组
	var total = []; //总票数存储数组
	var flag = null ; //状态标示 民主党0 / 共和党1 / 其他党2 / 不显示为3
	var numL,numR = null; //总票数选择器元素
	
	var num, numD, numR, numO = 0; //票数总和,民主党占比,共和党占比,其他党占比
	var winStatus = ["icon-D","icon-R","icon-O",""];
	var voteStatus = ["未开始","进行中","已结束"];
	

	// 定义两个地图容器，背景题图，蒙版地图
	var paperBack, paperMask;

	// 定义窗口4个顶点的信息
	var winTop, winLeft, winBottom, winRight;

	// 状态信息，初始为空，请求到数据以后，如果是最新的，则更新此对象。
	var stateInfo = {};

	// 当前鼠标所在区块，激活弹出窗口时更新。
	var currentBlock = null;

	// 弹出窗口的定时器
	var popTimer = null;

	// 弹出动画的定时器
	var animPopProTime = null;

	// 地图数据对象集合
	var mapData = {};

	// 定义包围容器
	var wrapper = document.getElementById("map_main");
	var popInfo = document.getElementById("map_pop");

	// 选举类型
	var voteType = $('.p-mapTab li a').index($('.cur'));

	// 获取浏览器信息
	var na = navigator.userAgent.toLowerCase();
	var isAndroid = Util.find(na, "android");
	var isIphone = Util.find(na, "iphone");
	var isIpad = Util.find(na, "ipad");
	var isMobile = isIphone || isIpad || isAndroid;
	var isPoorBrowser = isMobile || ($.browser.msie && $.browser.version == "7.0");
	var animPopCount = isPoorBrowser ? 10 : 15;
	var animPopTime = isPoorBrowser ? 20 : 20;

	// 初始化地图
	var initMap = function() {

			updateWinPosition();
			initContainer();
			initPaper();

			var stateId;
			var oMap;
			var baseName = Params.baseName;

			var i = 0, len = baseName.length;
			for(; i < len; i++) {
				oMap = {};
				stateId = baseName[i];
				oMap.back = creatMapBack(stateId);
				oMap.info = creatMapInfo(stateId, i);
				oMap.mask = creatMapMask(stateId);
				mapData[stateId] = oMap;
			}

			resizeMap();
			initSideEvent();

		};


	// 更新窗口4个边的值，为了控制弹窗层不滑出窗口
	var updateWinPosition = function() {

		winTop = $(window).scrollTop();
		winLeft = $(window).scrollLeft();
		winBottom = $(window).height() + winTop;
		winRight = $(window).width() + winLeft;

	}

	// 初始化容器，ie8及以下使用的是vml容器，容器分4层：地图背景，州名称，地图蒙版，州名称侧栏。
	var initContainer = function() {

			if(Raphael.type == "VML") {
				$(wrapper).append('<rvml:group style="position : absolute; width: 990px; height: 990px; top: 0px; left: 0px;" coordsize="1090,1090" class="rvml" id="map_back"></rvml:group>');
				$(wrapper).append('<div id="map_info"></div>');
				$(wrapper).append('<div id="map_info_side"></div>');
				$(wrapper).append('<rvml:group style="position : absolute; width: 990px; height: 990px; top: 0px; left: 0px;" coordsize="1090,1090" class="rvml" id="map_mask"></rvml:group>');
			} else {
				$(wrapper).append('<div id="map_back" style="position : absolute; top: 0px; left: 0px;"></div>');
				$(wrapper).append('<div id="map_info"></div>');
				$(wrapper).append('<div id="map_info_side"></div>');
				$(wrapper).append('<div id="map_mask" style="position : absolute; top: 0px; left: 0px;"></div>');
			}

		};

	// 初始化放置容器
	var initPaper = function() {

			paperBack = Raphael("map_back", 930, 590);
			paperMask = Raphael("map_mask", 930, 590);

		};

	// 建立地图背景
	var creatMapBack = function(stateId) {

			var block = paperBack.path(mappaths[stateId]);
			block.stateId = stateId;
			
			// 初始化为尚未不参选。
			block.state = "not_join";
			block.attr({
				fill: stateColor["not_join"][0],
				stroke: "#FFFFFF",
				'stroke-width': 1,
				'stroke-linejoin': 'round'
			});
			return block;

		};

	/**
	 * 建立州名称
	 * @param  {String} stateId 州英文名
	 * @param  {Int} 	index   州name在baseName中索引
	 */
	var creatMapInfo = function(stateId, index) {

			var seatNum = '';
			var o = points[stateId];
			var top = (parseInt(o.top)) + 'px';
			var className = o.sClass || "not_join";
			//var text = voteType === 2 && (index === 35 ||index === 39) ? '*' : '';
			
			if(voteType === 0 && index < 50) {
				var stateIndex = $.inArray(index, Params.zyStateId);
				seatNum = Params.zySeats[stateIndex];
			}

			var seatStyle = voteType === 0 ? '>' : ' style="visibility:hidden;">0';
			
			if(typeof o.type !== "undefined" && o.type === "side") {
				$("#map_info_side").append('<div id="t_' + stateId + '" class="' + className + '" style="top: ' + top + '; left: ' + o.left + ';" data-stateId="' + stateId + '" data-class="' + className + '" ><p><em' + seatStyle + seatNum + '</em>' + o.text + '</p></div>');
			} else {
				$("#map_info").append('<div id="t_' + stateId + '" class="' + className + '" style="top: ' + top + '; left: ' + o.left + ';" data-stateId="' + stateId + '" data-class="' + className + '" ><em' + seatStyle + seatNum + '</em>' + o.text + '</div>');
			}
			return "t_" + stateId;

		};

	// 建立地图蒙版
	var creatMapMask = function(stateId) {

			var block = paperMask.path(mappaths[stateId]);
			block.stateId = stateId;
			block.attr({
				fill: "#FFFFFF",
				cursor: 'pointer',
				"opacity": 0
			});
			regMapEvent(block);
			return block;

		};

	// 注册地图上的事件
	var regMapEvent = function(block) {

			if(isMobile) {
				block.touchstart(mTouchStart);
			} else {
				block.mouseover(pOver);
				block.mouseout(pOut);
			}

		};

	// 移动设备上的touchstart函数
	var mTouchStart = function(e) {

			var lastStateId = currentBlock ? currentBlock.stateId : "";
			var stateId = this.stateId;
			var block = mapData[stateId].back;
			var fillColor = stateColor[block.state][1];
			var stateIndex = Util.getIndexByState(voteType, stateId);

			if(lastStateId !== "" && stateId !== lastStateId) {
				mapData[lastStateId].back.attr({
					fill: stateColor[mapData[lastStateId].back.state][0]
				});
				$("#t_" + lastStateId).find("p").removeClass("hoverIt");
			}

			var $textDiv = $("#t_" + stateId);
			if($textDiv.parent()[0].id === "map_info_side") {
				$textDiv.find("p").addClass("hoverIt");
			}
			block.attr({
				fill: fillColor
			});
			currentBlock = this;
			
			if(typeof stateIndex !== 'undefined' && stateIndex >= 0) {
				popInfo.style.visibility = "visible";
				getMouseXY_touch(e);
				changePop(stateId, stateInfo[stateIndex]);
			}
		};

	// pc上的鼠标的mouseover的回调函数
	var pOver = function(e) {

		var _this = this;
		var stateId = this.stateId;
		var stateIndex = Util.getIndexByState(voteType, stateId);
		var block = mapData[stateId].back;
		var fillColor = stateColor[block.state][1];

		
		// 200毫秒的延迟显示pop窗口
		popTimer = setTimeout(function() {

			var $textDiv = $("#t_" + stateId);
			if($textDiv.parent()[0].id === "map_info_side") {
				$textDiv.find("p").addClass("hoverIt");
			}

			block.attr({
				fill: fillColor
			});

			$(popInfo).data("refStateId", '');
			currentBlock = _this;
			popTimer = null;

			if(typeof stateIndex !== 'undefined' && stateIndex >= 0) {
				popInfo.style.visibility = "visible";
				changePop(stateId, stateInfo[stateIndex]);
			}

		}, 200);
		
	};

	// pc上的鼠标mouseout的回调函数
	var pOut = function(e) {

			clearTimeout(animPopProTime);
			var stateId = this.stateId;
			var block = mapData[stateId].back;
			var fillColor = stateColor[block.state][0];

			var $textDiv = $("#t_" + stateId);
			if($textDiv.parent()[0].id === "map_info_side") {
				$textDiv.find("p").removeClass("hoverIt");
			}

			if(popTimer) {
				clearTimeout(popTimer);
				popTimer = null;
				return;
			}
			block.attr({
				fill: fillColor
			});
			currentBlock = null;
			popInfo.style.visibility = "hidden";

		};

	// 缩放地图的大小
	var resizeMap = function() {

			paperBack.canvas.setAttribute("viewBox", "0 0 930 590");
			paperBack.setSize(813, 515);
			paperMask.canvas.setAttribute("viewBox", "0 0 930 590");
			paperMask.setSize(813, 515);

		};

	// 初始化侧栏的事件: 右侧单独列出州名称部分
	var initSideEvent = function() {

			if(isMobile) {

				$("#map_info_side").delegate("div", "touchstart", function(e) {


					var lastStateId = currentBlock ? currentBlock.stateId : "";
					var stateId = $(this).attr("data-stateId");
					var block = mapData[stateId].back;
					var fillColor = stateColor[block.state][1];
					var stateIndex = Util.getIndexByState(voteType, stateId);

					if(lastStateId !== "" && stateId !== lastStateId) {

						mapData[lastStateId].back.attr({
							fill: stateColor[mapData[lastStateId].back.state][0]
						});
						$("#t_" + lastStateId).find("p").removeClass("hoverIt");
					}

					$(this).find("p").addClass("hoverIt");

					block.attr({
						fill: fillColor
					});

					currentBlock = mapData[stateId].mask;

					if('undefined' !== typeof stateIndex && stateIndex >= 0) {
						getMouseXY_touch(e.originalEvent);
						popInfo.style.visibility = "visible";
						changePop(stateId, stateInfo[stateIndex]);
					}

				});

			} else { 

				$("#map_info_side").delegate("div", "mouseenter", function() {
					var _this = this;
					var stateId = $(this).attr("data-stateId");
					var stateIndex = Util.getIndexByState(voteType, stateId);
					var blockMask = mapData[stateId].mask;
					var block = mapData[stateId].back;
					var condition = block.state;
					var fillColor = stateColor[block.state][1];
					
						popTimer = setTimeout(function() {

							block.attr({
								fill: fillColor
							});

							$(popInfo).data("refStateId", '');
							currentBlock = blockMask;
							popTimer = null;

							if('undefined' !== typeof stateIndex && stateIndex >= 0) {
								popInfo.style.visibility = "visible";
								changePop(stateId, stateInfo[stateIndex]);
							}
							$(this).find("p").addClass("hoverIt");

						}, 200);

				});

				$("#map_info_side").delegate("div", "mouseleave", function() {

					clearTimeout(animPopProTime);
					var stateId = $(this).attr("data-stateId");
					var block = mapData[stateId].back;
					var fillColor = stateColor[block.state][0];
					
					clearTimeout(popTimer);
					block.attr({
						fill: fillColor
					});

					// $(popInfo).data("refStateId", '');
					currentBlock = null;
					popInfo.style.visibility = "hidden";
					$(this).find("p").removeClass("hoverIt");

				});
			}

		};

	// 更新顶部总投票数据
	var updateTop = function(id,data){
		numL = $(id).find(".numL").text(data[1]);
		numR = $(id).find(".numR").text(data[0]);
		icon_win = $(id).find(".icon-win");
		per = Util.perNum(data,1,0,2);
		
		// $(id).find(".colorL").animate({"width":per[0]+"%"},1000);
		// $(id).find(".colorL").css("width",per[0]+"%");
		// $(id).find(".colorR").animate({"width":per[1]+"%"},1000);
		// $(id).find(".colorC").animate({"width":per[2]+"%"},1000);
		if(data[3] == 3){
			win = data[0] - data[1];
			if(win == 0){
				icon_win.hide();
			}
			else if(win > 0){
				icon_win.css({"left":"200px"});
				icon_win.show();
			}
			else if(win < 0){
				icon_win.css({"left":"80px"});
				icon_win.show();
			}

		}
	}

	// 更新列表数据入口
	var updateStateData = function(data,type){

		var stateId = data.states[type];
		var state = stateId.state;
		var len = state.length;

		if(type == 0){
			title = ["众议院席位","民主党席位","其他席位","共和党席位"];

			$("table.p-voteTable").find("tHead").find("th.special").text(function(n){
				return title[n];
			})
			updateHouseStateData(state);
		}
		else if(type == 1){
			title = ["当选议员","民主党得票","其他得票","共和党得票"];

			$("table.p-voteTable").find("tHead").find("th.special").text(function(n){
				return title[n];
			})
			updateSenateStateData(state);
		}
		else if(type == 2){
			title = ["当选州长","民主党得票","其他得票","共和党得票"];

			$("table.p-voteTable").find("tHead").find("th.special").text(function(n){
				return title[n];
			})
			updateGovernorStateData(state);
		}
	}

	// 更新众议院列表数据
	var updateHouseStateData = function(data){
		$.each(data,function(n,obj){
			
			iconStr = "";  //每次清空
			status = voteStatus[obj[0]-1];  //状态对应文字

			if(obj[0] == 3){                 //判断最大党，平局为3,不显示 /  民主党0 / 共和党1 / 其他党2
				if(obj[1]>obj[2]){
					flag = obj[1] > obj[3] ? 0 : (obj[1] == obj[3] ? 3 : 2) ; 
				}
				else if(obj[1] < obj[2]){
					flag = obj[2] > obj[3] ? 1 : (obj[2] == obj[3] ? 3 : 2) ;
				}
				else{
					flag = obj[1] > obj[3] ? 3 : 2;
				}	
				iconStr = "<span class='icon-list "+ winStatus[flag] +"'></span>";
			}
			//console.log(obj[0])
			if(flag == 3){                   // 3为不显示
				iconStr = "";
			}
			if(obj[0] == 1){                 // 未开始状态
				obj = [1,0,0,0] ;
				per = [0,0,0] ;
			}else{
				per = Util.perNum(obj,1,2,3);    //各党票数占比
			}
			
			//图标字符串
			winStr = "<tr><td class='first'><div class='name'><span class='icon'>"+ iconStr +"</span><span class='txt'>" + Params.baseNameCN[Params.zyStateId[n]] + "</span></div></td><td>";

			//百分比字符串
			voteStr = "<div class='p-colLineBox'><div class='colLineBox-num'>" + "<span class='num-1'>" + (obj[4]||0) + "</span>" + "<span class='num-2'>" + (obj[6]||0) + "</span>" + "<span class='num-3'>" + (obj[5]||0) + "</span></div>" ;
			
			//数据条字符串
			pieceStr = "<div class='colLineBox-inner'><div class='colorC' style='width:" + per[2] + "%'></div>" + "<div class='colorL' style='width:" + per[0] + "%'></div>" + "<div class='colorR' style='width:" + per[1] + "%'></div>" + "</div></div>";

			//整体字符串
			listDomStr = winStr + Params.zySeats[n] + "</td><td>" + time + "</td><td>" + status + "</td><td class='colorBox' colspan='3'>" + voteStr + pieceStr + "</td></tr>";

			//更新列表
			$("table.p-voteTable").find("tBody").append(listDomStr);
		})
	}

	// 更新参议院列表数据
	var updateSenateStateData = function(data){
		$.each(data,function(n,obj){
			//console.log(obj[7])
			iconStr = "";  //每次清空
			status = voteStatus[obj[0]-1];  //状态对应文字

			if(obj[0] == 3){                 //判断最大党，平局为3,不显示 /  民主党0 / 共和党1 / 其他党2
				if(obj[1]>obj[2]){
					flag = obj[1] > obj[3] ? 0 : (obj[1] == obj[3] ? 3 : 2) ;
				}
				else if(obj[1] < obj[2]){
					flag = obj[2] > obj[3] ? 1 : (obj[2] == obj[3] ? 3 : 2) ;
				}
				else{
					flag = obj[1] > obj[3] ? 3 : 2;
				}	
				iconStr = "<span class='icon-list "+ winStatus[flag] +"'></span>";
			}
			//console.log(obj[0])
			if(flag == 3){                   // 3为不显示
				iconStr = "";
			}
			if(obj[0] == 1){                 // 未开始状态
				obj = [1,0,0,0] ;
				per = [0,0,0] ;
			}else{
				per = Util.perNum(obj,1,2,3)    //各党票数占比
			}
			seat = obj[7]||"";

			//图标字符串
			winStr = "<tr><td class='first'><div class='name'><span class='icon'>"+ iconStr +"</span><span class='txt'>" + Params.baseNameCN[Params.cyStateId[n]] + "</span></div></td><td>";

			//百分比字符串
			voteStr = "<div class='p-colLineBox'><div class='colLineBox-num'>" + "<span class='num-1'>" + (/\.\d/.test(obj[2].toFixed(1)) ? obj[2].toFixed(1) + "%" : obj[2].toFixed(0) + "%") + "</span>" + "<span class='num-2'>" + (/\.\d/.test(obj[3].toFixed(1)) ? obj[3].toFixed(1) + "%" : obj[3].toFixed(0) + "%") + "</span>" + "<span class='num-3'>" + (/\.\d/.test(obj[1].toFixed(1)) ? obj[1].toFixed(1) + "%" : obj[1].toFixed(0) + "%") + "</span></div>" ;
			
			//数据条字符串
			pieceStr = "<div class='colLineBox-inner'><div class='colorC' style='width:" + per[2] + "%'></div>" + "<div class='colorL' style='width:" + per[0] + "%'></div>" + "<div class='colorR' style='width:" + per[1] + "%'></div>" + "</div></div>";

			//整体字符串
			listDomStr = winStr + seat + "</td><td>" + time + "</td><td>" + status + "</td><td class='colorBox' colspan='3'>" + voteStr + pieceStr + "</td></tr>";

			//更新列表
			$("table.p-voteTable").find("tBody").append(listDomStr);
		})
	}

	// 更新州长列表数据
	var updateGovernorStateData = function(data){
		$.each(data,function(n,obj){
			//console.log(obj[7])
			iconStr = "";  //每次清空
			status = voteStatus[obj[0]-1];  //状态对应文字

			if(obj[0] == 3){ //判断最大党，平局为3,不显示 /  民主党0 / 共和党1 / 其他党2
				if(obj[1]>obj[2]){
					flag = obj[1] > obj[3] ? 0 : (obj[1] == obj[3] ? 3 : 2) ;
				}
				else if(obj[1] < obj[2]){
					flag = obj[2] > obj[3] ? 1 : (obj[2] == obj[3] ? 3 : 2) ;
				}
				else{
					flag = obj[1] > obj[3] ? 3 : 2;
				}	
				iconStr = "<span class='icon-list "+ winStatus[flag] +"'></span>";
			}
			//console.log(obj[0])
			if(flag == 3){                   // 3为不显示
				iconStr = "";
			}
			if(obj[0] == 1){                 // 未开始状态
				obj = [1,0,0,0] ;
				per = [0,0,0] ;
			}else{
				per = Util.perNum(obj,1,2,3)    //各党票数占比
			}
			seat = obj[7]||"";
			//图标字符串
			
			winStr = "<tr><td class='first'><div class='name'><span class='icon'>"+ iconStr +"</span><span class='txt'>" + Params.baseNameCN[Params.zzStateId[n]] + "</span></div></td><td>";

			//百分比字符串
			voteStr = "<div class='p-colLineBox'><div class='colLineBox-num'>" + "<span class='num-1'>" + (/\.\d/.test(obj[2].toFixed(1)) ? obj[2].toFixed(1) + "%" : obj[2].toFixed(0) + "%") + "</span>" + "<span class='num-2'>" + (/\.\d/.test(obj[3].toFixed(1)) ? obj[3].toFixed(1) + "%" : obj[3].toFixed(0) + "%") + "</span>" + "<span class='num-3'>" + (/\.\d/.test(obj[1].toFixed(1)) ? obj[1].toFixed(1) + "%" : obj[1].toFixed(0) + "%") + "</span></div>" ;
			
			//数据条字符串
			pieceStr = "<div class='colLineBox-inner'><div class='colorC' style='width:" + per[2] + "%'></div>" + "<div class='colorL' style='width:" + per[0] + "%'></div>" + "<div class='colorR' style='width:" + per[1] + "%'></div>" + "</div></div>";

			//整体字符串
			listDomStr = winStr + seat + "</td><td>" + time + "</td><td>" + status + "</td><td class='colorBox' colspan='3'>" + voteStr + pieceStr + "</td></tr>";

			//更新列表
			$("table.p-voteTable").find("tBody").append(listDomStr);
		})
	}

	// 投票数据的更新函数，通过异步请求来触发
	pollUpdate = function(datas) {
		//datas = obj;
		//if(timestamp != datas.timestamp){
			timestamp = datas.timestamp;
			updateing = (updateing - 1 < 0) ? 0 : updateing - 1;
			currentLevel = 1;

			if(stateInfo.timestamp >= datas.timestamp) {
				return;
			}
			
			for(var i = 0 ; i < 3 ; i++){
	    		total[i] = datas.states[i].total;
	    		total[i][3] = datas.states[i].condition;
	    	};
	    	updateTop("#boxL",total[0]);
	    	//console.log(1)
	    	updateTop("#boxM",total[1]);
	    	updateTop("#boxR",total[2]);
	    	$("table.p-voteTable tBody").empty();

			// type:0众议院|1参议院|2州长
			voteType = $('.p-mapTab li a').index($('.cur'));
			updateStateData(datas,voteType);
			triggerByType(voteType, datas);

			// 更新
			var time = new Date(parseInt(datas.timestamp));
			//alert(time.toString())
			$('.p-mapConLB p span').html(time.getMonth() + 1 + '月' + time.getDate() + '日 ' +  (time.getHours() > 9 ? time.getHours(): '0'+  time.getHours()) + ":" + (time.getMinutes() > 9 ? time.getMinutes(): '0' + time.getMinutes()));
			
			return;
		//}
		
	};

	// 根据投票类型改变地图状态
	// type:0众议院|1参议院|2州长
	var triggerByType = function(type, datas) {
		var data;
		var relation;
		var baseName = Params.baseName;
		var voteData = datas.states[type].state; // 选举投票数据
		if(type === 0) {
			relation = Params.zyStateId;
		} else if(type === 1) {	
			relation = Params.cyStateId;
		} else {
			relation = Params.zzStateId;
		}

		$("#map_back")[0].style.visibility = "hidden";
		$("#map_info")[0].style.visibility = "hidden";

		// 众议院：只有参与州的数据，不参与的显示默认值
		var i = 0, len = relation.length;
		for(; i < len; i++) {
			stateId = baseName[relation[i]];
			data = voteData[i];
			// 参议院多余两条数据
			if(!(voteType === 1 && (i === 25 || i === 29))) {
				changeMapState(stateId, data);
			}
		}

		$("#map_info")[0].style.visibility = "visible";
		$("#map_back")[0].style.visibility = "visible";

		stateInfo = voteData;  // 某种选举全部数据

		if(currentBlock) {
			var stateIds;
			var stateId = currentBlock.stateId;
			var index = Util.getIndexByState(voteType, stateId);
			if(index >= 0) {
				changePop(stateId, stateInfo[index]);
			}
		}
	};
	

	// 改变地图的状态，地图背景的颜色，州说明的颜色
	var changeMapState = function(stateId, data) {
			
			var block = mapData[stateId].back;

			// 当前鼠标所在区块，激活弹出窗口时更新。
			var currentState = block.state;
			
			var state = getState(stateId, data); // 获取开票状态
			if(currentState !== state) {
				block.state = state;
				block.attr({
					fill: stateColor[state][0]
				});
				var specialClass = $("#t_" + stateId).attr("data-class") || "";
				if(specialClass !== 'special_hawaii') {
					document.getElementById("t_" + stateId).className = state + " " + specialClass;
				}
				
			}

		};

	// 获取当前州的开票状态
	var getState = function(stateId, data) {
			var state;
			switch(data[0]) {

			// 进行中
			case 2:
				state = Util.getMaxIndex(data[1], data[2], data[3]);
				if(state === 0) { // 两派共同领先
					return "twins_lead";
				} else if(state === 1) { // 共和党领先
					return "r_lead";
				} else if(state === 2) { // 民主党领先
 					return "d_lead";
				} else { // 其他党领先
					return "o_lead";
				}
				break;

			case 3:
				state = Util.getMaxIndex(data[1], data[2], data[3]);
				if(state === 0) { // 两派共同获胜
					return "twins_win";
				} else if(state === 1) { // 共和党获胜
					return "r_win";
				} else if(state === 2) { // 民主党获胜
 					return "d_win";
				} else { // 其他党获胜
					return "o_win";
				}
				break;

			default:
				return "prepare";
				break;
			}

		};

	/**
	 * 改变弹出窗口的数据
	 * @param  {String} stateId  州名称
	 * @param  {Array}  data     该州的一条数组数据
	 */
	var changePop = function(stateId, data) {

			if(!currentBlock) {
				return false;
			}

			if(currentBlock.stateId !== stateId) {
				return false;
			}

			var $pop = $(popInfo);
			var refStateId = $pop.data("refStateId") || "";

			// 修改弹出框的基本信息
			// 根据当前要显示的州的id跟上一次显示的州的id做比较，来初始化pop窗口的内容。
			// 如果两个id不一样，即说明这次pop中的数据不是上个州的，需要进行初始化的动画（从0开始的动画）
			if(refStateId !== stateId) {
				var index = Util.getIndexByState(voteType, stateId);
				$pop.data("refStateId", stateId);
				$pop.find(".title").text(Params.baseNameCN[$.inArray(stateId, Params.baseName)]); 
				if(voteType === 0) {
					$pop.find(".poll_count").css("display", "block");
					$pop.find(".poll_count em").text(Params.zySeats[index]);
				} else {
					$pop.find(".poll_count").css("display", "none");
				}

				// 如果当前状态为未开始投票，则将百分比请空和投票数设为0
				// todo 实际情况中是否需要这么做。
				if(data[0] === 1) {
					$pop.find(".d_bar").height(0);
					$pop.find(".r_bar").height(0);
					$pop.find(".o_bar").height(0);
					$pop.find(".d_per").text("");
					$pop.find(".r_per").text("");
					$pop.find(".o_per").text("");
					if(voteType === 0) {
						$pop.find(".d_info em").css('visibility', 'hidden');
						$pop.find(".r_info em").css('visibility', 'hidden');
						$pop.find(".o_info em").css('visibility', 'hidden');
					} else {
						$pop.find(".d_info em").css('visibility', '');
						$pop.find(".r_info em").css('visibility', '');
						$pop.find(".o_info em").css('visibility', '');
						$pop.find(".d_info em").text('0票');
						$pop.find(".r_info em").text('0票');
						$pop.find(".o_info em").text('0票');
					}
					
					$('.d_sign').height(0);
					$('.r_sign').height(0);
					$('.o_sign').height(0);
					$("#d_win_bar").hide();
					$("#r_win_bar").hide();
					$("#o_win_bar").hide();
				} else {
					creatAnimPop([1, 0, 0, 0, 0, 0, 0], data);
				}

			} else {
				// 如果当前状态为未开始投票，则将百分比请空和投票数设为0
				// todo 实际情况中是否需要这么做。
				if(data[0] === 1) {
					$pop.find(".d_per").text("");
					$pop.find(".r_per").text("");
					$pop.find(".o_per").text("");
					if(voteType === 0) {
						$pop.find(".d_info em").css('visibility', 'hidden');
						$pop.find(".r_info em").css('visibility', 'hidden');
						$pop.find(".o_info em").css('visibility', 'hidden');
					} else {
						$pop.find(".d_info em").css('visibility', '');
						$pop.find(".r_info em").css('visibility', '');
						$pop.find(".o_info em").css('visibility', '');
						$pop.find(".d_info em").text('0票');
						$pop.find(".r_info em").text('0票');
						$pop.find(".o_info em").text('0票');
					}
					$('.d_sign').height(0);
					$('.r_sign').height(0);
					$('.o_sign').height(0);
					$("#d_win_bar").hide();
					$("#r_win_bar").hide();
					$("#o_win_bar").hide();
				} else {
					var stateIndex = Util.getIndexByState(voteType, stateId);
					creatAnimPop(stateInfo[stateIndex], data);
				}

			}

		};

	// 为创建pop窗口的投票动画，进行数据的准备。
	var creatAnimPop = function(lastData, currentData) {
			var $pop = $(popInfo);
			var elmOPre = $pop.find(".d_per")[0];
			var elmRPre = $pop.find(".r_per")[0];
			var elmOBar = $pop.find(".o_bar")[0];
			var elmRBar = $pop.find(".r_bar")[0];
			var elmOTicket = $pop.find(".o_info em")[0];
			var elmRTicket = $pop.find(".r_info em")[0];
			var dBeginTicket = lastData[5];
			var rBeginTicket = lastData[4];
			var oBeginTicket = lastData[6];
			var dEndTicket = currentData[5];
			var rEndTicket = currentData[4];
			var oEndTicket = currentData[6];

			// 由于有人工干预，投票百分比的计算有点麻烦
			var dBeginPre = lastData[2];
			var rBeginPre = lastData[1];
			var oBeginPre = lastData[3];
			var dEndPre = currentData[2];
			var rEndPre = currentData[1];
			var oEndPre = currentData[3];

			clearTimeout(animPopProTime);
			
			// dBeginTicket:开始票数
			// dEndTicket:  结束票数
			// dBeginPre: 	开始百分比
			// dEndPre: 	结束百分比
			animPopPro([dBeginTicket, dEndTicket, dBeginPre, dEndPre, lastData[0]], [rBeginTicket, rEndTicket, rBeginPre, rEndPre, currentData[0]], [oBeginTicket, oEndTicket, oBeginPre, oEndPre, currentData[0]], animPopCount);

		};

	// @angelia:创建pop窗口的投票动画
	var animPopPro = function(dDatas, rDatas, oDatas, count) {
		var a = [];
		var ratio = 1.8;
		var winBarH = 57;
		var perStr = voteType === 0 ? '' : '%';
		var fixedValue = voteType === 0 ? 0 : 1;
		var perBeginNum = voteType === 0 ? 1 : 3;
		var perEndNum = voteType === 0 ? 0 : 2;
		var voteStyle = voteType === 0 ? '<em style="visibility:hidden">' : '<em>';
		
		// 当上次数据和本次没有变化 或者 动画结束时(count=0)
		if((dDatas[2] === dDatas[3] && rDatas[2] === rDatas[3] && oDatas[2] === oDatas[3]) || count === 0) {
			var sFixTop = 'style="top: 200px;"';
			var rWinBar = '', dWinBar = '', oWinBar = '';
			var dEndPerH = dDatas[3]*ratio, rEndPerH = rDatas[3]*ratio, oEndPerH = oDatas[3]*ratio;

			// 开票结束
			if(rDatas[4] === 3) {
				var winIndex = Util.getMaxIndex(dDatas[3], rDatas[3], oDatas[3]);
				
				if(winIndex === 1) {
					if(dEndPerH > winBarH) {
						sFixTop = 'style="top: '+ (274 - (dEndPerH + winBarH)/2) +'px;"';
					}
					dWinBar = '<div id="d_win_bar" '+ sFixTop +'></div>';
				} else if(winIndex === 2) {
					if(rEndPerH > winBarH) {
						sFixTop = 'style="top: '+ (274 - (rEndPerH + winBarH)/2) +'px;"';
					}
					rWinBar = '<div id="r_win_bar" '+ sFixTop +'></div>';
				} else if(winIndex === 3) {
					if(oEndPerH > winBarH) {
						sFixTop = 'style="top: '+ (274 - (oEndPerH + winBarH)/2) +'px;"';
					}
					oWinBar = '<div id="o_win_bar" '+ sFixTop +'></div>';
				} 
			}

	        a.push('<div class="d_bar" style="height: '+ dEndPerH +'px"><div class="d_per">'+ dDatas[perBeginNum].toFixed(fixedValue) + perStr +'</div></div><div class="d_sign"></div><div class="d_info">民主党(D)<br/>' + voteStyle + Util.formatDot(dDatas[1]) +'票</em></div>' + dWinBar);
	        a.push('<div class="r_bar" style="height: '+ rEndPerH +'px"><div class="r_per">'+ rDatas[perBeginNum].toFixed(fixedValue) + perStr +'</div></div><div class="r_sign"></div><div class="r_info">共和党(R)<br/>' + voteStyle + Util.formatDot(rDatas[1]) +'票</em></div>' + rWinBar);
	        a.push('<div class="o_bar" style="height: '+ oEndPerH +'px"><div class="o_per">'+ oDatas[perBeginNum].toFixed(fixedValue) + perStr +'</div></div><div class="o_sign"></div><div class="o_info">其它(O)<br/>' + voteStyle + Util.formatDot(oDatas[1]) +'票</em></div>' + oWinBar);
	        
	        document.getElementById("js_bar_box").innerHTML = a.join("");

		} else {
			dDifPre = (((dDatas[3] - dDatas[2]) / count).toFixed(1)) / 1;
			dDatas[2] = dDatas[2] + dDifPre;
			dDifTicket = Math.floor((dDatas[1] - dDatas[0]) / count);
			dDatas[0] = dDatas[0] + dDifTicket;

			rDifPre = (((rDatas[3] - rDatas[2]) / count).toFixed(1)) / 1;
			rDatas[2] = rDatas[2] + rDifPre;
			rDifTicket = Math.floor((rDatas[1] - rDatas[0]) / count);
			rDatas[0] = rDatas[0] + rDifTicket;

			oDifPre = (((oDatas[3] - oDatas[2]) / count).toFixed(1)) / 1;
			oDatas[2] = oDatas[2] + oDifPre;
			oDifTicket = Math.floor((oDatas[1] - oDatas[0]) / count);
			oDatas[0] = oDatas[0] + oDifTicket;

	        a.push('<div class="d_bar" style="height: '+ dDatas[2]*ratio +'px"><div class="d_per">'+ dDatas[perEndNum].toFixed(fixedValue) + perStr +'</div></div><div class="d_sign"></div><div class="d_info">民主党(D)<br/>' + voteStyle + Util.formatDot(dDatas[0]) +'票</em></div>');
	        a.push('<div class="r_bar" style="height: '+ rDatas[2]*ratio +'px"><div class="r_per">'+ rDatas[perEndNum].toFixed(fixedValue) + perStr +'</div></div><div class="r_sign"></div><div class="r_info">共和党(R)<br/>' + voteStyle + Util.formatDot(rDatas[0]) +'票</em></div>');
	        a.push('<div class="o_bar" style="height: '+ oDatas[2]*ratio +'px"><div class="o_per">'+ oDatas[perEndNum].toFixed(fixedValue) + perStr +'</div></div><div class="o_sign"></div><div class="o_info">其它(O)<br/>' + voteStyle + Util.formatDot(oDatas[0]) +'票</em></div>');
	        
	        document.getElementById("js_bar_box").innerHTML = a.join("");

			animPopProTime = setTimeout(function() {
				animPopPro(dDatas, rDatas, oDatas, count - 1);
			}, animPopTime);

		}

	};

	// 卸载所有的事件，为了修复ie6下面刷新页面
	var removeall = function() {

			for(var stateId in mapData) {
				
				mapData[stateId].mask.unmouseover(pOver);
				mapData[stateId].mask.unmouseout(pOut);
				mapData[stateId].mask = null;
				mapData[stateId].back = null;
			}
			$(wrapper).unbind();
			$(".refresh_button").unbind();
			mapData = null;
			currentBlock = null;
			paperMask.clear();
			paperBack.clear();
			$("#map_info_side").undelegate();
			$("#map_main").html("");

		};

	// 获取当前鼠标位置
	// @angelia 设置蒙版的位置
	var getMouseXY = function(e) {

			e = e || window.event;

			if(e && e.pageX) {
				mouseX = e.pageX;
				mouseY = e.pageY;
			} else {
				mouseX = e.clientX + document.body.scrollLeft;
				mouseY = e.clientY + document.body.scrollTop;
			}
			// catch possible negative values
			if(mouseX < 0) {
				mouseX = 0;
			}
			if(mouseY < 0) {
				mouseY = 0;
			}

			var boxTop = mouseY - 171;
			var boxLeft = mouseX + 15;

			if(boxTop < winTop) {
				boxTop = winTop;
			} else if((boxTop + 341) > winBottom) {
				boxTop = winBottom - 341;
			}

			if((boxLeft + 341) > winRight) {
				boxLeft = boxLeft - 341 - 30;
			}

			popInfo.style.top = boxTop + "px";
			popInfo.style.left = boxLeft + "px";

		};

	// 触屏设备获取鼠标坐标点。
	var getMouseXY_touch = function(e) {

			var touch = e.touches[0];
			mouseX = touch.pageX;
			mouseY = touch.pageY;
			// catch possible negative values
			if(mouseX < 0) {
				mouseX = 0;
			}
			if(mouseY < 0) {
				mouseY = 0;
			}

			var boxTop = mouseY - 168;
			var boxLeft = mouseX + 15;

			if(boxTop < winTop) {
				boxTop = winTop;
			} else if((boxTop + 338) > winBottom) {
				boxTop = winBottom - 338;
			}

			if((boxLeft + 338) > winRight) {
				boxLeft = boxLeft - 338 - 30;
			}

			popInfo.style.top = boxTop + "px";
			popInfo.style.left = boxLeft + "px";

		};

	var share = function() {
		$('.mod-shareList .weibo').click(function() {
			Util.shared('sina');
		});
		$('.mod-shareList .qzone').click(function() {
			Util.shared('qqZone');
		});
		$('.mod-shareList .tt').click(function() {
			Util.shared('qq');
		});
	}

	var refresh = function() {
		if(isMobile) {
			$(".icon-refresh").on("touchstart", function() {
				window.location.reload();
			});

			$(".ipad_pop_close").show();
			$(".ipad_pop_close").on("touchstart", function() {
				$("#map_pop").css("visibility", "hidden");
			})

		} else {

			$(".icon-refresh").on("click", function() {
				window.location.reload();
			});

		}
	}

	// 初始化
	var init = function() {
		
		// @angelia-start 每次unload时移除所有事件：IE6下bug
		window.onunload = removeall;

		// 注册全局事件
		if(!isMobile) {
			$(wrapper).on("mousemove", getMouseXY);
		}

		// 监控window的scroll 和 resize事件，来改变限制pop窗口的4个边界。
		$(window).scroll(updateWinPosition);
		$(window).resize(updateWinPosition);

		// 画地图
		initMap();

		// 分享
		share();

		// 刷新
		refresh();

		$('.p-mapTab li').delegate('a', 'mouseenter', function(e) {
			$('.p-mapTab li a').removeClass('test');
			$(this).addClass('test');
		}); 

		$('.p-mapTab li').delegate('a', 'click', function(e) {
			$('.p-mapTab li a').removeClass('cur');
			$(this).addClass('cur');
			$('#map_pop').css('visibility', 'hidden');
			voteType = $('.p-mapTab li a').index($(this));




			var baseName = Params.baseName;

			var i = 0, len = baseName.length;
			for(; i < len; i++) {
				stateId = baseName[i];
				
				var block = mapData[stateId].back;
				
				// 初始化为尚未不参选。
				block.state = "not_join";
				block.attr({
					fill: stateColor["not_join"][0],
					stroke: "#FFFFFF",
					'stroke-width': 1,
					'stroke-linejoin': 'round'
				});

				$('#t_' + stateId).attr('class', '');
				// 佛蒙特州特殊处理
				if(stateId === 'vermont') {
					$("#t_" + stateId).attr('class', $("#t_" + stateId).attr('data-class') || '');
				}

				$('#t_' + stateId + ' em').css('visibility', voteType === 0 ? 'visible' : 'hidden');
				if(voteType === 1 && (i === 35 || i === 39)) {
					$('#t_' + stateId).html($('#t_' + stateId).html().replace('*', '').replace(/(\/em\>)/, '$1*'));
				} else {
					$('#t_' + stateId).html($('#t_' + stateId).html().replace('*', ''));
				}
				
			}
			creatRequest();
			return false;
		});
		
	};

	init();

	$(window).scroll(function () {
        if($(window).scrollTop() >= 300){
            $('.iconToTop').slideDown(200);
        }else{
            $('.iconToTop').slideUp(200);
        }
    }); 
     
    $('.iconToTop').click(function(){
        $('body,html').animate({scrollTop:0},500)
    });

    $(".weixin").click(function(){
        $(".sj").toggle();
        //event.stopPropagation();
        return false;
    })

    $(document).click(function(){
        $(".sj").hide();
    })
 
	
	// 异步请求的循环
	// 最大级别，如果请求一直不响应，每3秒增加一个级别，达到最大级别则强制刷新
	var maxLevel = usaMaxLevel || 20;
	var currentLevel = 1;
	var updateUrl = usaUpdateUrl || "http://news.ifeng.com/usa2012/data/state.js";
	// 是否能更新，如果窗口失去焦点，则不去请求。
	var canUpdate = true;
	// 正在请求的数量，如果不为0， 则不去增加新的请求。
	var updateing = 0;

	var timeInterval = usaTimeInterval || 3000;

	// 添加一个异步请求
	// @angelia 异步请求state.js数据
	var creatRequest = function() {

			$(".mx_usa_update_script").remove();
			var script = document.createElement("script");
			script.setAttribute("type", "text/javascript");
			script.setAttribute("class", "mx_usa_update_script");
			script.setAttribute("src", updateUrl + "?_=" + new Date().valueOf());
			window.document.getElementsByTagName('head')[0].appendChild(script);

			if(!($.browser.msie && $.browser.version === "6.0")) {
				script.onerror = function() {
					updateing = (updateing - 1) < 0 ? 0 : updateing - 1;
					script.onerror = null;
				};
			}

			updateing = updateing + 1;

		};

	creatRequest();

	// 3秒轮询，根据机制看是否能进行请求
	setInterval(function() {
		//console.log(document.hidden)
		var flag = null;
		if(document.hidden === undefined){
			flag = !document.hasFocus();
		}else{
			flag = document.hidden;
		}

		if(!flag){
			// 如果正在请求的数据为0
			if(updateing <= 0) {
				currentLevel = 1;
				creatRequest();

				// 或者当前级别大于等于允许的最大级别
			} else if(currentLevel >= maxLevel) {
				currentLevel = 1;
				creatRequest();
			} else {
				currentLevel = currentLevel + 1;
			}
		} else {
			currentLevel = currentLevel + 1;
		}

	}, 3000);
	

})(window, jQuery);