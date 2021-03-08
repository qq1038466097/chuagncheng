<template>
	<view class='radarBg chatBg'>
		<scroll-view id="scrollview" class='scrollview' @scrolltoupper="upper" scroll-y="true" :scroll-top="scrollTop" :style="{height: contentViewHeight+'px'}">
		    <view class="scroll-view-item" id="msglistview">
				<view v-for="(item,index) in messageList" :key='index'>
					<view class='msgitem' v-if='item.memberId!==employeeId'>
						<view class="msg-time">
							<text>{{setChatTime(item.createTime)}}</text>
						</view>
						<view class='msg-orgs'>
							<text class='name'>{{item.memberName}}</text>
							<text class='phone' @click="callphone(item.memberPhone)">{{item.memberPhone}}</text>
							<text class='name'>( {{item.memberOrgs}} )</text>
						</view>
						<view class="msg-cont">
							<view class='msg-imgBox' @click="callphone(item.memberPhone)"> 
								<view class='imgBox'>
									<image class='img' current='1' :src='setHead(item.memberImg)'></image>
								</view>
							</view>
							<view class='msg-message'>
								<view :class="item.msgType==3&&tarInfo.storeId!==null?'contFlex':'cont'" v-if="item.msgType==1||item.msgType==3">
									<text>{{item.msgContent}}</text>
								</view>
								<view class='cont contImgs' v-if="item.msgType==2">
									<image mode="widthFix" class='img' :src='setUrl(item.msgContent)' lazy-load @click="handlePreviewImage(item.msgContent)"></image>
								</view>
								<view class="cont contMaps" v-if="item.msgType==4">
									<image mode="widthFix" class='img' :src='setUrl(item.msgContent)' lazy-load @click="tomapShow(item.msgContent)"></image>
								</view>
							</view>
						</view>
					</view>
					<view class='msgitem msgitem-me' v-if='item.memberId==employeeId'>
						<view class="msg-time">
							<text>{{setChatTime(item.createTime)}}</text>
						</view>
						<view class='msg-orgs'>
							<text class='name'>( {{item.memberOrgs}} )</text>
							<text class='phone' @click="callphone(item.memberPhone)">{{item.memberPhone}}</text>
							<text class='name'>{{item.memberName}}</text>
						</view>
						<view class="msg-cont">
							<view class='msg-message'>
								<view class='cont contImgs' v-if="item.msgType==2">
									<image mode="widthFix" class='img' :src='setUrl(item.msgContent)' lazy-load @click="handlePreviewImage(item.msgContent)"></image>
								</view>
								<view class="cont" v-if="item.msgType==1||item.msgType==3">
									<text>{{item.msgContent}}</text>
								</view>
								<view class="cont contMaps" v-if="item.msgType==4">
									<image mode="widthFix" class='img' :src='setUrl(item.msgContent)' lazy-load @click="tomapShow(item.msgContent)"></image>
								</view>
							</view>
							<view class='msg-imgBox' @click="toUserinfo">
								<view class='imgBox'>
									<image class='img' :src='setHead(item.memberImg)'></image>
								</view>
							</view>
						</view>
					</view>
				</view>
		    </view>
		</scroll-view>
		<view class='chat-btm'>
			<view class='top'>
                <view class='imgbox' @tap="upload">
                    <image class='img' src='/static/images/imgs.png'></image>
                </view>
				<text class='text'>快捷语</text>
				<text class='button' @click="setInput('在我这里')">在我这里</text>
				<text class='button' @click="setInput('领导打车了')">领导打车了</text>
			</view>
			<view class='flex'>
				<view class='imgBox'>
					<button type="primary" class='chat-upload' @click="chooseMap">
						<image class='img' src='/static/images/addre.png'></image>
					</button>
				</view>
				<view class='cont'>
					<textarea fixed="true" @confirm='sendChat(0,1)' rows='1' v-model="textVal" maxlength="1000" placeholder-class="phcolor" auto-height="true" class='textarea' placeholder="输入"></textarea>
                </view>
				<view class='emjoy' @click="sendChat(0,1)">
					<image class='img' src='/static/images/send.png'></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {mapState} from 'vuex'
    import {chatMan,creatChat,chatList,sendMs,imMsgList,imManList,imCreatRom,msRead} from '@/api/user.js'
	import {addAvatarPrefix} from '@/common/lib/utils.js'
	import { apiUrl } from '@/config/index.js'
	import { setTimes,getTimes } from '@/common/lib/message.js'
    import ws from '@/common/lib/ws.js'
    import dayjs from '@/common/lib/dayjs.min.js'
	export default {
		name: 'Chats',
		data() {
			return {
				contentViewHeight:'',
				timer: '',
				tarId: '',
				scrollTop: 0,
				employeeId: '', //当前用户id
				chatId: '', //当前聊天池id
				messageList: [],
				textVal: '',
				manList: [],  //聊天池人员
				newTime: '',
				rows: 10, //条数
				isPull: true, //是否可以下拉
				tarInfo: null,
				_messages: '',
				upNumber: 0, //下拉次数
                addWatcherIndex:'',
				oldHeight: 0,
				isOne: true, //一次下拉只执行一次
				isquick: true,  //快捷语发送，1秒之内不能重复
				names: '',
				tarId:'',//聊天对象的id
				icrmId: '',  //标记已读的id
				isLoadding: false,
			}
		},
		computed: {
			...mapState({
				employee:state=>state.user.employee,
			}),
		},
		/*监听*/
		watch:{
			employee:{
				handler:function(datas){
					if(datas){
						/*初始化*/
						//this.employeeId = datas.id
					}
				},
				immediate: true
			},
		},
		
		onLoad(options){
			this.names = options.names
			this.tarId = options.ids
			this.employeeId = options.employeeId
			let _title = options.names+'的聊天'
			wx.setNavigationBarTitle({
			  title: _title
			})
			
			//创建聊天室
			let _mans={} 
			_mans.fromId = options.employeeId
			_mans.tarId = options.ids
			let _that = this
			imCreatRom(_mans).then(res=>{
				if(res!==null){
					_that.chatId = res.chatId
					//调用信息
					let _ars={}
					_ars.chatId = res.chatId
					let _lastTime = res.lastMsgTime
					imMsgList(_ars).then(res1=>{
						if(res!==null){
							let _res = res1.reverse()
							_that.messageList = _res
							//最新一条数据，时间
							_that.newTime = res1[0].createTime
						}
					}).catch(err=>{})
					//获取聊天室人员
					let _ars2={}
					_ars2.chatId = res.chatId
					imManList(_ars2).then(res2=>{
						if(res!==null){
							_that.manList = res2
							//标记已读-到最后一条
							let _icrmId=''
							for(let i=0; i<res2.length; i++){
								if(res2[i].memberId==_that.employeeId){
									_icrmId= res2[i].icrmId
									_that.icrmId = res2[i].icrmId
								}
							}
							if(options.numbers>0){
								let _a={}
								_a.icrmId = _icrmId
								_a.lastReadTime = _lastTime
								_that.setRead(_a)
							}
							
						}
					}).catch(err=>{})
				}
			}).catch(err3=>{
				uni.showToast({
				   title: '创建聊天失败,'+err3.msg,
				   icon: 'none',
				   duration: 1000
				}); 
			})
		
		},
        onUnload(){
            if(this.addWatcherIndex>=0){
                this.$store.state.user.ws.delWatcher(this.addWatcherIndex)
            }
        },
		onReady(){
            //高度
            const res = uni.getSystemInfoSync();
        　　this.contentViewHeight = res.windowHeight - uni.getSystemInfoSync().screenWidth / 750 * (100) - 70; 
            // 开启ws
			if(this.$store.state.user.ws){
				this.addWatcherIndex = this.$store.state.user.ws.addWatcher(this.sendMessageCallback)      
			}else{
				this.$store.commit('SET_WS',new ws({employeeId:this.employee.id}))
				this.addWatcherIndex = this.$store.state.user.ws.addWatcher(this.sendMessageCallback)
				this.$store.state.user.ws.connectSocket()
			}
			//初次渲染完成
			setTimeout(()=>{
				this.scrollToBottom()
			},500)
		},
		methods: {
			//标记已读
			setRead(ar){
				msRead(ar).then(res4=>{}).catch(err2=>{})
			},
			//得到scroll-view高度
			getHeighs(){
				let that = this
				let query = uni.createSelectorQuery()
				query.select('#msglistview').boundingClientRect()
				query.exec((res) => {
					that.oldHeight = res[0].height
				})
			},
            tomapShow(maps){
                let _maps = maps
                let _i = _maps.indexOf('?center=')+8
                let _k = _maps.indexOf('&zoom=')
                let _datas = _maps.substring(_i,_k)
                let _datas1 =_datas.split(',')
                uni.navigateTo({
                    url: '/pages/task/mapshow?keys1='+_datas1[0]+'&keys2='+_datas1[1],
                });
            },
            callphone(phones){
                uni.makePhoneCall({
                	phoneNumber: phones,
                })
            },
			//群组
			togroup(){
				let _chatId = this.chatId
				uni.navigateTo({
				    url: '/pages/task/group-man?chatId='+_chatId,
				}); 
			},
            toUserinfo(){
                uni.navigateTo({
                    url: '/pages/task/user',
                });   
            },
            setInput(datas){
				if(this.isquick){
					this.isquick = false
					//发送消息
					this.textVal = datas
					this.sendChat(0,datas)
					setTimeout(()=>{
						this.isquick = true
						this.textVal = ''
					},1000)
				}
            },
            openMap(datas){
                let _datas = JSON.stringify(datas)
                uni.openLocation({
                  latitude: _datas.latitude,
                  longitude: _datas.longitude,
                  name: _datas.name,
                  address: _datas.address
                })
            },
			//上啦加载更多
			upper: function(e) {
				if(this.isPull){
					if(this.isOne){
						this.isOne = false
						//设置一次只执行一次下拉
						let _ars2 ={}
						_ars2.chatId = this.chatId 
						_ars2.rows= this.rows
						_ars2.direction='before'
						_ars2.currentTime = this.newTime
						//得到下拉之前的内容高度
						this.getHeighs()
						setTimeout(()=>{
							this.getmessage(_ars2,1)
						},50)
						setTimeout(()=>{
							this.isOne = true
						},500)
					}
				}
			},
			// 滚动至聊天底部
			scrollToBottom() {
				//this.scrollTop = 999999
				let that = this
				let query = uni.createSelectorQuery()
				query.select('#scrollview').boundingClientRect()
				query.select('#msglistview').boundingClientRect()
				query.exec((res) => {
					if(res[1].height > res[0].height){
						let _height = res[1].height - res[0].height + 30;
						that.scrollTop =_height
					}
				})
			},
			//头像
			setHead(url){
				if(url==null||url==''){
				    return '/static/images/head.png'
				}else{
				    return addAvatarPrefix(url)
				}
			},
			setUrl(url){
                return addAvatarPrefix(url)
			},
			setChatTime(time){
				if(time==''||time==null){
					return ''
				}else{
					return setTimes(time)
				}
			},
			//发送消息
			sendChat(k,datas){
				let _isLoadding = this.isLoadding
				if(!_isLoadding){
					let that = this
					that.isLoadding = true
					uni.showLoading({
					    title: '发送中..'  
					});
					let _ars = {}
					if(k==1){
						//提交图片
						_ars.chatId = that.chatId
						_ars.memberId= that.employeeId
						_ars.msgContent= datas
						_ars.msgType=2 
					}else if(k==2){
                        //地理位置
                        _ars.chatId = that.chatId
                        _ars.memberId= that.employeeId
                        _ars.msgContent= datas //JSON.stringify(datas)
                        _ars.msgType=4 
                    }else{
						//提交文字
						if(that.textVal==''){
							uni.hideLoading();
							that.isLoadding = false
							return false
						}
						_ars.chatId = this.chatId
						_ars.memberId= that.employeeId
						_ars.msgContent= that.textVal
						_ars.msgType=1
					}
					sendMs(JSON.stringify(_ars)).then(res=>{
						if(res==null){
							return false
						}
						//滚动条到最底部,并且清空文本域
						that.textVal=''
                        //判断是否添加
                        if(that.messageList.length==0||that.messageList[that.messageList.length-1].msgId!==res.msgId){
                           let _newArrs = that.messageList
						   let _a={}
						   _a.icrmId = that.icrmId
						   _a.lastReadTime = res.createTime
						   //标记已读
						   that.setRead(_a)
                           _newArrs.push(res)
                           that.messageList = _newArrs
                        }
                        setTimeout(()=>{
                        	that.scrollToBottom()
                        },50) 
						uni.hideLoading();
						that.isLoadding = false
					}).catch(error=>{
						uni.hideLoading();
						that.isLoadding = false
						uni.showToast({
							title: '发送失败，'+JSON.stringify(error),
							icon: 'none',
							duration: 1000
						})
					})
				}else{
					console.log('别点了，无效')
				}
			},
			//获取聊天信息
			getmessage(_ars2,k){
				let that = this;
				chatList(JSON.stringify(_ars2)).then(res2=>{
					//设置最新一条数据的时间
					if(res2.length==0||res2==null){
						return false
					}
					that.newTime = res2[res2.length-1].createTime
                    let _mess = that.messageList
                    for(let i=0; i<res2.length; i++){
                        that.messageList.unshift(res2[i])
                    }
					if(res2.length<(that.rows*(that.upNumber+1))){
						//取消下拉动画
                        console.log('取消动画')
						that.isPull= false;
					}
					setTimeout(()=>{
						//计算最新高度
						let query2 = uni.createSelectorQuery()
						query2.select('#msglistview').boundingClientRect()
						query2.exec((res2) => {
							//console.log(that.oldHeight)
							//console.log(res2[0].height)
							let _newheight = res2[0].height - that.oldHeight
							that.scrollTop = _newheight
						})
					},50)
				}).catch(error2=>{})
			},
			//上传图片
			upload(){
				let that = this;
				uni.chooseImage({
			        count: 1,
			        sizeType:['compressed'],
			        success(res) {
			            var imgFiles = res.tempFilePaths[0]
						let _url = apiUrl+'/upload/singleFile'
			            var uper = uni.uploadFile({
			                url: _url,
			                filePath: imgFiles,
			                name: 'file',
			                success(res1) {
								if(res1.statusCode==200){
									let _imgUrl = JSON.parse(res1.data).data
									that.sendChat(1,_imgUrl)
								}
							}
						});
			        }
			    })
			},
            //图片放大
			handlePreviewImage(ims){
				let _url = this.setUrl(ims)
				let _arrs=[]
				_arrs.push(_url)
				uni.previewImage({
					urls: _arrs,
					current: 0,
				});
			},
            chooseMap(){
                let _that = this
                uni.chooseLocation({
                    success: function (res) {
                        let _hr = 'https://apis.map.qq.com/ws/staticmap/v2/?center='+res.latitude+','+res.longitude+'&zoom=14&size=600*300&maptype=roadmap&markers=size:large|color:0xFFCCFF|label:k|'+res.latitude+','+res.longitude+'&key=VGNBZ-YUX66-E4KSV-M43JP-PTXQF-MYB2O'
                        let _ars = {}
                        _that.sendChat(2,_hr)
                    }
                });
            },
            //监听消息
            async sendMessageCallback({data,type}){
                if(type == 'immsg'){
                    let _arroy = data
					
					let _a={}
					_a.icrmId = this.icrmId
					_a.lastReadTime = dayjs(_arroy.createTime).format('YYYY-MM-DD HH:mm:ss')
					
                    let _time = dayjs(_arroy.createTime).format('YYYY-MM-DD HH:mm')
                    _arroy.createTime = _time
                    let _arrs = this.messageList
					
                    //判断是否添加
					setTimeout(()=>{
						if(this.messageList.length==0||this.messageList[this.messageList.length-1].msgId!==data.msgId){
						   _arrs.push(_arroy)
						   this.messageList = _arrs
						  
						   //标记已读
						   this.setRead(_a)
						}
					},200)
					uni.hideLoading();
					this.isLoadding = false
            	}
            },
		},
	}
</script>