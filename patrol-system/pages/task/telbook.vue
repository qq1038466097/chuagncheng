<template>
    <view class='messageBg'>
		<view class="uni-chatMsgCnt" id="msglistview">
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
							placeholder="搜索联系人"
							@confirm="search" 
						/>
					</view>
				</view>
			</view>
			<view class='message-content'>
				<view v-for="(item,index) in lists" :key='index'>
					<view class='message-list' @click="toChat(item.name,item.id)">
						<view class='li-img'>
							<image class='img' :src='setUrl(item.avatar)'></image>
						</view>
						<view class='li-cont'>
							<view>
								<text class='name'>{{item.name}}</text>
								<text class='name small'>{{item.employeeOrgs}}</text>
							</view>
							<view>
								<text class='mess' style='color: #0091FF;' @click.stop="callPhone(item.phone)">{{item.phone}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="message-no-data" v-if="lists.length===0">
					<text>暂无联系人！</text>
				</view>
				<view v-if="lists!==null&&lists.length>=10">
				    <uni-load-more :status="status"  :content-text="contentText" color="#999"  />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
    import {mapState} from 'vuex'
    import {addAvatarPrefix} from '@/common/lib/utils.js'
    import {getTel} from '@/api/user.js'
	import uniLoadMore from "@/components/uni-load-more/uni-load-more.vue"
	import WSearchBar from '@/components/w-search-bar/w-search-bar.vue'
	export default {
		name: 'messageList',
		components:{
				WSearchBar,
				uniLoadMore
			},
		data() {
			return {
				title: '通讯录',
                number: 0,
                noticeNum: 0,
				lists: [],
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
            })
        },
        onReady(){
            let _ars={}
			_ars.pageIndex = this.pageIndex
			_ars.pageSize= this.number
			let _that = this
			getTel(_ars).then(datas=>{
				if(datas&&datas.data!==null){
					_that.lists = datas.data
				}
			}).catch(error=>{})
        },
		//上拉加载
		onReachBottom() {
			if(this.isPull==3){
			    return false
			}
			let _that = this
			_that.status = 'loading'
			let _ars={}
			_ars.pageIndex = _that.pageIndex +1
			_ars.pageSize = _that.number
			_that.pageIndex = _that.pageIndex+1
			getTel(_ars).then(res=>{
			    if(res.data!==null){
			        let _datas2 = _that.lists.concat(res.data)
			        _that.lists = _datas2
			        //没有更多
			        if(res.data.length<_that.number){
			            _that.status = 'nomore'
			            _that.isPull = 3
			        }else{
			            _that.status = 'more'
			        }
			    }else{
			        _that.status = 'nomore'
			        _that.isPull = 3
			    }
			}).catch(error=>{}) 
		},
		methods: {
            search(){
				//搜索事件
				let _ars = {}
				_ars.name = this.searchVal
				let _that = this
				getTel(_ars).then(res=>{
					if(res.data==null||res.data.length==0){
						_that.lists = [];
					}else{
						_that.lists = res.data;
					}
				}).catch(error=>{})
			},
			//跳转到个人聊天
			toChat(name,id){
				uni.navigateTo({
					url: '/pages/task/chat-one?names='+name+'&ids='+id+'&employeeId='+this.employee.id,
				});
			},
			setUrl(url){
			    if(url==null||url==''){
			        return '/static/images/head-blue.png'
			    }else{
			        return addAvatarPrefix(url)
			    }
			},
			callPhone(phones){
			    uni.makePhoneCall({
			    	phoneNumber: phones,
			    })
			    return false;
			},
		}
	}
</script>

