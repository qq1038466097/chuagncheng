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
							placeholder="输入点位名称搜索"
							@confirm="search" 
							:focus='true'
						/>
					</view>
				</view>
			</view>
			<view class='message-content'>
				<!--历史-->
				<view v-if="searchData.length!==0&&lists.length==0">
					<view class='historybox' @click="removeDatas">
						<text class='text'>历史搜索记录</text>
						<image class='icons' src='../../static/images/delete.png'></image>
					</view>
					<view v-for="(item,index) in searchData" :key='index'>
						<view class='mapSearch-list'>
							<view class='li-img'>
								<image class='img' src='../../static/images/address2.png'></image>
							</view>
							<view class='li-cont' @click="toMaps(item)">
								<view>
									<text class='name'>{{item.pointName}}</text>
								</view>
								<view>
									<text class='mess'>{{item.pointAddress}}</text>
								</view>
							</view>
							<view class='shape' @click="shapes(item)">
								<image class="img" src='../../static/images/shape.png'></image>
								<text class='text'>导航</text>
							</view>
						</view>
					</view>
				</view>
				<!--sousuo-->
				<view v-for="(item,index) in lists" :key='index' v-if="lists.length!==0">
					<view class='mapSearch-list'>
						<view class='li-img'>
							<image class='img' src='../../static/images/address2.png'></image>
						</view>
						<view class='li-cont' @click="toMaps(item)">
							<view>
								<text class='name'>{{item.pointName}}</text>
							</view>
							<view>
								<text class='mess'>{{item.pointAddress}}</text>
							</view>
						</view>
						<view class='shape' @click="shapes(item)">
							<image class="img" src='../../static/images/shape.png'></image>
							<text class='text'>导航</text>
						</view>
					</view>
				</view>
				<noDatas
					style='margin-top: 100rpx; display: block;'
					:title='title'
					v-if='searchData.length==0&&lists.length==0'
				 />
			</view>
		</view>
	</view>
</template>

<script>
    import {mapState} from 'vuex'
    import {addAvatarPrefix} from '@/common/lib/utils.js'
    import {getAlldot} from '@/api/map.js'
	import WSearchBar from '@/components/w-search-bar/w-search-bar.vue'
	import noDatas from '@/components/uni-noData/noData/noData.vue'
	export default {
		name: 'messageList',
		components:{
			WSearchBar,
			noDatas,
		},
		data() {
			return {
				title: '暂无历史记录',
                number: 0,
                noticeNum: 0,
				lists: [],
				employeeId: '',
				searchVal:'',
				status: 'more',
				number: 10,
				pageIndex: 1,
				keys: 0,
				searchData:[],
			}
		},
		onLoad(options) {
		    this.keys = options.keys
			this.searchVal = options.names
		},
		onShow(){
			//缓存
			let _that = this
			uni.getStorage({
				key: 'searchDatas',
				success: function(res){
					console.log(res)
					_that.searchData = res.data
				}
			})
		},
		methods: {
            search(){
				//搜索事件
				let _ars = {}
				let _keys=this.keys
				if(_keys==-1){
					_keys=''
				}
				_ars.roundPoint = _keys
				_ars.pointName = this.searchVal
				let _that = this
				getAlldot(_ars).then(res=>{
					if(res.data==null||res.data.length==0){
						_that.lists = [];
						_that.title = '未搜索到点位'
					}else{
						_that.lists = res.data;
					}
				}).catch(error=>{})
			},
			//跳转到个人聊天
			toMaps(datas){
				let _ars=this.searchData
				let _fla = false
				//去重
				for(let i=0; i<_ars.length; i++){
					if(_ars[i].pointId == datas.pointId){
						_fla = true
						break;
					}
				}
				if(!_fla){
					_ars.push(datas)
				}
				uni.setStorage({
					key: 'searchDatas',
					data: _ars,
					success: function(res){
						console.log(res)
					}
				})
				uni.$emit("globleSearch",datas)
				uni.navigateBack()
			},
			//导航
			shapes(datas){
				wx.openLocation({
					latitude: parseFloat(datas.dimension),
					longitude: parseFloat(datas.longitude),
					name: datas.pointName,
					address: datas.pointAddress
				})
			},
			//清楚缓存
			removeDatas(){
				let _that = this
				uni.removeStorage({
					key:'searchDatas',
					success:function() {
						console.log(' 移除成功')
						_that.searchData = []
					}
				})
			}
			
		}
	}
</script>

