<template>
	<view class="content dotBg">
		<view class='dot-top-select'>
			<view class='text'>
				<text>{{null||array[0].startTime}} ~ {{null||array[0].endTime}}</text>
			</view>
		</view>
		<!-- 搜索 -->
		<view class='searchbox'>
			<view class='map-search map-search-gray'>
				 <view class='map-searchImg'>
					<image class='img' src='../../static/images/search.png'></image>
				 </view>
				 <view class='map-searchCont'>
					<input 
						placeholder='搜索点位' 
						class='input' 
						v-model="searchDot" 
						@confirm="confirm"
					/>
				 </view>
				 <view class='map-searchImg right' v-if="searchDot!==''" @click="clearSearch">
					<image class='img' src='../../static/images/close.png'></image>
				 </view>
			</view>
		</view>
		<view class='dot-top'>
            <view class='dot-top-right'>
                <view class='dot-top-right-t'>
                    <view class='cont'>
						<text class='number'>{{series.totalCount}}</text>
                        <view class='flex'>
							<view class='icon'></view>
							<text class='desc'>我的随机点位</text>
                        </view>
                    </view>
                </view>
                <view class='dot-top-right-t'>
                    <view class='cont'>
						<text class='number'>{{series.stayCheck}}</text>
                        <view class='flex'>
                            <view class='icon icon-blue'></view>
							<text class='desc'>待巡查</text>
                        </view>
                    </view>
                </view>
                <view class='dot-top-right-t'>
                    <view class='cont'>
						<text class='number'>{{series.passCount}}</text>
                        <view class='flex'>
                            <view class='icon icon-green'></view>
							<text class='desc'>合格</text>
                       </view>
                    </view>
                </view>
                <view class='dot-top-right-t'>
                    <view class='cont'>
						<text class='number'>{{series.stayReview}}</text>
                        <view class='flex'>
                            <view class='icon icon-yellow'></view>
							<text class='desc'>不合格·已处理</text>
                       </view>
                    </view>
                </view>
				<view class='dot-top-right-t'>
				    <view class='cont'>
						<text class='number'>{{series.fixing}}</text>
				        <view class='flex'>
				            <view class='icon icon-orange'></view>
							<text class='desc'>不合格·处理中</text>
				       </view>
				       
				    </view>
				</view>
				<view class='dot-top-right-t'>
				    <view class='cont'>
						<text class='number'>{{series.stayFix}}</text>
				        <view class='flex'>
				            <view class='icon icon-red'></view>
							<text class='desc'>不合格·待处理</text>
				       </view>
				       
				    </view>
				</view>
            </view>
        </view>
        <view class='dot-table'>
            <view class='dot-table-cell' @click="setClick(item.index)" v-for='(item,i) in tables' :key='i' :class="item.index===selected?'selected':''">
                <text class='dot-text'>{{item.title}}</text>
            </view>
        </view>
        
        <view class='dot-contBox'>
            <view v-if="datas==null">
                <text class='noDatas'>暂无数据</text>
            </view>
            <view class='dot-cont' v-for="(item,k) in datas" :key='item.pointId'>
                <view class='cont-top'>
                    <view class='report-left'>
                        <view class='imgBox' v-if='item.watchStatus==2&&item.watchResult==3&&item.fixStatus==2'>
                            <image :src='setImgs(item)' class='img'></image>
                        </view>
                        <view class='imgBox orangeBg' v-if='item.fixStatus==3'>
                            <image :src='setImgs(item)' class='img'></image>
                        </view>
                        <view class='imgBox blueBg' v-if='item.watchStatus==1'>
                            <image :src='setImgs(item)' class='img'></image>
                        </view>
                        <view class='imgBox greenBg' v-if='item.watchStatus==2&&(item.watchResult==1||item.watchResult==2)&&parseInt(item.fixStatus)!==3'>
                            <image :src='setImgs(item)' class='img'></image>
                        </view>
						<view class='imgBox yellowBg' v-if='item.fixStatus==4'>
						    <image :src='setImgs(item)' class='img'></image>
						</view>
                    </view>
                    <view class='report-right'>
                        <text class='title'>{{item.pointName}}(随机点位)</text>
                        <view class='flex' v-if='item.contactName!==null&&item.contactTel!==null'>
                            <view class='headBox'>
                                <image class='img' src='/static/images/icon-user.png'></image>
                            </view>
                            <text class='name'>{{item.contactName||''}}</text>
                            <text class='phone' @click="callPhone(item.contactTel)">{{item.contactTel||''}}</text>
                        </view>
                        <view class='flex' v-if='item.pointAddress!==null'>
                            <view class='headBox'>
                                <image class='img' src='/static/images/icon-address.png'></image>
                            </view>
                            <text class='gray'>{{item.pointAddress||''}}</text>
                            <text class='gray2'>{{setgetDistance(item.mapJson)}}</text>
                        </view>
                    </view>
                </view>
				<view class='cont-btm' v-if='item.fixStatus==4'>
					<view class='reportshow'>
						<text class='title-l yellowBg'>不合格·已处理</text>
						<text class='time'>{{item.lastCheckTime||''}}</text>
					</view>
					<view class='reportBox'  @tap="toShapes(item)">
						<image src='/static/images/shape2.png' class='img'></image>
						<text class='title-r'>导航</text>
					</view>
					<view class='reportBox' @tap="toReport(item.pointId,item.mapJson)">
						<image src='/static/images/icon-report.png' class='img'></image>
						<text class='title-r' >巡查</text>
					</view>
					<view class='reportBox' @tap="toReportDetail(item.pointId,item.mapJson)">
						<image src='/static/images/icon-detail.png' class='img'></image>
						<text class='title-r' >详情</text>
					</view>
				</view>
                <view class='cont-btm' v-if='item.watchStatus==2&&item.watchResult==3&&item.fixStatus==2'>
					<view class='reportshow'>
						<text class='title-l redBg'>不合格·待处理</text>
						<text class='time'>{{item.lastCheckTime||''}}</text>
					</view>
					<view class='reportBox'  @tap="toShapes(item)">
						<image src='/static/images/shape2.png' class='img'></image>
						<text class='title-r'>导航</text>
					</view>
					<view class='reportBox' @tap="toReport(item.pointId,item.mapJson)">
						<image src='/static/images/icon-report.png' class='img'></image>
						<text class='title-r' >巡查</text>
					</view>
					<view class='reportBox' @tap="toReportDetail(item.pointId,item.mapJson)">
						<image src='/static/images/icon-detail.png' class='img'></image>
						<text class='title-r' >详情</text>
					</view>
                </view>
                <view class='cont-btm' v-if='item.fixStatus==3'>
					<view class='reportshow'>
						<text class='title-l orangeBg'>不合格·处理中</text>
						<text class='time'>{{item.lastCheckTime||''}}</text>
					</view>
					<view class='reportBox'  @tap="toShapes(item)">
						<image src='/static/images/shape2.png' class='img'></image>
						<text class='title-r'>导航</text>
					</view>
					<view class='reportBox' @tap="toReport(item.pointId,item.mapJson)">
						<image src='/static/images/icon-report.png' class='img'></image>
						<text class='title-r' >巡查</text>
					</view>
					<view class='reportBox' @tap="toReportDetail(item.pointId,item.mapJson)">
						<image src='/static/images/icon-detail.png' class='img'></image>
						<text class='title-r' >详情</text>
					</view>
                </view>
                <view class='cont-btm' v-if='item.watchStatus==1'>
					<view class='reportshow'>
						<text class='title-l blueBg'>待巡查</text>
						<text class='time'>{{item.lastCheckTime||''}}</text>
					</view>
					<view class='reportBox'  @tap="toShapes(item)">
						<image src='/static/images/shape2.png' class='img'></image>
						<text class='title-r'>导航</text>
					</view>
					<view class='reportBox'  @tap="toReport(item.pointId,item.mapJson)">
						<image src='/static/images/icon-report.png' class='img'></image>
						<text class='title-r'>巡查</text>
					</view>
					<view class='reportBox' @tap="toReportDetail(item.pointId,item.mapJson)">
						<image src='/static/images/icon-detail.png' class='img'></image>
						<text class='title-r' >详情</text>
					</view>
                </view>
                <view class='cont-btm' v-if='item.watchStatus==2&&(item.watchResult==1||item.watchResult==2)&&parseInt(item.fixStatus)!==3'>
					<view class='reportshow'>
						<text class='title-l greenBg'>合格</text>
						<text class='time'>{{item.lastCheckTime||''}}</text>
					</view>
					<view class='reportBox'  @tap="toShapes(item)">
						<image src='/static/images/shape2.png' class='img'></image>
						<text class='title-r'>导航</text>
					</view>
                    <view class='reportBox' @tap="toReport(item.pointId,item.mapJson)">
						<image src='/static/images/icon-report.png' class='img'></image>
						<text class='title-r' >巡查</text>
					</view>
					<view class='reportBox' @tap="toReportDetail(item.pointId,item.mapJson)">
						<image src='/static/images/icon-detail.png' class='img'></image>
						<text class='title-r' >详情</text>
					</view>
                </view>
            </view>
            
            <view v-if="datas!==null&&datas.length>=10">
                <uni-load-more :status="status"  :content-text="contentText" color="#999"  />
            </view>
            
        </view>
    </view>
</template>

<script>
    import {mapState} from 'vuex'
    import uCharts from '@/components/u-charts/u-charts.js';
    import { myDot,dotStatistics,myTimes} from '@/api/user.js';
    import { getDistance } from '@/common/lib/utils.js';
    import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue'
    import areaIcon from '@/mock/areaIcon.js'
	import {getTimesDay} from '@/common/lib/message.js'
    import {iconUrl} from '@/config/index.js'
    var _self;
    var canvaRing=null;
	export default {
        components: {
            uniLoadMore
        },
		data() {
			return {
				searchDot: '',
				title: '我的随机点位数据',
                selected: 0,
                number: 10,
                pageIndex: 1,
                series: '',
                longitude: '',
                latitude: '',
                pixelRatio:1,  //canvas
                cWidth: '',  //canvas
                cHeight: '',  //canvas
                passCount:"0%", //合格
                tables: [
                    {
                        "title":"全部",
                        index: 0
                    },
                    {
                        "title":"待巡查",
                        index: 1
                    },
                    {
                        "title":"待处理",
                        index: 5
                    },
                    {
                        "title":"处理中",
                        index: 4
                    },
					{
					    "title":"已处理",
					    index: 3
					},
                    {
                        "title":"合格",
                        index: 2
                    },
                ],
                datas:[],
                status: 'more',
                isPull: 2,
                contentText: {
                    contentdown: '查看更多',
                    contentrefresh: '加载中...',
                    contentnomore: '没有更多'
                },
				array: [],  //点位处理，下拉选择的值
				chooseVal: 0,  //点位处理，下拉选择第几项
			}
		},
        onLoad(opts){
            this.setCanvasAttr()
            this.selected=parseInt(opts.keys)
        },
        computed:{
            ...mapState({
                employee:state=>state.user.employee,
            })
        },
        /*监听*/
        watch:{
            employee:{
                handler:function(datas){
                    //console.log(datas)
                },
                immediate: true
            },
        },
        // 上拉加载
        onReachBottom() {
            if(this.isPull==3){
                return false
            }
            let _self = this
            this.pageIndex = this.pageIndex+1
            let _datas =[]
            let _ars = {}
            _ars.employeeId = this.employee.id
            _ars.pageIndex= this.pageIndex
            _ars.pageSize= this.number
			_ars.roundPoint=1
            //状态赛选
            if(this.selected==0){
            }else if(this.selected==1){
                //带巡查
                _ars.watchStatus=1
            }else if(this.selected==2){
                //合格
                _ars.watchResult='1,2'
            }else if(this.selected==3){
                //处理中
                _ars.fixStatus=3
            }else if(this.selected==4){
                //待复核
                _ars.fixStatus=4
            }else if(this.selected==5){
				//待处理
				_ars.fixStatus=2
            }
            _self.status = 'loading'
            myDot(_ars).then(res=>{
                if(res.data!==null){
                    let _datas2 = _self.datas.concat(res.data)
                    _self.datas = _datas2
                    //没有更多
                    if(res.data.length<_self.number){
                        _self.status = 'nomore'
                        _self.isPull = 3
                    }else{
                        _self.status = 'more'
                    }
                }else{
                    _self.status = 'nomore'
                    _self.isPull = 3
                }
            }).catch(error=>{}) 
        },
        onShow(){
            _self = this;
			
			//周期
			let _ars3={}
			myTimes(_ars3).then(res=>{
				if(res!==null&&res.length>0){
					if(res[0].endTime==null){
						res[0].endTime = getTimesDay()
					}
					res[0].startTime = (res[0].startTime).substring(0,10)
					res[0].endTime = (res[0].endTime).substring(0,10)
					_self.array = res
				}
			}).catch(error=>{})
			
            if(_self.employee){
                //点位统计
                let _ars2 = {}
                _ars2.employeeId = _self.employee.id
				_ars2.roundPoint=1
                dotStatistics(_ars2).then(res=>{
                    _self.series = res
                    _self.passCount =  res.totalCount ? (Math.ceil((res.passCount / res.totalCount)*100)+"%") : '0%'
                }).catch(error=>{}) 
                //巡查点位
                _self.myDotFun(this.selected,'')
            }
           
            //获取定位
            uni.getLocation({
               type: 'gcj02',
               success: function (res) {
                   _self.longitude = res.longitude
                   _self.latitude = res.latitude
               }
            });
        },
		methods: {
			//搜索
			confirm(){
				this.myDotFun(this.selected,this.searchDot)
			},
			clearSearch(){
				this.searchDot = ''
				this.myDotFun(this.selected,'')
			},
			//下拉选择的值
			bindPickerChange:function(e) {
				console.log('picker发送选择改变，携带值为', e.target.value)
				this.chooseVal = e.target.value
			},
            callPhone(phones){
                uni.makePhoneCall({
                	phoneNumber: phones,
                })
            },
            //设置距离m,km
            setgetDistance(keys){
                if(this.latitude==''){
                    return ''
                }
                let _keys = JSON.parse(keys)
                let a = _keys.latitude
                let b = _keys.longitude
                let distance = getDistance(a,b,this.latitude,this.longitude)
                if(distance>1000){
                    distance=(distance/1000).toFixed(2)+'km'
                }else{
                   distance=distance+'m' 
                }
                return distance
            },
			//设置距离-数字
			distanceNumber(keys){
			    if(this.latitude==''){
			        return ''
			    }
			    let _keys = JSON.parse(keys)
			    let a = _keys.latitude
			    let b = _keys.longitude
			    let distance = getDistance(a,b,this.latitude,this.longitude)
			    return distance
			},
            //设置图标
            setImgs(item){
                let status = this.getStatus(item)
                let pointType = parseInt(item.pointType);
                let icon = areaIcon[pointType]?areaIcon[pointType].prefix:'3'
                let iconPath =`${iconUrl}/${icon}e@2x.png`
                return iconPath
            },
            getStatus(item){
                if(item.watchStatus==1){
                	return 'b'//'待巡查'
                }
                if(item.watchStatus==2&&(item.watchResult==1||item.watchResult==2)){
                	return 'c'//'合格'
                }
                if(item.watchStatus==2&&item.watchResult==3&&item.fixStatus==2){
                	return 'a'//'待处理'
                }
                if(item.watchStatus==2&&item.watchResult==3&&item.fixStatus==3){
                	return 'd'//'处理中'
                }
				if(item.fixStatus==4){
					return 'f'//'待复核'
				}
            },
            setCanvasAttr(){
            	this.cWidth=uni.upx2px(248);
            	this.cHeight=uni.upx2px(248);
            },
			//巡查上报
            toReport(ids,jsons){
				let _distance = this.setgetDistance(jsons)
                uni.navigateTo({
                    url: '/pages/task/report?ids='+ids+'&distance='+_distance,
                });
                //重置选项卡状态
                this.status = 'more'
                this.isPull = 2
                this.selected=0
            },
			//查看详情
			toReportDetail(ids,jsons){
				//设置距离
				let _distance = this.distanceNumber(jsons)
			    uni.navigateTo({
			        url: '/pages/task/reportDetail?ids='+ids+'&distance='+_distance,
			    });
			    //重置选项卡状态
			    this.status = 'more'
			    this.isPull = 2
			    this.selected=0
			},
            setClick(k){
                this.pageIndex = 1
                this.selected = k
                //重置选项卡状态
                this.status = 'more'
                this.isPull = 2
                this.myDotFun(k,this.searchDot)
            },
			//导航
			toShapes(datas){
				wx.openLocation({
					latitude: parseFloat(datas.dimension),
					longitude: parseFloat(datas.longitude),
					name: datas.pointName,
					address: datas.pointAddress
				})
			},
            myDotFun(k,names){
                let _ars = {}
                _ars.employeeId = this.employee.id
                _ars.pageIndex= this.pageIndex
                _ars.pageSize= this.number
				_ars.pointName= names  //搜索条件
				_ars.roundPoint=1
                if(k==0){
                    //全部
                }else if(k==1){
                    //带巡查
                    _ars.watchStatus=1
                }else if(k==2){
					//合格
					_ars.watchResult='1,2'
                }else if(k==3){
                    //处理中待复核
                    _ars.fixStatus=4
                }else if(k==4){
                    //处理中
                    _ars.fixStatus=3
                }else if(k==5){
                    //待处理
                    _ars.fixStatus=2
                }
                let _that = this
                myDot(_ars).then(res=>{
                    _that.datas = res.data
                }).catch(error=>{})  
            },
		}
	}
</script>