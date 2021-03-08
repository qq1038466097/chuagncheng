<template>
	<view class='radarBg chatBg'>
		<scroll-view id="scrollview" class='scrollview' @scrolltoupper="upper" scroll-y="true" :scroll-top="scrollTop" :style="{height: contentViewHeight+'px'}">
		    <view class="scroll-view-item" id="msglistview">
				<view v-for="(item,index) in eventList" :key='index'>
					<view class='msgitem' v-if='item.employeeId!==employeeId&&item.employeeId!==null'>
						<view class="msg-time">
							<text>{{setChatTime(item.eventTime)}}</text>
						</view>
						<view class="msg-cont">
							<view class='msg-imgBox'> 
								<view class='imgBox' @click="callphone(item.subsidiary.phone)">
									<image class='img' current='1' :src='setUrl(item.subsidiary.avatar)'></image>
								</view>
								<text class='msg-name'>{{item.subsidiary.name}}</text>
								<view class='signalBox' @click="closeSignal(item.id,item.employeeId)">
									<view class='imgBox'>
										<image src='/static/images/signal-close.png' class='img'></image>
									</view>
									<text class='text'>关闭信号</text>
								</view>
							</view>
							<view class='msg-message'>
								<view class="cont" style='height: 250upx;'>
									<text class='myaddr'>{{item.subsidiary.address}}</text>
									<view class='imgBox'>
										<image mode="widthFix" class='img' :src='setUrl(item.subsidiary.msgContent)' lazy-load @click="tomapShow(item.subsidiary.msgContent)"></image>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view class='msgitem msgitem-me' v-if='item.employeeId==employeeId'>
						<view class="msg-time">
							<text>{{setChatTime(item.eventTime)}}</text>
						</view>
						<view class="msg-cont">
							<view class='msg-message'>
								<view class="cont" style='height: 250upx;'>
									<text class='myaddr'>{{item.subsidiary.address}}</text>
									<view class='imgBox'>
										<image mode="widthFix" class='img' :src='setUrl(item.subsidiary.msgContent)' lazy-load @click="tomapShow(item.subsidiary.msgContent)"></image>
									</view>
								</view>
							</view>
							<view class='msg-imgBox'>
								<view class='imgBox' @click="toUserinfo">
									<image class='img' :src='setUrl(item.subsidiary.avatar)'></image>
								</view>
								<text class='msg-name'>{{item.subsidiary.name}}</text>
								<view class='signalBox' @click="closeSignal(item.id,item.employeeId)">
									<view class='imgBox'>
										<image src='/static/images/signal-close.png' class='img'></image>
									</view>
									<text class='text'>关闭信号</text>
								</view>
							</view>
						</view>
					</view>
				</view>
		    </view>
			<view v-if="eventList.length==0">
			    <text class='noDatas'>暂无信号!</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {mapState} from 'vuex'
	import {listEvent,cancelEvent} from '@/api/map.js'
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
				messageList: [{"msgId":"2c98808f70c216ea0170d2cebdde0172","chatId":"9527","createTime":"2020-03-13 15:32:09","memberId":"2c98808d704d42ac017052707872033c","msgContent":"https://apis.map.qq.com/ws/staticmap/v2/?center=31.15046075288959,121.42990712228678&zoom=14&size=600*300&maptype=roadmap&markers=size:large|color:0xFFCCFF|label:k|31.15046075288959,121.42990712228678&key=VGNBZ-YUX66-E4KSV-M43JP-PTXQF-MYB2O","msgType":"4"},{"msgId":"2c98808f70c216ea0170d2cdcb070171","chatId":"9527","createTime":"2020-03-13 15:31:07","memberId":"2c98808d704ca69001704d3104d2002b","msgContent":"https://apis.map.qq.com/ws/staticmap/v2/?center=29.563748,106.550545&zoom=14&size=600*300&maptype=roadmap&markers=size:large|color:0xFFCCFF|label:k|29.563748,106.550545&key=VGNBZ-YUX66-E4KSV-M43JP-PTXQF-MYB2O","msgType":"4"}],
				textVal: '',
				previewImgArray: [],
				manMess: [],  //聊天池所有信息
				manList: [],  //聊天池人员
				newTime: '',
				lastTime: '',
				rows: 10, //条数
				isPull: true, //是否可以下拉
				tarInfo: null,
				isSend: true, //0.8秒内，不能重复提交
				_messages: '',
				upNumber: 0, //下拉次数
                addWatcherIndex:'',
				oldHeight: 0,
				isOne: true, //一次下拉只执行一次
				isquick: true,  //快捷语发送，1秒之内不能重复
				eventList: [],
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
						this.employeeId = datas.id
					}
				},
				immediate: true
			},
		},
        onUnload(){
            if(this.addWatcherIndex>=0){
                this.$store.state.user.ws.delWatcher(this.addWatcherIndex)
            }
        },
		async onReady(){
            //高度
            const res = uni.getSystemInfoSync();
        　　this.contentViewHeight = res.windowHeight - uni.getSystemInfoSync().screenWidth / 750 * (100); 
            // 开启ws
			if(this.$store.state.user.ws){
				this.addWatcherIndex = this.$store.state.user.ws.addWatcher(this.sendMessageCallback)      
			}else{
				this.$store.commit('SET_WS',new ws({employeeId:this.employee.id}))
				this.addWatcherIndex = this.$store.state.user.ws.addWatcher(this.sendMessageCallback)
				this.$store.state.user.ws.connectSocket()
			}
			//获取事件
			const _eventList = await this.getListEvent()
			for(let i=0; i<_eventList.length; i++){
				_eventList[i].subsidiary = JSON.parse(_eventList[i].subsidiary)
				//console.log(_eventList[i].subsidiary.address)
			}
			this.eventList = _eventList
			//初次渲染完成
			setTimeout(()=>{
				this.scrollToBottom()
			},1000)
		},
		methods: {
			//获取事件
			async getListEvent(){
				let _that = this
				const res = await listEvent()
				let _shows=[]
				if(res==null||res.length==0){
					this.eventList=[]
				}
				res.map(item=>{
					if(item.eventName=='发信号' && item.status==1 && item.employeeId){
						_shows.push(item)
					}
				})
				_shows = _shows.reverse()
				return _shows
			},
			closeSignal(ids,eids){
				let _that = this
				uni.showModal({
				    title: '提示',
				    content: '确定要关闭他的信号?',
				    success: function (res) {
				        if (res.confirm) {
							const _res = cancelEvent({id:ids,"cancelEmployeeId":eids})
				        } else if (res.cancel) {
				            //console.log('用户点击取消');
				        }
				    },
				})
			},
			openSignal(){
				uni.showModal({
				    title: '提示',
				    content: '确定要开启他的信号?',
				    success: function (res) {
				        if (res.confirm) {
				            console.log('用户点击确定');
				        } else if (res.cancel) {
				            console.log('用户点击取消');
				        }
				    },
				})
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
            toUserinfo(){
                uni.navigateTo({
                    url: '/pages/task/user',
                });   
            },
			//上啦加载更多
			upper: function(e) {
				return false
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
							
						},50)
						setTimeout(()=>{
							this.isOne = true
						},500)
					}
				}
			},
			// 滚动至聊天底部
			scrollToBottom() {
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
			setUrl(url){
                if(url==null){
                    return '/static/images/head.png'
                }else{
                    return addAvatarPrefix(url)
                }
			},
			setChatTime(time){
				return setTimes(time)
			},
            //监听消息
            async sendMessageCallback({data,type}){
                if(type == 'watchevent'){
					if(data.eventName=="发信号"){
						let _eventList = await this.getListEvent()
						for(let i=0; i<_eventList.length; i++){
							_eventList[i].subsidiary = JSON.parse(_eventList[i].subsidiary)
						}
						this.eventList = _eventList
					}
            	}
            },
		},
	}
</script>