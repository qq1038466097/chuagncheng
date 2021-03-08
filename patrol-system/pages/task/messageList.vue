<template>
    <view class='messageBg'>
		<view class='searchView'>
			<view class='w-search'>
				<view class='w-search-box'>
					<image  class='w-search-icon' src="/static/images/icon-search.png" mode="" />
					<input
						type='text' 
						class='w-search-text'
						v-model="searchVal" 
						confirm-type="search"
						placeholder-class="phcolor" 
						placeholder="搜索成员/消息"
						@confirm="search"
					/>
					<view class='w-search-right' @click="toBook">
						<text class='text'>|</text>
						<view class='icon'>
							<image src='/static/images/user.png' class='img'></image>
						</view>
						<text class='text'>通讯录</text>
					</view>
				</view>
			</view>
		</view>
		<view class='message-content'>
			<view class='message-list' @click="toChatGroup(groups.chatId,groups.lastMsgTime,groups.unreadCount)" v-if='JSON.stringify(groups)!=="{}"'>
				<view class='li-img'>
					<image class='img' src='/static/images/icon-mess.png'></image>
				</view>
				<view class='li-cont' style="border-bottom: 0;">
					<view>
						<text class='name'>{{groups.chatName}}</text>
					</view>
					<view>
						<text class='mess' v-if="groups.lastMsgType=='1'||groups.lastMsgType=='3'">{{groups.lastMsgContent}}</text>
						<text class='mess' v-if="groups.lastMsgType=='2'">[图片]</text>
						<text class='mess' v-if="groups.lastMsgType=='4'">[位置]</text>
					</view>
				</view>
				<view class='li-right' style="border-bottom: 0;">
					<text style="display: block;">{{setChatTime(groups.lastMsgTime)}}</text>
					<text class='circle' v-if='groups.unreadCount!==0&&groups.unreadCount<10'>{{groups.unreadCount}}</text>
					<text class='circle' v-if='groups.unreadCount!==0&&groups.unreadCount>10'>··</text>
				</view>
			</view>
			<view v-for="(item,index) in lists" :key='index'>
				<view v-for="(item2,k) in item.chatRomMemberInfos" :key='k'>
					<view v-if="employeeId&&employeeId!==item2.memberId" class='message-list' @click="toChat(item2.name,item2.memberId,item2.chatId,item.unreadCount)">
						<view class='li-img'>
							<image class='img' :src='setUrl(item2.avatar)'></image>
						</view>
						<view class='li-cont'>
							<view>
								<text class='name'>{{item2.name}}</text>
							</view>
							<view>
								<text class='mess' v-if='item.lastMsgType==1||item.lastMsgType==3'>{{item.lastMsgContent}}</text>
								<text class='mess' v-if='item.lastMsgType==2'>[图片]</text>
								<text class='mess' v-if='item.lastMsgType==4'>[位置]</text>
							</view>
						</view>
						<view class='li-right'>
							<text style="display: block;">{{setChatTime(item.lastMsgTime)}}</text>
							<text class='circle' v-if='item.unreadCount!==0&&item.unreadCount<10'>{{item.unreadCount}}</text>
							<text class='circle' v-if='item.unreadCount!==0&&item.unreadCount>10'>··</text>
						</view>
					</view>
				</view>
			</view>
			<view class="message-no-data" v-if="employeeId && lists.length==0">
				<text>暂无消息!</text>
			</view>
			<view v-if="lists!==null&&lists.length>=10">
			    <uni-load-more :status="status"  :content-text="contentText" color="#999"  />
			</view>
		</view>
	</view>
</template>

<script>
    import {mapState} from 'vuex'
    import {addAvatarPrefix} from '@/common/lib/utils.js'
    import {imList} from '@/api/user.js'
	import { setTimes } from '@/common/lib/message.js'
	import uniLoadMore from "@/components/uni-load-more/uni-load-more.vue"
	export default {
		name: 'messageList',
		components:{
				uniLoadMore
			},
		data() {
			return {
				title: '消息管理',
                number: 0,
                noticeNum: 0,
				lists: [],
				groups: {}, //群
				employeeId: '',
				searchVal:'',
				status: 'more',
				isPull: 2,
				number: 10,
				pageIndex: 1,
				contentText: {
				    contentdown: '查看更多',
				    contentrefresh: '加载中...',
				    contentnomore: '没有更多'
				},
			}
		},
        computed:{
            ...mapState({
            	employee:state=>state.user.employee,
                wxId:state=>state.user.wxId
            })
        },
        /*监听*/
        watch:{
            employee:{
                handler:function(datas){
					this.employeeId = datas.id
					//this.init(datas.id)
                },
                immediate: true
            },
        },
		onPullDownRefresh(){
			console.log('下拉')
		},
		onReachBottom(){
			console.log('上啦加载更多...')
		},
        onShow(){
			if(this.employee){
				this.init(this.employee.id)
			}
        },
		methods: {
			toBook(){
				uni.navigateTo({
					url: '/pages/task/telbook'
				});
			},
            search(){
				//搜索事件
				let _ars={}
				_ars.memberId = this.employeeId
				_ars.name = this.searchVal
				let _that = this
				imList(_ars).then(res=>{
					if(res==null||res.length==0){
						_that.lists = [];
					}else{
						_that.lists = res;
					}
					
				}).catch(error=>{})
			},
			setChatTime(time){
				if(time==''||time==null){
					return ''
				}else{
					return setTimes(time)
				}
			},
			setUrl(url){
				if(url==null||url==''){
				    return '/static/images/head.png'
				}else{
				    return addAvatarPrefix(url)
				}
			},
			//获取聊天室列表
			init(id){
				if(id){
					let _ars = {}
					_ars.memberId = id
					let _that = this
					imList(_ars).then(res=>{
						if(res!==null&&res.length>0){
							let _shows=[]
							for(let i=0; i<res.length; i++){
								if(res[i].chatName=='迎检群'){
									res[i].chatName = '通知群'
									_that.groups = res[i];
								}else{
									_shows.push(res[i])
								}
							}
							_that.lists = _shows;
						}
					}).catch(error=>{})
				}
			},
			//跳转到群组
			toChatGroup(chatId,time,num){
				uni.navigateTo({
					url: '/pages/task/chat?chatId='+chatId+'&times='+time+'&numbers='+num
				});
			},
			//跳转到个人聊天
			toChat(name,id,chatId,num){
				uni.navigateTo({
					url: '/pages/task/chat-one?names='+name+'&ids='+id+'&employeeId='+this.employeeId+'&numbers='+num,
				});
			}
		}
	}
</script>

