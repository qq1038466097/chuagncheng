<template>
    <view class='messageBg'>
		<view class="uni-chatMsgCnt" id="msglistview">
			<view class='w-search'>
				<view class='w-search-box'>
					<image  class='w-search-icon' src="/static/images/icon-search.png" mode="" />
					<input
						type='text' 
						class='w-search-text'
						v-model="searchVal" 
						placeholder-class="phcolor" 
						placeholder="搜索成员"
						@confirm="search"
					/>
				</view>
			</view>
			<view class='message-content'>
				<view v-for="(item,index) in lists" :key='index' @click="toChat(item.name,item.memberId)">
                    <view class='message-list'>
                        <view class='li-img' v-if="item.isLine!=='no'">
                            <image class='img' :src='setHead(item.avatar)'></image>
                        </view>
                        <view class='li-img img-gray' v-if="item.isLine=='no'">
                            <image class='img' :src='setHead(item.avatar)'></image>
                        </view>
                        <view class='li-cont'>
                            <view>
                                <text class='name'>{{item.name}}</text>
                            </view>
                            <view>
                                <text class='mess'>{{item.phone}}</text>
                            </view>
                        </view>
                        <view class='li-right'>
                            <text v-if="item.isLine=='no'">不在线</text>
                            <text v-if="item.isLine!=='no'">距离{{item.distance}}</text>
                        </view>
                    </view>
				</view>
			</view>
		</view>
		<view class="message-no-data" v-if="employeeId && lists.length==0">
			<text>暂无群成员!</text>
		</view>
	</view>
</template>

<script>
    import {mapState} from 'vuex'
    import {addAvatarPrefix,getDistance} from '@/common/lib/utils.js'
	import {getLineUserApi} from '@/api/map.js'
    import {imManList} from '@/api/user.js'
	import WSearchBar from '@/components/w-search-bar/w-search-bar.vue'
	export default {
		name: 'messageList',
		data() {
			return {
				title: '通讯录',
                number: 0,
                noticeNum: 0,
				lists: [],
				employeeId: '',
				searchVal:'',
				chatId: '',
                lineMan:[],//在线人员
                longitude:'',
                latitude: '',
                oldList: [], //搜索数据，备份
            }
		},
        computed:{
            ...mapState({
            	employee:state=>state.user.employee,
            })
        },
        async onLoad(options){
			this.chatId = options.chatId
			//获取聊天室人员
			let _ars2={}
			_ars2.chatId = options.chatId
			let _that = this
			imManList(_ars2).then(res=>{
				if(res!==null){
					_that.lists = res
				}
			}).catch(err=>{})
			//获取经度 维度
			
			//获取在线人员
			await this.getLineUser()
        },
		methods: {
			//获取周边在线的人员
			async getLineUser(){
                //获取定位
                let _that = this
                uni.getLocation({
                    type: 'gcj02',
                    success: function (res) {
                       _that.longitude = res.longitude
                       _that.latitude = res.latitude
                       let _ars={}
                       _ars.range = 50000000
                       _ars.lng = res.longitude
                       _ars.lat = res.latitude
                       getLineUserApi(_ars).then(res2=>{
                            if(res2!==null&&res2.length>0){
                                let _lineMan = res2
                                _that.lineMan = _lineMan
                                let _lists = _that.lists
                                let _shows=[]
                                for(let i=0; i<_lists.length; i++){
                                    let _fla = 2
                                    let _ar = _lists[i]
                                    let _lat =''
                                    let _lng= ''
                                    for(let j=0; j<_lineMan.length; j++){
                                        if(_lineMan[j].employeeId==_lists[i].memberId){
                                            _fla=3
                                            _lat=_lineMan[j].lat
                                            _lng = _lineMan[j].lng
                                            break
                                        }
                                    }
                                    if(_fla==3){
                                        _ar.isLine = 'yes'
                                        let _distance = getDistance(_lat,_lng,_that.latitude,_that.longitude)
                                        if(_distance>1000){
                                            _distance=(_distance/1000).toFixed(2)+'km'
                                        }else{
                                           _distance=_distance+'m' 
                                        }
                                        _ar.distance = _distance
                                    }else{
                                        _ar.distance = 0
                                        _ar.isLine = 'no'
                                    }
                                    _shows.push(_ar)
                                }
                                _shows.sort((a,b)=>b['distance']-a['distance']);
                                _that.lists = _shows
                            }else{
                                let _shows=[]
                                let _lists = _that.lists
                                for(let i=0; i<_lists.length; i++){
                                    let _ar = _lists[i]
                                    _ar.isLine = 'no'
                                    _ar.distance = 0
                                    _shows.push(_ar)
                                }
                                _that.lists = _shows
                            }
                       }).catch(err=>{})
                    },
                    error: function(err){
                       uni.showToast({
                       	title: '在线人员获取失败!',
                       	icon: 'none',
                       	duration: 1000
                       })
                    }
                });
			},
            search(){
				//搜索
                if(this.searchVal==''){
                    if(this.oldList.length==0){
                         this.oldList = this.lists
                    }else{
                        this.lists = this.oldList
                    }
                }else{
                    let _name = this.searchVal
                    var arr = [];
                    let _list = this.lists
                    for(var i=0;i<_list.length;i++){
                        //如果字符串中不包含目标字符会返回-1
                        if(_list[i].name.indexOf(_name)>=0){
                            arr.push(_list[i]);
                        }
                    }
                    this.lists = arr
                }
			},
			setHead(url){
				if(url==null||url==''){
				    return '/static/images/head.png'
				}else{
				    return addAvatarPrefix(url)
				}
			},
			//获取页面数据
			init(id){
				let _ars = {}
				_ars.memberId = id
				chatMan(_ars).then(res=>{
					this.lists = res;
					this.isFirstData = false
				}).catch(error=>{})
			},
			callPhone(phones){
			    uni.makePhoneCall({
			    	phoneNumber: phones,
			    })
			    return false;
			},
			//跳转到个人聊天
			toChat(name,id){
				uni.navigateTo({
					url: '/pages/task/chat-one?names='+name+'&ids='+id+'&employeeId='+this.employee.id,
				});
			}
		}
	}
</script>

