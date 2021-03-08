<template>
	<view class="page-map">
		<!-- nav bar -->
		<view style='position: fixed; z-index: 1000; top: 0; background-color: #fff;' :style="isShowTab">
			<uni-nav-bar
				:title="title"
				:fixed="false" 
				:status-bar="true"
				:shadow="false"
				:border="false"
				@clickLeft="goUser">
				<view slot="left">
					<view class="nav-bar-leftbtn">
						<image src="/static/images/icon-me.png" mode=""></image>
					</view>
				</view>
			</uni-nav-bar>
			<!-- tab -->
			<view class="page-map-tab" v-if="isTab==true" style='height: 100rpx;'>
				<view class="page-map-tab-container">
					<view class="page-map-tab-item" :class="{'is-active':item.name==tabName}" :key="index" v-for="(item,index) in tab" @click="changeTab(index,item.name)">
						{{item.name}}
					</view>
				</view>
			</view>
		</view>
		<!-- map -->
		<view class="page-map-instance"  :style="calcMapStyle" style="position: absolute; bottom: 0; box-sizing: border-box;">
			 <map
				v-if="tabIndex!==3"
				:style="calcMapStyle"
				id="mapCtx"
				show-location
				:latitude="latitude" 
				:longitude="longitude" 
				:markers="covers"
				:circles="calcCircles"
				@regionchange="handleRegionchange"
				@markertap="handleMarkerTap">
			 </map>
			 <view class="page-map-top-circle"></view>
			 <!-- 中央巡查组 -->
			 <view class="page-map-patrol-tips" v-show="tabIndex===0 && hasPatrolGroup" @click="changeTab(1,null)">
				 <view class="left">
					<image class="icon" src="/static/images/icon-patrol.png"></image>
					<text>正在城区巡查…</text>
				 </view>
				 <view class="btn">
					查看
				 </view>
			 </view>
			 <!-- 搜索 --> 
			 <view class='map-search'>
				 <view class='map-searchImg'>
					<image class='img' src='../../static/images/search.png'></image>
				 </view>
				 <view class='map-searchCont'>
					<text class='input' @click="toSearchMap">{{searchDot}}</text>
				 </view>
				 <view class='map-searchImg right' v-if="searchDot!=='搜索点位'" @click="clearSearch">
				 	<image class='img' src='../../static/images/close.png'></image>
				 </view>
			 </view>
			 
			 <view class="page-map-tabcontent">				 
				 <view class="page-map-point" @click="togetLocation"><image class="page-map-point-icon" src="/static/images/icon-point.png"></image></view>
				 <!--日常巡查-->
				 <view class="page-map-tabcontent-item" v-show="tabIndex===0||tabIndex==2">
					<!-- 图表 -->
					<view class="partrol-statistics" v-if="showMydot&&tabIndex!==2">
						<view class="hd">
							<view class="title">我的点位</view>
							<view class="title-ship">点击数字，查看详情</view>
							<view class="close" @click='hidearea(0)'>
								<image class='img' src='/static/images/close.png'></image>
							</view>
						</view>
						<view class="bd">
							<view class="charts-label">
								<view class="charts-label-item" @click="toDot(index)" v-for="(item,index) in canvasData" :key="index">
									<view>
										<view class="num">{{item.data}}</view>
									</view>
									<view class="charts-label-itemcontent">
										<view class="charts-label-point" :style="'background-color:'+colors[index-1]"></view>
										<view class="name">{{item.name}}</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					<!-- 区域信息 -->
					<view class="partrol-area" v-if="areaVisibel">
						<view class="bd">
							<view class="bd-icon" :class="calcCoversInfos[markerId].myStatusClass" @tap="toReportDetail(calcCoversInfos[markerId])">
								<image class="icon" :src="calcCoversInfos[markerId].myIconPath"></image>
							</view>
							<view class="bd-content">
								<view class="title" @tap="toReportDetail(calcCoversInfos[markerId])">{{calcCoversInfos[markerId].pointName}}</view>
								<view class="userinfo">
									<view class="userinfo-item" v-if="calcCoversInfos[markerId].contactName && calcCoversInfos[markerId].contactName!==null">
										<image class="icon" src="/static/images/icon-user.png" mode='widthFix'></image>
										<text class="name w-ellipsis">{{calcCoversInfos[markerId].contactName}}</text>
										<text class="tel" @click.stop="callPhone(calcCoversInfos[markerId].contactTel)">{{calcCoversInfos[markerId].contactTel||''}}</text>
									</view>
									<view class="userinfo-item"  v-if="calcCoversInfos[markerId].pointAddress && calcCoversInfos[markerId].pointAddress!==null">
										<image class="icon" src="/static/images/icon-address.png" mode="widthFix"></image>
										<text class="address w-ellipsis">{{calcCoversInfos[markerId].pointAddress}}</text>
										<text class="distance">{{calcCoversInfos[markerId].distance||''}}</text>
									</view>
								</view>
							</view>
							<view class="close" @click='hidearea(0)'>
								<image class='img' src='/static/images/close.png'></image>
							</view>
						</view>
						<view class="ft" v-if="tabIndex!==2">
							<view class='reportshow'>
								<view class="ft-left">
									<text class="status" :class="calcCoversInfos[markerId].myStatusClass">{{calcCoversInfos[markerId].myStatusText}}</text>
									<text class="time" v-if="calcCoversInfos[markerId].lastCheckTime && calcCoversInfos[markerId].lastCheckTime!==null&&calcCoversInfos[markerId].myStatusText!=='待巡查'">{{calcCoversInfos[markerId].lastCheckTime||''}}</text></view>
							</view>
							<view class='reportBox' @tap="toshape(calcCoversInfos[markerId])">
								<image src='/static/images/shape2.png' class='img'></image>
								<text class='title-r' >导航</text>
							</view>
							<view class='reportBox' @tap="toReport(calcCoversInfos[markerId])">
								<image src='/static/images/icon-report.png' class='img'></image>
								<text class='title-r' >巡查</text>
							</view>
							<view class='reportBox' @tap="toReportDetail(calcCoversInfos[markerId])">
								<image src='/static/images/icon-detail.png' class='img'></image>
								<text class='title-r' >详情</text>
							</view>
						</view>
					</view>
				 </view>
				 <!--随机巡查-->
				 <view class="page-map-tabcontent-item" v-show="tabIndex===1">
					<!-- 随机图表数据 -->
					<view class="partrol-statistics" v-show="showMydot">
						<view class="hd">
							<view class="title">随机点位</view>
							<view class="title-ship">点击数字，查看详情</view>
							<view class="close" @click='hidearea(0)'>
								<image class='img' src='/static/images/close.png'></image>
							</view>
						</view>
						<view class="bd">
							<view class="charts-label">
								<view class="charts-label-item" @click="toDotRandom(index)" v-for="(item,index) in canvasData" :key="index">
									<view>
										<view class="num">{{item.data}}</view>
									</view>
									<view class="charts-label-itemcontent">
										<view class="charts-label-point" :style="'background-color:'+colors[index-1]"></view>
										<view class="name">{{item.name}}</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					<!-- 区域信息 -->
					<view class="partrol-area"  v-if="areaVisibel">
						<view class="bd" @tap="toReportDetail(calcCoversInfos[markerId])">
							<view class="bd-icon" :class="calcCoversInfos[markerId].myStatusClass">
								<image class="icon" :src="calcCoversInfos[markerId].myIconPath"></image>
							</view>
							<view class="bd-content">
								<view class="title" @tap="toReportDetail(calcCoversInfos[markerId])">{{calcCoversInfos[markerId].pointName}}(随机点位)</view>
								<view class="userinfo">
									<view class="userinfo-item" v-if="calcCoversInfos[markerId].contactName && calcCoversInfos[markerId].contactName!==null">
										<image class="icon" src="/static/images/icon-user.png" mode=""></image>
										<text class="name w-ellipsis">{{calcCoversInfos[markerId].contactName}}</text>
										<text class="tel" @click.stop="callPhone(calcCoversInfos[markerId].contactTel)">{{calcCoversInfos[markerId].contactTel||''}}</text>
									</view>
									<view class="userinfo-item"  v-if="calcCoversInfos[markerId].pointAddress && calcCoversInfos[markerId].pointAddress!==null">
										<image class="icon" src="/static/images/icon-address.png" mode=""></image>
										<text class="address w-ellipsis">{{calcCoversInfos[markerId].pointAddress}}</text>
										<text class="distance">{{calcCoversInfos[markerId].distance || ''}}</text>
									</view>
								</view>
							</view>
							<view class="close" @click='hidearea(0)'>
								<image class='img' src='/static/images/close.png'></image>
							</view>
						</view>
						<view class="ft">
							<view class='reportshow'>
								<view class="ft-left">
									<text class="status" :class="calcCoversInfos[markerId].myStatusClass">{{calcCoversInfos[markerId].myStatusText}}</text>
									<text class="time" v-if="calcCoversInfos[markerId].lastCheckTime && calcCoversInfos[markerId].lastCheckTime!==null&&calcCoversInfos[markerId].myStatusText!=='待巡查'">{{calcCoversInfos[markerId].lastCheckTime || ''}}}</text>
								</view>
							</view>
							<view class='reportBox' @tap="toshape(calcCoversInfos[markerId])">
								<image src='/static/images/shape2.png' class='img'></image>
								<text class='title-r' >导航</text>
							</view>
							<view class='reportBox' @tap="toReport(calcCoversInfos[markerId])">
								<image src='/static/images/icon-report.png' class='img'></image>
								<text class='title-r' >巡查</text>
							</view>
							<view class='reportBox' @tap="toReportDetail(calcCoversInfos[markerId])">
								<image src='/static/images/icon-detail.png' class='img'></image>
								<text class='title-r' >详情</text>
							</view>
						</view>
					</view>
				</view>
				<!--发信号区域,创城迎检-->
				<view class="page-map-tabcontent-item" v-show="tabIndex===2"  style="margin-top: 40rpx;">
					<!--显示巡查员信息-->
					<view class="partrol-area" v-show="showUser" style="margin-bottom: 40rpx;">
						<view class="bd">
							<view class="bd-icon" :class="covers[markerId].class">
								<image class="icon" wx:if='covers[markerId].imgs' :src="covers[markerId].imgs"></image>
							</view>
							<view class="bd-content" style="margin-left: 24rpx;">
								<view class="title titleFlex">
									<text class='name'>{{covers[markerId].name}}</text>
									<text class='org'>{{ruleOrgs}}</text>
								</view>
								<view class="userinfo">
									<view class="userinfo-item">
										<text class="tel" @click.stop="callPhone(covers[markerId].phone)">{{covers[markerId].phone||''}}</text>
									</view>
								</view>
								<view class="userinfo-item" style="width: 123%;">
									<text>{{covers[markerId].roles}}</text>
									<text style="margin-left: 32rpx;">距离：{{covers[markerId].distance}}</text>
                                    <image v-if="employee && employee.id!==covers[markerId].id" @click="toChat(covers[markerId].name,covers[markerId].id)" class="iconChat" src="/static/images/icon-message-gray-blue.png" mode="widthFix" style="margin-left: 32rpx;"></image>
								</view>
							</view>
							<view class="close" @click='hidearea(1)'>
								<image class='img' src='/static/images/close.png'></image>
							</view>
						</view>
						<view class="ft" v-if="tabIndex!==2">
							<view class='reportshow'>
								<view class="ft-left"><text class="status" :class="calcCoversInfos[markerId].myStatusClass">{{calcCoversInfos[markerId].myStatusText}}</text><text class="time" v-if="calcCoversInfos[markerId].lastCheckTime && calcCoversInfos[markerId].lastCheckTime!==null">{{calcCoversInfos[markerId].lastCheckTime || ''}}</text></view>
							</view>
							<view class='reportBox' @tap="toshape(calcCoversInfos[markerId])">
								<image src='/static/images/shape2.png' class='img'></image>
								<text class='title-r' >导航</text>
							</view>
							<view class='reportBox' @tap="toReport(calcCoversInfos[markerId])">
								<image src='/static/images/icon-report.png' class='img'></image>
								<text class='title-r' >巡查</text>
							</view>
							<view class='reportBox' @tap="toReportDetail(calcCoversInfos[markerId])">
								<image src='/static/images/icon-detail.png' class='img'></image>
								<text class='title-r' >详情</text>
							</view>
						</view>
					</view>
					<!--显示信号 弹窗-->
					<view class="partrol-area" v-show="showSingal" style="margin-bottom: 40rpx;">
						<view class="bd">
							<view class="bd-icon" :class="signalCovers[markerId].class">
								<image class="icon" :src="signalCovers[markerId].imgs"></image>
							</view>
							<view class="bd-content" style="margin-left: 24rpx;">
								<view class="title">位置：{{signalCovers[markerId].address}}</view>
								<view class="userinfo">
									<view class="userinfo-item">
										<image class="icon" src="/static/images/icon-user.png" mode=""></image>
										<text class="name w-ellipsis">{{signalCovers[markerId].name}}</text>
										<text class="tel" @click.stop="callPhone(signalCovers[markerId].phone)">{{signalCovers[markerId].phone||''}}</text>
									</view>
									<view class="userinfo-item">
										<image class="icon" src="/static/images/icon-address.png" mode=""></image>
										<text class="address w-ellipsis">{{signalCovers[markerId].time||''}}</text>
										<text class="distance">{{signalCovers[markerId].distance}}</text>
									</view>
								</view>
							</view>
							<view class="close" @click='hidearea(2)'>
								<image class='img' src='/static/images/close.png'></image>
							</view>
						</view>
						<view class="ft">
							<view class='reportBox' style="margin-left: 60rpx;" @click="changeSignalCommand(false,signalCovers[markerId])">
								<image src='/static/images/icon-signal-close.png' class='img'></image> 
								<text class='title-r'>关闭信号</text>
							</view>
							<view class='reportBox' style="margin-right: 140rpx;">
								<image src='/static/images/icon-signal-gray2.png' class='img'></image>
								<text class='title-r'>信号提醒</text>
							</view>
						</view>
					</view>
					<!--底部菜单-->
					<view class="partrol-tools">
						<view class="partrol-tools-item" @click="toMessage">
							<image class="icon" src="/static/images/icon-message-gray.png" mode=""></image>
							<text class="text">消息管理</text>
							<view class="partrol-tools-badge" v-if='imNumber!==0'>{{imNumber}}</view>
						</view>
						<view class="partrol-tools-message" style='background-color: #E64D4D;' @click="changeSignalCommand(true)">
							<image class="icon" src="/static/images/icon-signal-white.png" mode=""></image>
							<text class="text">发信号</text>
						</view>
						<view class="partrol-tools-item" @click="toSignal">
							<image class="icon" src="/static/images/icon-signal-gray.png" mode=""></image>
							<text class="text">信号管理</text>
							<view class="partrol-tools-badge" v-if="sigNumber>0">{{sigNumber}}</view>
						</view>
					</view>		 
				</view>
				<!--新增随机点位按钮-->
				<view class='page-map-addDot' v-if="tabIndex===1" @click="toAddDot">
					<view class='map-addDot'>
						<image src='/static/images/icon-map-addDot.png' class='img'></image>
					</view>
					<text class='map-addDot-text' @click="toAddDot">新增随机点位</text>
				</view>
				<!--只看自己图标-->
				<view class="page-map-point" v-if="tabIndex===0||tabIndex===1" style='position: absolute; top: 0; right: 140rpx;' @click="showAlldotfun"><image class="page-map-point-icon" :src="showAlldot?'/static/images/eye.png':'/static/images/eye2.png'"></image></view>
				<!--统计图标-->
				<view class="page-map-point" v-if="tabIndex===0||tabIndex===1" style='position: absolute; top: 0; right: 32rpx;' @click="areashow"><image class="page-map-point-icon" :src="showMydot?'/static/images/icon-stic-blue.png':'/static/images/icon-stic-gray.png'"></image></view>
				<!--消息通知图标-->
				<view class="page-map-point" v-if="tabIndex===2" style='position: absolute; top: 0; right: 32rpx;' @click="toNice"><image class="page-map-point-icon" src="/static/images/icon-notice.png"></image></view>
			</view>
			 
			<!--发信号，显示信息-->
			<view class='page-map-mess' v-if="tabIndex==2&&signalCommand==true">
			  <view class='icon'>
				  <image src='/static/images/icon-patrol.png' class='img'></image>
			  </view>
			  <view class='text'>进行中，请做好准备工作</view>
			</view>
			<!--通知消息，显示区域-->
			<view class='page-map-notice' v-if="tabIndex==2&&noticeSys==true&&showNotice==true">
			  <view class='notice-top'>
				  <view class='notice-imgBox'>
					  <image class='img' src='/static/images/notice-white.png'></image>
				  </view>
				  <view class='notice-title'>创城通知：</view>
				  <view class='notice-title small'>右下角图标可以查看历史记录</view>
				  <text class='close' @click='closeNotice'>关闭</text>
			  </view>
			  <view class="notice-cont">
					<view class='noticeBox'>
						<view class='noticeLi' v-for="(item,i) in noticeImg" :key='i'>
							<image class='img' mode="widthFix" lazy-load :src='setUrl(item)' @click="handlePreviewImage(item)"></image>
						</view>
					</view>
				    <rich-text class='notice-text' type="text" :nodes="noticeText"></rich-text>
			  </view>
			</view>
			<!--点位处理-->
			<view class='page-dots' v-if="tabIndex==3">
					<view class='dot-top-select' v-if="tabIndex==3">
						<view class='text'>
							<text>{{null||array[0].startTime}} ~ {{null||array[0].endTime}}</text>
						</view>
					</view>
					<view class='page-dots-cont dot-contBox'>
						<view class='dot-cont' v-for="(item,k) in dotData" :key='k'>
							<view class='dot-shape' @click="toshape(item)">
								<image class='img' src='../../static/images/shape2.png'></image>
							</view>
						    <view class='cont-top' style='border-bottom: 2rpx dashed #eee; padding-bottom: 24rpx;'>
						        <view class='report-left'>
						            <view class='imgBox' v-if='item.watchStatus==2&&item.watchResult==3&&item.fixStatus==2'>
						                <image :src='setImgs(item)' class='img'></image>
						            </view>
						            <view class='imgBox orangeBg' v-if='item.watchStatus==2&&item.watchResult==3&&item.fixStatus==3'>
						                <image :src='setImgs(item)' class='img'></image>
						            </view>
						            <view class='imgBox blueBg' v-if='item.watchStatus==1'>
						                <image :src='setImgs(item)' class='img'></image>
						            </view>
									<view class='imgBox yellowBg' v-if='item.fixStatus==4'>
									    <image :src='setImgs(item)' class='img'></image>
									</view>
						            <view class='imgBox greenBg' v-if='item.watchStatus==2&&item.watchResult==1||item.watchResult==2'>
						                <image :src='setImgs(item)' class='img'></image>
						            </view>
						        </view>
						        <view class='report-right'>
						            <text class='title' v-if='item.roundPoint==0'>{{item.pointName}}</text>
									<text class='title' v-if='item.roundPoint==1'>{{item.pointName}}(随机点位)</text>
						            <view class='flex' v-if='item.pointAddress!==null'>
						                <text class='gray'>{{item.pointAddress||''}}</text>
						            </view>
						        </view>
						    </view>
							<view class='dot-history' @click='toReportDetail2(item.pointId,item.mapJson)'>
							    <view class='history-l'>
							        <text class='time'>{{item.lastCheckTime||''}}</text>
							        <text class='title blue' v-if='item.watchStatus==1'>待巡查</text>
									<text class='title orange' v-if='item.fixStatus==2'>不合格·待处理</text>
									<text class='title red' v-if='item.fixStatus==3'>不合格·处理中</text>
									<text class='title yellow' v-if='item.fixStatus==4'>不合格·已处理</text>
									<text class='title green' v-if='item.watchStatus==2&&item.watchResult==1||item.watchResult==2'>合格</text>
							        <view class='time'>
										<text v-if='item.goodCount!==null&&item.goodCount!=="0"'>{{item.goodCount}}个优秀、</text>
										<text v-if='item.passCount!==null&&item.passCount!=="0"'>{{item.passCount}}个合格、</text>
										<text v-if='item.faultCount!==null&&item.faultCount!=="0"'>{{item.faultCount}}个不合格</text>
									</view>
							        <view class='shows'>
							            <text>巡查员：{{item.checkMan||'无'}}</text>
							            <text class='phone'>{{setPhones3(item)}}</text>
										<text v-if="item.watchStatus==2||item.watchStatus==3" class='phone right' @click.stop="todotReport(item)">点位处理</text>
										<text v-if="item.watchStatus==1" class='phone right gray'>点位处理</text>
							        </view>
							    </view>
							    <view class='history-r'>
							        <view class='imgBox'>
							            <image src='/static/images/arrow.png' class='img'></image>
							        </view>
							    </view>
							</view>
						</view>
						<view class="message-no-data" v-if="dotData.length===0">
							<text>暂无点位信息！</text>
						</view>
						<view v-if="dotData!==null&&dotData.length>=10">
						    <uni-load-more :status="status"  :content-text="contentText" color="#999"  />
						</view>
					</view>
				</view>
		</view>
	</view>
</template>

<!--
@click.stop="callPhone(item.checkPhone)"
-->

<script>
	import {mapState} from 'vuex'
	import uCharts from '@/components/u-charts/u-charts.js';
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue";
	import {canvasData} from '@/mock/canvasData.js';
	import areaIcon from '@/mock/areaIcon.js'
	import {getMyCheckPoint,myCheckPointCount,loadCheckRule,listEvent,addEvent,cancelEvent,getLineUserApi,getGpsSet,uploadGPS,getAlldot} from '@/api/map.js'
	import {userInfo,userRole,myDot,imList,myTimes,sysCfg,noticeList} from '@/api/user.js'
	import {getNewArroy,setPhone,getTimesDay} from '@/common/lib/message.js'
	import {getLocation,getDistance,getRegion,getScale,addAvatarPrefix} from '@/common/lib/utils.js'
	import dayjs from '@/common/lib/dayjs.min.js'
	import ws from '@/common/lib/ws.js'
	import {iconUrl} from '@/config/index.js'
	import QQMapWX from '@/common/lib/qqmap-wx-jssdk.min.js'
	import uniLoadMore from "@/components/uni-load-more/uni-load-more.vue"
	import graceRichText from "@/common/lib/rich.js"
	var _self;
	var canvasRing=null;
	var canvasRingTask=null;
	export default{
		name:"page-map",
		components:{
			uniNavBar,
			uniLoadMore
		},
		data(){
			return {
				isLoadding: false, //重复发送信号
				isSearch: 0,
				searchDot: '搜索点位',
				searchId: '',
				airaNum: 500, //显示范围，多大距离提示信号
				SHlat: 31.239701,
				SHlng: 121.499777,
				isSHaddress: false, //如果是强制到上海，则不需要实时更新位置
				title:'智慧创城巡访',
				tabIndex:0,
				tabName:'',  //选项卡名称
				tab:[],
				dotData: [],
				//站长，点位处理数据
				showAlldot: false, //显示所有的点位
				showMydot: true, //显示我的点位统计
				isTab: true, //是否显示选项卡，网格员不显示
				commandIndex:null,//指令索引
				signalCommand:false, //发送指令
				taskCommand:false,// 紧急任务指令
				hasPatrolGroup:false,//是否存在中央巡查组
				patrolGroup:null,
				mapCtx:null,//地图实例
				mapHeight:0,
				cWidth:'',
				cHeight:'',
				canvasData:null,
				markerId:null, // 覆盖物点击id
				scale:16,
				mapRegion:{
					southwest:{latitude: 31.23069104595917, longitude: 121.50060985054014},
					northeast:{latitude: 31.241387422969222, longitude: 121.50865647758482}
				},
				colors:['#0091FF','#44D7B6','#F7B500','#FF5600','#F20000'],  //我的点位，点颜色
				stayCheck:0,//待巡查 数据
				Ring:null,
				pixelRatio:1,
				isCountFirst:true,
				passCount:'0%',
				latitude: 31.23914,
				longitude: 121.49914,
				latitude2: 31.23914, //针对搜索时，不能指定到中心，特别作用 
				longitude2: 121.49914,
				mapCoversInfos:[],  //地图点位信息
				calcCoversInfos:[], //map点信息
				inspectors:[],//ws 推送的-巡查人员
				covers: [],//覆盖物
				circles:[],
				wsCircles:[],//ws 推送的的信号-圆
				signalCircles:[],//发送的信号-圆
				signalCovers:[],//发送的信号-覆盖物
				ws:null,//websokct
				sendSignalWatcherIndex:null,
				eventIds:[] ,//属于自己的ws事件
				array: [],  //点位处理，下拉选择的值
				chooseVal: 0,  //点位处理，下拉选择第几项
				showUser:false, //显示网格员。信号点
				showSingal: false, //显示信号弹窗
				showUserId: 1, //1.2  区分点位和角色弹窗
				qqmapsdk: null, //根据坐标，获取位置详情
				address: '', //根据坐标，获取位置名称
				ChangeTime: 30000,  //多少毫秒更新一次位置
				ChangeDistance: 200,  //超过距离多远，上传一次自己的位置
				timer: null,  //定时器
				status: 'more',
				isPull: 2,
				number: 10,
				pageIndex: 1,
				contentText: {
				    contentdown: '查看更多',
				    contentrefresh: '加载中...',
				    contentnomore: '没有更多'
				},
                range: 5000000, //周边在线人员距离，m
				imNumber: 0 , //未读数量
				sigNumber: 0, //信号数量
				isMySig: false, //自己是否发送信号
				mydotDataCount: {}, //我的点位统计数据
				mydotDataCountSj: {},//我的点位统计数据-随机
				mydotDatas: [],  //我的点位数据
				mydotDatasSj: [],  //我的点位数据-随机
				allDatas: [],  //所有点位数据
				allDatasSj: [],//所有点位数据-随机
				noticeSys: false, //是否配置允许显示消息
				showNotice: true, //显示消息通知
				ruleOrgs: '', //组织结构
				noticeText:'',
				noticeImg: [],
			}
		},
		computed:{
			...mapState({
				employee:state=>state.user.employee,
				roles:state=>state.user.roles,
			}),
			//紧急任务数量
			calcStayCheck(){
				return this.stayCheck>9?'···':this.stayCheck
			},
			//地图大小
			calcMapStyle(){
				return `width:100%;height:${this.mapHeight}px`
			},
			//是否显示顶部导航
			isShowTab(){
				if(this.isTab==true){
					return `height:125px`
				}else{
					return `height:70px`
				}
			},
			//显示统计-区域信息
			areaVisibel(){
				return this.markerId!=null && this.markerId>=0 &&this.showUserId==2
			},
			//地图圆形遮罩
			calcCircles(){
				if(this.tabIndex===0||this.tabIndex===1) return []
				let circles = [...this.circles];
				if(this.signalCircles.length){
					circles = circles.concat([...this.signalCircles])
				}
				return circles;
			}
			
		},
		filters:{
			//巡查状态
			status(item){
				if(item.watchStatus==1){
					return '待巡查'
				}
				if(item.watchStatus==2&&(item.watchResult==1||item.watchResult==2)){
					return '合格'
				}
				if(item.watchStatus==2&&item.watchResult==3&&item.fixStatus==2){
					return '待处理'
				}
				if(item.watchStatus==2&&item.watchResult==3&&item.fixStatus==3){
					return '处理中'
				}
				if(item.fixStatus==4){
					return '不合格·已处理'
				}
			},
			//距离
			distance(val){
				if(val<1000){
					return val +" m"
				}else{
					return val/1000 +" km"
				}
			},
			formatTime(val){
				return dayjs(val).format('YYYY-MM-DD HH:mm')
			}
		},
		//初始加载
		async onLoad() {
			//console.log('油价在了一次')
			this.mapCtx = wx.createMapContext('mapCtx');
			_self = this;
			//订阅事件
			uni.$on("globleSearch",(rel)=>{
				//选项卡
				if(rel.roundPoint==0&&_self.tabIndex!==2){
					_self.changeTab('0','日常巡查')
				}else if(rel.roundPoint==1&&_self.tabIndex!==2){
					_self.changeTab('1','随机巡查')
				}else if(_self.tabIndex==2){
					_self.changeTab('2','创城通知')
					_self.showAlldot = false
				}
				//移动到中心
				_self.latitude = rel.dimension
				_self.longitude = rel.longitude
				_self.searchId = rel.pointId
				_self.searchDot = rel.pointName
			})
			
			canvasRing=null;
			canvasRingTask=null;
			let _qqmapsdk = new QQMapWX({
			    key: 'VGNBZ-YUX66-E4KSV-M43JP-PTXQF-MYB2O'
			}); 
			this.qqmapsdk = _qqmapsdk
			try{
				//设置tab选项卡
				await this.setTabs()
				//设置地图宽高属性
				await this.setMapAttr()
				// 获取当前位置
				await this.togetLocation()
				if(this.tabIndex==0){
					//统计数据
					await this.getMyCheckPointCount()
					// 获取点位数据
					await this.getInitData()
				}else if(this.tabIndex==1){
					//统计数据-随机
					await this.getMyCheckPointCount2()
					// 获取点位数据-随机
					await this.getInitData2()
				}else if(this.tabIndex==2){
                    //创城迎检
                    //获取点位数据
                    await this.getInitData()
                }
				//获取事件
				const eventList = await this.getListEvent()
				// 获取当前视野
				await this.getMapRegion()
				// 取消我发送的信号事件
				//await this.initCancelSignal(eventList)
				// 开启ws
				if(!this.$store.state.user.ws){
					this.$store.commit('SET_WS',new ws({employeeId:this.employee.id}))
					this.sendSignalWatcherIndex = this.$store.state.user.ws.addWatcher(this.sendSignalCallback)
					this.$store.state.user.ws.connectSocket()
				}
				//this.getRead()
				//获取周边在线巡查人员
				await this.getLineUser()
				//获取消息通知配置
				await this.getMesSys()
			}catch(e){
				console.log(e)
			}
		},
		onReady() {
			//创建map对象
			//console.log('创建地图完成')
		},
		/*监听*/
		watch:{
		    employee:{
		        handler:function(datas){
					let _funs = datas.funs
					let _roleCode = datas.roles[0].roleCode
					//网格员，不显示选项卡
					if(_roleCode=='dotGrid'){
						//网格员
						this.tabIndex = 2
						this.isTab=false
						return false
					}
					let _fla=false
					let _tab=[]
					let _fulName=''
					for(let i=0; i<_funs.length; i++){
						if((_funs[i].funCode.indexOf('mb-'))!==-1){
							if(!_fla){
								_fulName = _funs[i].funName
							}
							_fla=true
							let _ar={}
							_ar.name = _funs[i].funName
							_tab.push(_ar)
						}
					}
					this.tabName = _fulName
					this.tab = _tab
					if(_roleCode=='dotRole'){
						this.tabIndex = 2
					}
				
		        },
		    },
		},
		async onShow(){
			//刷新自己的点位
			if(this.tabIndex==3){
				this.pageIndex=1
			    this.queryDots()
			}
			//第一次打开/页面刷新，重新获取数据
			if(!this.isCountFirst){
				//得到tab菜单
				if(this.tabIndex==0){
					await this.getMyCheckPointCount()
					await this.getInitData()
					await this.getMapRegion()
					
				}else if(this.tabIndex==1){
					await this.getMyCheckPointCount2()
					await this.getInitData2()
					await this.getMapRegion()
				}else if(this.tabIndex==3){
                    this.queryDots()
                }
			}
			//定时任务： 30s执行一次，并且距离>100m
			let _that = this
			//获取gps配置信息，-更新位置
			let _ars={}
			getGpsSet(_ars).then(res=>{
				if(res!==null){
					_that.ChangeTime = (res.interval)*1000
					_that.ChangeDistance = res.minDistance
					_that.timer = setInterval(()=>{
						uni.getLocation({
							type: 'gcj02',
							success: function (res) {
								let _dis = _that.distanceNumber2(res.latitude,res.longitude)
								//如果是强制到上海，则不需要更新位置  //&&(_dis>(_that.ChangeDistance))
								if(_that.isSHaddress!==true&&_dis>10){
									let _ars={}
									_ars.employeeId = _that.employee.id
									_ars.lat = res.latitude
									_ars.lng = res.longitude
									_that.latitude = res.latitude
									_that.longitude = res.longitude
									/*针对地图-指定中心-特别租用*/
									_that.latitude2 = res.latitude
									_that.longitude2 = res.longitude
									uploadGPS(_ars)
								}
								//每个30s获取一次在线用户
								_that.getLineUser()
							}
						});
					},_that.ChangeTime)
				}
			}).catch(e=>{})
			//未读数量
			this.getRead()
		},
		//页面关闭的时候
		async onUnload() {
			//清楚定时器
			this.clearIntervals()
			// 删除监听事件
			if(this.sendSignalWatcherIndex>=0){
				this.$store.state.user.ws.delWatcher(this.sendSignalWatcherIndex)
			}
			// 关闭socket
			this.$store.state.user.ws.closeSocket()
		},
		beforeDestroy(){
			this.clearIntervals()
		},
		// 上拉加载-点位处理数据
		onReachBottom() {
			if(this.tabIndex!==3){
				return false
			}
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
		    _self.status = 'loading' 
		    myDot(_ars).then(res=>{
		        if(res.data!==null){
		            let _datas2 = _self.dotData.concat(res.data)
		            _self.dotData = _datas2
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
		methods:{
			//查询未读数量
			getRead(){
				let _ars={}
				_ars.memberId = this.employee.id
				let _that = this
				imList(_ars).then(res=>{
					if(res!==null&&res.length>0){
						let _shows=0
						for(let i=0; i<res.length; i++){
							_shows+=res[i].unreadCount
						}
						if(_shows>9){
							_that.imNumber = '···'
						}else{
							_that.imNumber = _shows
						}
					}
				}).catch(error=>{})
			},
			//清理定时器
			clearIntervals(){
				clearInterval(this.timer)
				this.timer=null
			},
			//距离-数字
			distanceNumber2(a,b){
			    if(this.latitude==''){
			        return ''
			    }
			    let distance = getDistance(a,b,this.latitude2,this.longitude2)
			    return distance
			},
			//显示img
			setImgs(item){
				let status = this.getStatus(item)
				let pointType = parseInt(item.pointType);
				let icon = areaIcon[pointType]?areaIcon[pointType].prefix:'3'
				let iconPath =`${iconUrl}/${icon}e@2x.png`
				return iconPath
			},
			distanceMeter(val){
				if((val==null||val=='')&&val!==0){
					return '';
				}else{
					if(val<1000){
						return val +" m"
					}else{
						return val/1000 +" km"
					}
				}
			},
			//点位显示
			areashow(){
				if(this.showMydot==true){
					this.showMydot = false;
					this.markerId=null;
				}else{
					if(this.tabIndex==0){
						this.getMyCheckPointCount()
					}else if(this.tabIndex==1){
						this.getMyCheckPointCount2()
					}
					this.showMydot = true;
					this.markerId=null;
				}
			},
            //跳转到聊天界面
            toChat(name,id){
				this.clearIntervals()
				uni.navigateTo({
					url: '/pages/task/chat-one?names='+name+'&ids='+id+'&employeeId='+this.employee.id,
				});  
            },
			setPhones(arr1){
				if(arr1==null||arr1==undefined){
					return ''
				}
				return setPhone(arr1.phone)
			},
			setPhones3(arr1){
				if(arr1==null||arr1==undefined){
					return ''
				}
				return setPhone(arr1.checkPhone)
			},
			//点位隐藏
			hidearea(k){
				this.showMydot = false;
				this.showUser=false;
				this.showSingal=false;
				//人员 图标大小,还原
				if(this.markerId!==null){
					if(this.tabIndex==2){
						if(k==1){
							this.covers[this.markerId].width = 40;
							this.covers[this.markerId].height = 40;
						}else if(k==0){
							this.covers[this.markerId].width = 28;
							this.covers[this.markerId].height = 28;
						}else{
							//信号图标还原
							this.signalCovers[this.markerId].width = 40;
							this.signalCovers[this.markerId].height = 40;
						}
					}else{
						this.covers[this.markerId].width = 40;
						this.covers[this.markerId].height = 40;
					}
				}
				this.markerId=null;
			},
            callPhone(phones){
                uni.makePhoneCall({
                	phoneNumber: phones,
                })
                return false;
            },
            //跳转到任务列表
            toDot(k){
				//清理定时任务
				this.clearIntervals()
                uni.navigateTo({
                    url: '/pages/task/dot?keys='+k,
                });
            },
			//跳转到随机
			toDotRandom(k){
				//清理定时任务
				this.clearIntervals()
			    uni.navigateTo({
			        url: '/pages/task/dotRandom?keys='+k,
			    });
			},
			// 获取周边在线的人员
			async getLineUser(){
				let _ars={}
				_ars.range = this.range
				_ars.lng = this.longitude
				_ars.lat = this.latitude
				let _that = this
				getLineUserApi(_ars).then(res=>{
					if(res!==null){
						let _shows=[]
						for(let i=0; i<res.length; i++){
							let _ar={}
							let _imgs=''
							_ar.id = res[i].employeeId
							_ar.types=0
							_ar.latitude = res[i].lat
							_ar.longitude = res[i].lng
							_ar.width = 40
							_ar.height = 40
							_ar.name = res[i].employeeName
							_ar.phone = res[i].employeePhone
							_ar.roles = res[i].roleName
							_ar.roleCode = res[i].roleCode
							//职位
							_ar.position = res[i].position
							//更新位置时间
							_ar.positionTime = res[i].positionTime
							let _codes = res[i].roleCode
							if(_codes=='dotRole'){
								_imgs = '../../static/images/icon2.png'
							}else if(_codes=='dotGrid'){
								_imgs = '../../static/images/icon3.png'
							}else{
								_imgs = '../../static/images/icon1.png'
							}
							_ar.iconPath = _imgs
							_ar.anchor = {x:0.5,y:0.5}
							_shows.push(_ar)
						}
						_that.inspectors = _shows
					}
				}).catch(err=>{})
				
			},
			//设置选项卡
			async setTabs(){
				if(this.employee){
					let _funs = this.employee.funs
					if(_funs==null||_funs.length==0){
						return false
					}else{
						let _roleCode = this.employee.roles[0].roleCode
						//网格员，不显示选项卡
						if(_roleCode=='dotGrid'){
							//网格员
							this.tabIndex = 2
							this.isTab=false
							return false
						}
						let _fla=false
						let _tab=[]
						let _fulName=''
						for(let i=0; i<_funs.length; i++){
							if((_funs[i].funCode.indexOf('mb-'))!==-1){
								if(!_fla){
									_fulName = _funs[i].funName
								}
								_fla=true
								let _ar={}
								_ar.name = _funs[i].funName
								_tab.push(_ar)
							}
						}
						this.tabName = _fulName
						this.tab = _tab
						if(_roleCode=='dotRole'){
							this.tabIndex = 2
							/*this.tabIndex = 3
							//查询自己的点位处理
							this.queryDots()
							//周期
							let _ars3={}
							let _self = this
							myTimes(_ars3).then(res=>{
								if(res!==null&&res.length>0){
									if(res[0].endTime==null){
										res[0].endTime = getTimesDay()
									}
									res[0].startTime = (res[0].startTime).substring(0,10)
									res[0].endTime = (res[0].endTime).substring(0,10)
									_self.array = res
								}
							}).catch(error=>{})*/
						}
					}
				}
			},
            //点位站长，查询自己的点位
            queryDots(){
                let _ars = {}
                _ars.employeeId = this.employee.id
                _ars.pageIndex= this.pageIndex
                _ars.pageSize= this.number
                let _that = this
                myDot(_ars).then(res=>{
					if(res.data==null){
						_that.dotData=[]
					}else{
						_that.dotData = res.data
					}
                }).catch(error=>{})  
            },
			//清除点位信息
			clearMapDot(){
				this.covers=[]
				this.mapCoversInfos=[]
				this.calcCoversInfos=[]
			},
			//选项卡切换
			async changeTab(index,name){
				this.showUser=false;
				this.showSingal=false;
				this.markerId = null
				if(name=='日常巡查'){
					this.tabIndex = 0
					this.tabName = '日常巡查'
					//显示统计
					this.showMydot = true;
					//点位重置
					this.clearMapDot()
					//我的点位数据,统计
					await this.getMyCheckPointCount()
					if(this.showAlldot==true){
						await this.showAlldotfun1()
					}else{
						await this.getInitData()
					}
					
				}else if(name=='随机巡查'){
					this.tabIndex = 1
					this.tabName = '随机巡查'
					//显示统计
					this.showMydot = true;
					//点位重置
					this.clearMapDot()
					//随机数据,统计
					await this.getMyCheckPointCount2()
					if(this.showAlldot==true){
						await this.showAlldotfun2()  //自己随机
					}else{
						await this.getInitData2()  //全部随机
					}
				}else if(name=='创城通知'){
					this.tabIndex = 2
					this.tabName = '创城通知'
					//隐藏统计
					this.showMydot = false;
					this.showAlldot = false
					//点位重置
					this.clearMapDot()
                    //获取点位数据
                    await this.getInitData()
				}else if(name=='点位处理'){
					this.tabIndex = 3
					this.tabName = '点位处理'
					//隐藏统计
					this.showMydot = false;
                    //查询自己的点位处理
                    this.queryDots()
					if(this.array.length==0){
						//周期
						let _ars3={}
						let _self = this
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
					}
				}
				//刷新地图视野
				await this.getMapRegion()
			},
			//查看-自己的数据-所有的数据
			async showAlldotfun(){
				this.showMydot = true;
				this.showUser=false;
				this.showSingal=false;
				this.markerId = null
				//点位重置
				this.clearMapDot()
				if(this.showAlldot==true){
					this.showAlldot = false
					uni.showToast({
						title: '您已关闭只看自己的点位',
						icon: 'none',
						duration: 1500
					})
					if(this.tabIndex==0){
						//日常
						await this.getInitData()
					}else if(this.tabIndex==1){
						//随机
						await this.getInitData2()
					}
				}else{
					uni.showToast({
						title: '您已开启只看自己的点位',
						icon: 'none',
						duration: 1500
					})
					this.showAlldot = true
					if(this.tabIndex==0){
						//日常
						await this.showAlldotfun1()
					}else if(this.tabIndex==1){
						//随机
						await this.showAlldotfun2()
					}
				}
				//刷新地图视野
				await this.getMapRegion()
			},
			//查看-自己的数据-日常巡查
			async showAlldotfun1(){
				let res;
				if(this.mydotDatas.length==0){
					res = await getMyCheckPoint({"employeeId":this.employee.id,"pageIndex":1,"pageSize":2000,"roundPoint":0});
					let covers = [];
					let mapCoversInfos = res.data || []
					//let mapJson = null;
					let _length = mapCoversInfos.length
					if(_length>0){
						for(let i=0;i<_length;i++){
							//经纬度
							//mapJson = JSON.parse(mapCoversInfos[i].mapJson);
							mapCoversInfos[i].distance = 0;
							mapCoversInfos[i].mapJson = JSON.parse(mapCoversInfos[i].mapJson)
							mapCoversInfos[i].pointType = parseInt(mapCoversInfos[i].pointType)
						}
					}
					//地图点位信息
					this.mapCoversInfos = mapCoversInfos;
					this.mydotDatas = mapCoversInfos
				}else{
					let mapCoversInfos = this.mydotDatas
					//地图点位信息
					this.mapCoversInfos = mapCoversInfos;
				}
				
			},
			//查看-自己的数据-随机
			async showAlldotfun2(){
				let res;
				if(this.mydotDatasSj.length==0){
					res = await getMyCheckPoint({"employeeId":this.employee.id,"pageIndex":1,"pageSize":2000,"roundPoint":1});
					let covers = [];
					let mapCoversInfos = res.data || []
					//let mapJson = null;
					let _length = mapCoversInfos.length
					if(_length>0){
						for(let i=0;i<_length;i++){
							//经纬度
							//mapJson = JSON.parse(mapCoversInfos[i].mapJson);
							mapCoversInfos[i].distance = 0;
							mapCoversInfos[i].mapJson = JSON.parse(mapCoversInfos[i].mapJson)
							mapCoversInfos[i].pointType = parseInt(mapCoversInfos[i].pointType)
						}
					}
					//地图点位信息
					this.mapCoversInfos = mapCoversInfos;
					this.mydotDatasSj = mapCoversInfos
				}else{
					let mapCoversInfos = this.mydotDatasSj
					//地图点位信息
					this.mapCoversInfos = mapCoversInfos;
				}
			},
			// 获取自己的点位数据
			async getInitData(){
				//const res = await getMyCheckPoint({"pageIndex":1,"pageSize":2000,"roundPoint":0})
				//判断数据是否已经存在
				let res;
				if(this.allDatas.length==0){
					res = await getAlldot({"pageIndex":1,"pageSize":2000,"roundPoint":0})
					let covers = [];
					let mapCoversInfos = res.data || []
					//let mapJson = null;
					let _length = mapCoversInfos.length
					if(_length>0){
						for(let i=0;i<_length;i++){
							//经纬度
							//mapJson = JSON.parse(mapCoversInfos[i].mapJson);
							mapCoversInfos[i].distance = 0;
							mapCoversInfos[i].mapJson = JSON.parse(mapCoversInfos[i].mapJson)
							mapCoversInfos[i].pointType = parseInt(mapCoversInfos[i].pointType)
						}
					}
					this.allDatas = mapCoversInfos
					//地图点位信息
					this.mapCoversInfos = mapCoversInfos;
					// this.covers = covers
				}else{
					let mapCoversInfos = this.allDatas
					//地图点位信息
					this.mapCoversInfos = mapCoversInfos;
				}
			},
			// 获取点位数据2--随机点位数据
			async getInitData2(){
				//const res = await getMyCheckPoint({"pageIndex":1,"pageSize":2000,"roundPoint":1})
				//判断数据是否已经存在
				let res;
				if(this.allDatasSj.length==0){
					res = await getAlldot({"pageIndex":1,"pageSize":2000,"roundPoint":1})
					let covers = [];
					let mapCoversInfos = res.data || []
					//let mapJson = null;
					let _length = mapCoversInfos.length
					if(_length>0){
						for(let i=0;i<_length;i++){
							//经纬度
							//mapJson = JSON.parse(mapCoversInfos[i].mapJson);
							mapCoversInfos[i].distance = 0;
							mapCoversInfos[i].mapJson = JSON.parse(mapCoversInfos[i].mapJson)
							mapCoversInfos[i].pointType = parseInt(mapCoversInfos[i].pointType)
						}
					}
					this.allDatasSj = mapCoversInfos
					//地图点位信息
					this.mapCoversInfos = mapCoversInfos;
					// this.covers = covers
				}else{
					let mapCoversInfos = this.allDatasSj
					//地图点位信息
					this.mapCoversInfos = mapCoversInfos;
				}
				
			},
			// 获取事件
			async getListEvent(){
				let _that = this
				const res = await listEvent()
				let patrolGroup = res.find(item=>{
					if(item.eventName=='中央巡查组来了'){
						return item
					}
				})
				// 设置巡查组
				if(patrolGroup && patrolGroup.id){
					this.hasPatrolGroup = true
					this.patrolGroup = {
						...patrolGroup,
						latitude:patrolGroup.lat,
						longitude:patrolGroup.lng
					}
				}
				let _numbers=0
				// let eventIds = []
				res.map(item=>{
					if(item.eventName=='发信号' && item.status==1  && item.employeeId && item.employeeId){
						//创城巡检
						_numbers+=1
						//if(this.tabIndex==2){
							let _ids = 'sss'+ item.employeeId
							this.signalCircles.push({
							  time: item.eventTime,
							  id: _ids,
							  latitude: item.lat,
							  longitude: item.lng,
							  color: '#E64D4D',
							  fillColor: '#E020200D',
							  //半径为M
							  radius: 500,
							  strokeWidth: 1,
							  datas: item.subsidiary
							})
							this.signalCovers.push({
								time: item.eventTime,
								types: 1,
								id: _ids,
								latitude:item.lat,
								longitude:item.lng,
								iconPath:'../../static/images/icon-signal-covers.png',
								width: 40,
								height: 40,
								anchor:{x:0.5,y:0.5},
								datas: item.subsidiary
							})
							//添加到ws事件
							this.eventIds.push({id:item.id,employeeId:item.employeeId,eventName:"发信号",subsidiary:item.subsidiary})
						//}
						//判断是自己发送的
						if(item.employeeId==this.employee.id){
							this.isMySig = true
						}
						//显示-判断距离
						let _distance = getDistance(item.lat,item.lng,this.latitude,this.longitude)
						if(_distance<=500){
							this.signalCommand = true
						}
					}
				})
				this.sigNumber = _numbers
				//去掉重复数据,我的eventIds
				let _arrs4 = getNewArroy(this.eventIds)
				this.eventIds = _arrs4
				//移除id相同的值-坐标
				let _arrs = getNewArroy(this.signalCovers)
				this.signalCovers = _arrs
				//去掉相同信号的圆
				let _arrs3 = getNewArroy(this.signalCircles)
				this.signalCircles = _arrs3
				//去掉巡查人员id相同的值
				//let _arrs2 = getNewArroy(this.inspectors)
				//this.inspectors = _arrs2
				return res
			},
			// ws 发送信号 回调
			async sendSignalCallback({data,type}){
				console.log({data,type})
				if(type == 'watchevent'){
					if(data.eventName=="发信号"){
						if(data.status==1){
							let _num = this.sigNumber +1
							this.sigNumber = _num
							if(data.employeeId == this.employee.id){
								uni.showToast({
									title: '信号已发送!',
									icon: 'none',
									duration: 1000
								})
							}
							//显示区域-判断距离是否显示
							let _distance = getDistance(data.lat,data.lng,this.latitude,this.longitude)
							if(_distance<=500){
								this.signalCommand = true
							}
							let _ids = 'sss'+ data.employeeId
							//迎检的时候，添加
							this.signalCircles.push({
							  types: 1,
							  latitude:data.lat,
							  longitude:data.lng,
							  color: '#E64D4D',
							  fillColor: '#E020200D',
							  //半径为M
							  radius: 500,
							  content:'type222',
							  strokeWidth: 1,
							  datas: data.subsidiary
							})
                            
							this.signalCovers.push({
								time: data.eventTime,
								id: _ids,
								types: 1,
								latitude:data.lat,
								longitude:data.lng,
								iconPath:'../../static/images/icon-signal-covers.png',
								width: 40,
								height: 40,
								anchor:{x:0.5,y:0.5},
								datas: data.subsidiary
							})
							this.isMySig = true
							this.eventIds.push({id:data.id,employeeId:data.employeeId,eventName:"发信号",subsidiary:data.subsidiary})
						}else{
							this.isMySig = false
							let _num = this.sigNumber-1
							this.sigNumber = _num
                            this.signalCommand = false
							// 取消圆，覆盖物
							if(this.signalCircles.length && this.signalCovers.length){
								let index = this.signalCircles.findIndex((item)=>{
									return item.id === data.id
								})
								this.signalCircles.splice(index,1)
								this.signalCovers.splice(index,1)
							}
							// 移除
							this.removeEventIds(data)
						}
						await this.getMapRegion()
					}
					this.isLoadding = false
					uni.hideLoading();
				}else if(type=='noticeInfo'){
					//通知
					if(this.noticeSys == true){
						this.noticeText = graceRichText.format(data.noticeText)
						this.showNotice = true
					}
				}
			},
			// 根据id移除eventIds
			removeEventIds(data){
				let eventIndex = this.eventIds.findIndex(item=>{
					return item.id===data.id
				})
				this.eventIds.splice(eventIndex,1)
			},
			// 发送消息-发信号
			sendSignal(){
				let _json = this.employee
				let _that = this
				let _isLoadding = this.isLoadding
				if(!_isLoadding){
					_that.isLoadding = true
					uni.showLoading({
					    title: '发送中..'  
					});
					//获取坐标
					uni.getLocation({
						type: 'gcj02',
						success: function (res) {
							let _latitude = (res.latitude).toFixed(6)
							let _longitude = (res.longitude).toFixed(6)
							/*uni.showToast({
								title: _latitude+':::::'+_longitude,
								icon: 'none',
								duration: 100000
							})
							return false*/
							let _ars={"employeeId":_that.employee.id,"eventName":"发信号","lat":_latitude,"lng":_longitude,types:'mess'}
							_json.msgContent = 'https://apis.map.qq.com/ws/staticmap/v2/?center='+_latitude+','+_longitude+'&zoom=14&size=600*300&maptype=roadmap&markers=size:large|color:0xFFCCFF|label:k|'+_latitude+','+_longitude+'&key=VGNBZ-YUX66-E4KSV-M43JP-PTXQF-MYB2O'
							//获取位置
							_that.qqmapsdk.reverseGeocoder({
							    location: {
							        latitude: _that.latitude,
							        longitude: _that.longitude,
							    },
							    success(res){
									_json.address= res.result.address
									_ars.subsidiary = JSON.stringify(_json)
									const _res2 = addEvent(_ars)
							    },
							    fail(err){
									_json.address = '地址名称获取失败'
									_ars.subsidiary = JSON.stringify(_json)
									const _res2 = addEvent(_ars)
							    }
							})
						},
						error: function(err){
							uni.showToast({
								title: '位置获取失败，发信信号不成功！',
								icon: 'none',
								duration: 1500
							})
							_that.isLoadding = false
							uni.hideLoading();
						}
					});
				}else{
					console.log('别点了，无效')
				}
			},
			// 初始化时，取消自己发送的消息
			async initCancelSignal(list){
				let cancelEventList = []
				list.map(item=>{
					// cancelEventList.push({id:item.id,employeeId:item.employeeId})
					if(item.employeeId === this.employee.id){
						cancelEventList.push({id:item.id,employeeId:item.employeeId})
					}
				})
				cancelEventList.map(async item=>{
					await cancelEvent({id:item.id,"cancelEmployeeId":item.employeeId})
				})
			},
			//设置地图高度
			async setMapAttr(){
				const res = uni.getSystemInfoSync();
				if(this.isTab){
					this.mapHeight = res.windowHeight - 44 - uni.upx2px(80) -res.statusBarHeight
				}else{
					this.mapHeight = res.windowHeight - uni.upx2px(80)-res.statusBarHeight
				}
			},
			// 获取点位统计
			async getMyCheckPointCount(){
				//判断点位数据是否存在
				let count;
				if(JSON.stringify(this.mydotDataCount)=='{}'){
					count = await myCheckPointCount( {"employeeId":this.employee.id,'roundPoint':0})
					this.mydotDataCount = count
				}else{
					count = this.mydotDataCount
				}
				this.isCountFirst = false;
				let series = [
					{
						"name": "我的点位",
						"data": count.totalCount || 0
					},
					 {
						"name": "待巡查",
						"data": count.stayCheck || 0
					},{
						"name": "合格",
						"data": count.passCount || 0
					},
					{
						"name": "不合格·已处理",
						"data": count.stayReview || 0
					},{
						"name": "不合格·处理中",
						"data": count.fixing || 0
					},{
						"name": "不合格·待处理",
						"data": count.stayFix || 0
					}];
				this.stayCheck = count.stayCheck || 0;
				this.canvasData = series;
			},
			// 获取点位随机点位
			async getMyCheckPointCount2(){
				//判断点位数据是否存在
				let count;
				if(JSON.stringify(this.mydotDataCountSj)=='{}'){
					count = await myCheckPointCount( {"employeeId":this.employee.id,'roundPoint':1})
					this.mydotDataCountSj = count
				}else{
					count = this.mydotDataCountSj
				}
				this.isCountFirst = false;
				let series = [
					{
						"name": "我的随机点位",
						"data": count.totalCount || 0
					},
					 {
						"name": "待巡查",
						"data": count.stayCheck || 0
					},{
						"name": "合格",
						"data": count.passCount || 0
					},
					{
						"name": "不合格·已处理",
						"data": count.stayReview || 0
					},{
						"name": "不合格·处理中",
						"data": count.fixing || 0
					},{
						"name": "不合格·待处理",
						"data": count.stayFix || 0
					}];
				this.canvasData = series;
			},
			//发信号-取消信号
			async changeSignalCommand(flag,data){
				if(flag==true){  //&&this.isMySig!==true
					//发信号,避免重复发信号
					let _that = this
					uni.showModal({
						title: '提示',
						content: '确定要发送信号?',
						success: function (res) {
							if (res.confirm) {
								_that.sendSignal()
								_that.isMySig = true
								_that.showUser= false
								_that.showSingal=false
							} else if (res.cancel) {
								console.log('用户点击取消');
							}
						}
					})
					//提示
					/*this.showUser= false
					this.showSingal=false*/
				}else if(flag==false){
					let _that = this
					uni.showModal({
						title: '提示',
						content: '确定要关闭信号?',
						success: function (res) {
							if (res.confirm) {
								let _ids = data.id.substring(3)
								//console.log(_ids)
								//console.log(this.eventIds)
								//取消信号
								let event = _that.eventIds.find(item=>{
									return (item.eventName==="发信号" && item.employeeId ==_ids)
								})
								cancelEvent({id:event.id,"cancelEmployeeId":event.employeeId})
								_that.isMySig = false
								//隐藏信号弹窗
								_that.showUser= false
								_that.showSingal=false
								_that.signalCommand=false
								//信号图标还原
								_that.signalCovers[_that.markerId].width = 40;
								_that.signalCovers[_that.markerId].height = 40;
								_that.markerId=null
							} else if (res.cancel) {
								console.log('用户点击取消');
							}
						}
					})
					
				}
				//this.signalCommand = flag;
			},
			// 获取当前位置
			async togetLocation(){
				try{
					const res = await getLocation()
					//判断，如果距离上海浦东超过200km，那么位置定位到上海浦东
					let _distances = getDistance(this.SHlat,this.SHlng,res.latitude,res.longitude)
					if(_distances>250000){
						this.latitude=this.SHlat;//31.23914;
						this.longitude=this.SHlng;//121.49914;
						res.latitude = this.SHlat
						res.longitude = this.SHlng
						this.isSHaddress = true
						uni.showToast({
						    title: '由于您距离浦东超过200km，现已强制定位到浦东',
						    icon: 'none',
						    duration: 2000
						})	
					}else{
						//移动到中心
						this.latitude = res.latitude
						this.longitude = res.longitude
						/*针对地图-指定中心-特别租用*/
						this.latitude2 = res.latitude
						this.longitude2 = res.longitude
						this.moveTolocation();
					}
					//上传自己的坐标
					let _ars={}
					_ars.employeeId = this.employee.id
					_ars.lat = res.latitude
					_ars.lng = res.longitude
					const gps = await uploadGPS(_ars)
					// 上报巡查人位置
					//await this.reportLocation({latitude:res.latitude,longitude:res.longitude})
				}catch(e){
					uni.showToast({
						icon:'none',
						title:e
					})
				}
			},
			/*移动到中心*/
			moveTolocation() {
				this.mapCtx.moveToLocation();
			},
			// 视野变化
			async handleRegionchange(e){
				// 视野变化，清空选择的id
				this.markerId = null;
				// 视野变化 结束
				this.showUser = false;
				this.showSingal=false;
				if(e.type === 'end'){
					// 视野范围- 西南角与东北角的经纬度
					await this.getMapRegion()
				}
			},
			// 获取视野范围
			async getMapRegion(){
				// 视野范围，移动地图
				try{
					console.log('视野范围')
					const res = await getRegion(this.mapCtx)
					this.mapRegion.northeast = res.northeast
					this.mapRegion.southwest = res.southwest
					// 缩放等级
					const scaleRes = await getScale(this.mapCtx)
					this.scale = scaleRes.scale
					// 获取范围内点
					await this.setCalcCoversInfos()
					// 计算覆盖物
					await this.calcMarkers()
				}catch(e){
					uni.showToast({
						icon:'none',
						title:e
					})
				}
			},
			//获取地图视野内的点位
			async setCalcCoversInfos(){
				let myStatus = null
				let myStatusText = null
				let myStatusClass = ''
				let myIconPath = ''
				let southwest = this.mapRegion.southwest;
				let northeast = this.mapRegion.northeast;
				// let mapJson = null
				let covers = []
				if(this.scale>=13){ 
					this.mapCoversInfos.forEach(item=>{
						let mapJson = item.mapJson
						let pointType = item.pointType
						let _watchStatus = item.watchStatus
						let _watchResult = item.watchResult
						let _fixStatus = item.fixStatus
						let icon = areaIcon[pointType]?areaIcon[pointType].prefix:'3'
						if(mapJson.latitude > southwest.latitude && mapJson.latitude <northeast.latitude && mapJson.longitude > southwest.longitude && mapJson.longitude <northeast.longitude){
							if(_watchStatus==1){
								myStatus = 1
								myStatusText = '待巡查'
								myStatusClass = 'pending-inspection'
							}
							if(_watchStatus==2&&(_watchResult==1||_watchResult==2)){
								myStatus = 4
								myStatusText =  '合格'
								myStatusClass = 'qualified'
							}
							if(_watchStatus==2&&_watchResult==3&&_watchResult==2){
								myStatus = 2
								myStatusText =  '待处理'
								myStatusClass = 'pending-disposal'
							}
							if(_watchStatus==2&&_watchResult==3&&_watchResult==3){
								myStatus = 3
								myStatusText =  '处理中'
								myStatusClass = 'processing'
							}
							if(_fixStatus==4){
								myStatus = 5
								myStatusText =  '不合格·已处理'
								myStatusClass = 'processing-yellow'
							}
							item.myStatusText = myStatusText
							item.myStatus = myStatus
							item.myStatusClass = myStatusClass
							item.myIconPath = `${iconUrl}/${icon}e@2x.png`
							covers.push(item)
						}
					})
				}
				this.calcCoversInfos = covers
				// return covers
			},
			// 计算覆盖物
			async calcMarkers(){
				let covers = [];
				let mapJson=null;
				let width = 40;
				let height = 40;
				let iconPath = ''
				let _keys=-1
				//判断是搜索
				if(this.searchId!==''){
					let _cas = this.calcCoversInfos
					for(let i=0; i<_cas.length; i++){
						if(this.searchId==_cas[i].pointId){
							_keys = i
							break
						}
					}
				}
				this.calcCoversInfos.map(async (item,i)=>{
					mapJson = item.mapJson
					if(this.tabIndex==2){
						// 巡查指挥，缩小图标宽度
						width = 28;
						height = 28;
					}
					let status = this.getStatus(item)
					let pointType = item.pointType;
					let icon = areaIcon[pointType]?areaIcon[pointType].prefix:'3'
					iconPath = `${iconUrl}/${icon}${status}@2x.png`
					covers.push({
						id:i,
						latitude:mapJson.latitude,
						longitude:mapJson.longitude,
						iconPath:iconPath,
						anchor:{x:0.5,y:0.5},
						width,
						height
					})
				})
				//显示迎检人员的信息
				if(this.tabIndex==2){
					let len = this.calcCoversInfos.length;
					this.inspectors.map(async (item,i)=>{
						covers.push({
							...item,
							id:item.id, //len+i
							pointType:'inspector'
						})
					})
					if(this.signalCovers.length){
						covers = covers.concat([...this.signalCovers])
					}
				}
				this.covers = covers;
				//模拟执行
				if(this.searchId!==''){
					let _ars2={}
					_ars2.markerId = _keys
					_ars2.detail={}
					this.handleMarkerTap(_ars2);
				}
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
					return 'f'//'不合格·已处理'
				}
			},
			// marker 点击
			async handleMarkerTap(e){
				//统计取消
				this.showMydot = false;
				this.showUser = false;
				this.showSingal=false;
				//随机巡查-显示随机数据
				/*if(this.tabIndex===1) return false*/
				// 小程序模拟器与真机和h5的markerId取值不一样
				let id = e.detail.markerId===undefined? e.markerId:e.detail.markerId;
				let covers = [...this.covers]
				
				if(this.markerId!=null && this.markerId>=0){
					covers[this.markerId].width = 40;
					covers[this.markerId].height = 40;
				}
				if(id!==this.markerId){
					if(id.length==32||id.length==36){
						//人员，得到当前数据
						let _id=0
						for(let i=0; i<covers.length; i++){
							if(covers[i].id ==id ){
								_id = i
								break;
							}
						}
						covers[_id].width = 64;
						covers[_id].height = 64;
						// 设置距离
						let _roleCode = covers[_id].roleCode
						let distance = getDistance(covers[_id].latitude,covers[_id].longitude,this.latitude2,this.longitude2)
						let _ars= covers[_id]
						_ars.distance = this.distanceMeter(distance)
						//查询角色
						let _infos = await this.getUserOrgs(id)
						this.ruleOrgs = _infos
						if(_roleCode=='dotGrid'){
							_ars.class = 'wangge'
							_ars.imgs='/static/images/icon3-w.png'
						}else if(_roleCode=='dotRole'){
							_ars.class = 'zhanzhang'
							_ars.imgs='/static/images/icon2-w.png'
						}else{
							_ars.class = 'xuncha'
							_ars.imgs='/static/images/icon1-w.png'
						}
						covers[_id] = _ars
						this.$set(this,'covers',covers)
						this.markerId = _id;
						this.showUser = true
						this.showUserId =1
					}else if(id.length==35||id.length==39){
						//信号
						let _oldId = id
						let newId = id.substring(3)
						let _id=0
						let _signalCovers = this.signalCovers
						for(let i=0; i<_signalCovers.length; i++){
							if(_signalCovers[i].id ==_oldId ){
								_id = i
								break;
							}
						}
						_signalCovers[_id].width = 64;
						_signalCovers[_id].height = 64;
						let _infos = JSON.parse(_signalCovers[_id].datas)
						// 设置距离
						let distance = getDistance(_signalCovers[_id].latitude,_signalCovers[_id].longitude,this.latitude2,this.longitude2)
						let _ars=_signalCovers[_id]
						_ars.id = _oldId
						_ars.name = _infos.name
						_ars.phone = _infos.phone
						//查询发信号的时间
						let _time=''
						for(let i=0; i<_signalCovers.length; i++){
							let _idds = (_signalCovers[i].id).substring(3)
							if(_idds==_infos.id){
								_time =_signalCovers[i].time
								break;
							}
						}
						let _ars2={}
						_ars.address = _infos.address
						_ars.time = _time
						_ars.distance = this.distanceMeter(distance)
						_ars.class = 'red'
						_ars.imgs='/static/images/icon-signal-white.png'
						_signalCovers[_id] = _ars
						this.$set(this,'signalCovers',_signalCovers)
						this.markerId = _id;
						this.showSingal=true;
						this.showUserId =1
					}else{
						// 选择点-直接点击点
						covers[id].width = 64;
						covers[id].height = 64;
						// 设置距离
						let distance = getDistance(covers[id].latitude,covers[id].longitude,this.latitude2,this.longitude2)
                        distance = this.distanceMeter(distance)
						this.$set(this.calcCoversInfos[id],'distance',distance)
						//console.log(this.calcCoversInfos[id])
						this.$set(this,'covers',covers)
						this.markerId = id;
						this.showUserId =2
					}
				}else{
					// 再次点击同一点，取消选择
					this.$set(this,'covers',covers)
					this.markerId = null;
				}
				//清空
				this.searchId=''
			},
			//获取用户组织结构
			async getUserOrgs(ids){
				let _eplyoees = {}
				_eplyoees.employeeId = ids
				let _orgs=null
				await userInfo(_eplyoees).then(res=>{
					_orgs = res.orgs
				}).catch(e=>{
					_orgs==null
				})
				if(_orgs==null){
					return ''
				}else{
					let _orgHtml = ''
					for(let i=0; i<_orgs.length; i++){
						_orgHtml+=_orgs[i].orgName+'、'
					}
					_orgHtml = _orgHtml.substring(0,_orgHtml.length-1)
					return _orgHtml
				}
			},
			//获取消息通知配置
			async getMesSys(){
				let _ars={}
				_ars.cfgCode = 'SYS.NOTICE.SHOW'
				let _infos = await sysCfg(_ars)
				if(_infos!==null){
					if(_infos.cfgValue==0){
						this.noticeSys = false
					}else if(_infos.cfgValue==1){
						this.noticeSys = true
						//查询最新一条消息数据 noticeText
						await this.getMessage()
					}
				}
			},
			//查询最新一条消息数据
			async getMessage(){
				let _ars ={}
				_ars.pageIndex = 1
				_ars.pageSize = 1
				let _list = await noticeList(_ars)
				if(_list.data!==null){
					let _datas = _list.data[0]
					this.noticeText = _datas.notice_text
					//判断是否有图片
					let _isnew = (_datas.notice_title).indexOf('isNew')
					if(_isnew>0){
						let _imgsHtml=''
						let _imgData = JSON.parse(_datas.notice_title)
						let _imgs = _imgData.imglist.split(',')
						this.noticeImg = _imgs
					}
				}
			},
			//跳转到用户界面
			goUser(){
				//清理定时任务
				this.clearIntervals()
				uni.navigateTo({
					url:'/pages/task/user'
				})
			},
			//跳转到点位统计页面
			goDot(){
				//清理定时任务
				this.clearIntervals()
				uni.navigateTo({
					url:'/pages/task/dot'
				})
			},
			//跳转到聊天
			toMessage(){
				//清理定时任务
				this.clearIntervals()
				uni.navigateTo({
					url:'/pages/task/messageList'
				})
			},
			//信号管理
			toSignal(){
				//清理定时任务
				this.clearIntervals()
				uni.navigateTo({
					url:'/pages/task/chat-signal'
				})
			},
			//新增
			toAddDot(){
				uni.navigateTo({
					url:'/pages/task/addDot'
				})
			},
			//跳转到点位上报
			toReport(ids){
				let _ids =ids.pointId || 0
				//设置距离
				let _distance = this.distanceNumber(ids.mapJson)
				if(_distance>10000){
					uni.showToast({
					    title: '不在点位巡查范围（10Km），无法巡查上报!',
					    icon: 'none',
					    duration: 1500,
					})
					return false
				}
				//清理定时任务
				this.clearIntervals()
				uni.navigateTo({
				    url: '/pages/task/report?ids='+_ids+'&distance='+_distance,
				});
			},
			//点位长-点位处理
			todotReport(datas){
				let _names=datas.contactName
				let _ids=datas.pointId
				let _phones=datas.contactTel
				let _recordId=datas.lastRecordId
				//设置距离
				let _distance = this.distanceNumber(datas.mapJson)
				let _detail = JSON.stringify(datas)
				//清理定时任务
				this.clearIntervals()
				uni.navigateTo({
				    url: '/pages/task/dotReport?ids='+_ids+'&names='+_names+'&phones='+_phones+'&recordId='+_recordId+'&distance='+_distance+'&detail='+_detail,
				});
			},
			//设置距离-数字
			distanceNumber(keys){
			    if(this.latitude==''){
			        return ''
			    }
			    let _keys = keys
			    let a = _keys.latitude
			    let b = _keys.longitude
			    let distance = getDistance(a,b,this.latitude2,this.longitude2)
			    return distance
			},
			//跳转到点位详情
			toReportDetail(ids){
				//设置距离
				let _distance = this.distanceNumber(ids.mapJson)
				let _ids =ids.pointId || 0
				//清理定时任务
				this.clearIntervals()
				uni.navigateTo({
				    url: '/pages/task/reportDetail?ids='+_ids+'&distance='+_distance,
				});
			},
			toReportDetail2(ids,jsons){
				//设置距离
				let _ids =ids.pointId || 0
				let _distance = this.distanceNumber(jsons)
				//清理定时任务
				this.clearIntervals()
				uni.navigateTo({
				    url: '/pages/task/reportDetail?ids='+ids+'&distance='+_distance,
				});
			},
			//地图搜索
			toSearchMap(){
				//清理定时任务
				this.clearIntervals()
				let _keys = this.tabIndex
				let _names = this.searchDot
				if(_keys>1){
					_keys = -1
				}
				if(_names=='搜索点位'){
					_names=''
				}
				uni.navigateTo({
				    url: '/pages/map/mapSearch?keys='+_keys+'&names='+_names,
				});
			},
			clearSearch(){
				this.searchDot='搜索点位'
			},
			//导航
			toshape(datas){
				wx.openLocation({
					latitude: parseFloat(datas.dimension),
					longitude: parseFloat(datas.longitude),
					name: datas.pointName,
					address: datas.pointAddress
				})
			},
			//关闭通知
			closeNotice(){
				this.showNotice=false
			},
			//显示通知
			toNice(){
				uni.navigateTo({
				    url: '/pages/task/userMessage'
				});
			},
			setUrl(url){
			    return addAvatarPrefix(url)
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
		}
	}
</script>

<style lang="scss">
	.nav-bar-leftbtn{
		display: flex;
		align-items: center;
		justify-content: center;
		width:68rpx;
		height:68rpx;
		margin-left: 6px;
		background:rgba(255,255,255,0.6);
		border-radius:50%;
		border:1px solid rgba(0,0,0,0.08);
	}	
	.nav-bar-leftbtn image{
		width:56rpx;
		height:56rpx;
	}
	.page-map{
		height: 100vh;
		&-instance{
			position: relative;
			margin-top: 208rpx;
		}
		&-top-circle{
			display: none;
			position: absolute;
			left: 0;
			top: 0;
			right: 0;
			height: 32rpx;
			background:rgba(255,255,255,1);
			border-radius:0px 0px 32rpx 32rpx;
		}
		&-patrol-tips{
			position: absolute;
			left: 32rpx;
			top: 56rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 30rpx;
			width:686rpx;
			height:116rpx;
			background:linear-gradient(135deg,rgba(232,106,106,1) 0%,rgba(248,181,61,1) 100%);
			border-radius:96rpx;
			box-sizing: border-box;
			.left{
				display: flex;
				align-items: center;
				font-size:38rpx;
				color: #fff;
				.icon{
					display: block;
					width:64rpx;
					height:64rpx;
					margin-right: 22rpx;
				}
			}
			.btn{
				width:96rpx;
				height:48rpx;
				border-radius:36rpx;
				opacity:0.6;
				line-height: 48rpx;
				text-align: center;
				border:2rpx solid rgba(255,255,255,1);
				font-size:24rpx;
				color: #fff;
			}
		}
		&-point{
			pointer-events: all;
			display: flex;
			justify-content: center;
			align-items: center;
			width:88rpx;
			height:88rpx;
			background:rgba(255,255,255,1);
			border-radius:50%;
			margin: 0 0 44rpx 32rpx;
			&-icon{
				display: block;
				width:48rpx;
				height:48rpx;
			}
		}
		
		&-tab{
			width:750rpx;
			height:80rpx;
			background:rgba(255,255,255,1);
			padding-top: 8rpx;
			box-sizing: border-box;
			&-container{
				display: flex;
				justify-content: center;
				align-items: center;
				width:686rpx;
				height:72rpx;
				background:rgba(237,240,242,1);
				border-radius:36rpx;
				margin: 0 auto;
			}
			&-item{
				display: flex;
				flex: 1;
				height:100%;
				justify-content: center;
				align-items: center;
				font-size:28rpx;
				&.is-active{
					color: #fff;
					background:rgba(0,145,255,1);
					border-radius:36px;
				}
			}
			&content{
				position: absolute;
				left: 0;
				right: 0;
				bottom: calc(var(--window-bottom) + 40rpx);
				pointer-events: none;
				z-index: 99;
				&-item{
					pointer-events: all;
					
				}
			}
		}
	}
	.charts {
		position: relative;
		top: -10rpx;
		width: 248rpx;
		height: 248rpx;
		background-color: #FFFFFF;
		&-label{
			display: flex;
			flex-wrap: wrap;
			width: 100%;
			height: 228rpx;
			align-items: center;
			&-point{
				margin-right: 16rpx;
				width:18rpx;
				height:18rpx;
				background:rgba(0,145,255,0.4);
				border-radius:50%;
				// border:2rpx solid rgba(0,145,255,1);
			}
			&-item{
				width: 33%;
				height: 114rpx;
				box-sizing: border-box;
				padding-top: 6rpx;
				&content{
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;
				}
				.name{
					font-size: 20rpx;
					color: rgba(22, 31, 61, 0.8);
					line-height: 1;
				}
				.num{
					display: block;
					text-align: center;
					font-size: 46rpx;
					font-weight:500;
					color: #161F3D;
					line-height: 1.5;
				}
			}
		}
	}
	.partrol-tools{
		display: flex;
		width:686rpx;
		height:128rpx;
		margin: 0 auto;
		background:rgba(255,255,255,1);
		border-radius:16rpx;
		&-item{
			position: relative;
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			.icon{
				display: block;
				width:64rpx;
				height:64rpx;
			}
			.text{
				font-size:20rpx;
				color: #161F3D;
			}
			.red-text{
				font-size:20rpx;
				color: #E64D4D;
			}
		}
		&-message{
			position: relative;
			top: -30rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			width:140rpx;
			height:140rpx;
			background:rgba(0,145,255,1);
			border-radius:50%;
			border: 10rpx solid #fff;
			.icon{
				display: block;
				width:80rpx;
				height:80rpx;
			}
			.text{
				display: block;
				color: #fff;
				font-size: 20rpx;
			}
		}
		&-badge{
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			left: 50%;
			top: 0;
			width:42rpx;
			height:42rpx;
			background:rgba(230,77,77,1);
			border-radius:30rpx;
			border:4rpx solid rgba(255,255,255,1);
			font-size:28rpx;
			color: #fff;
			line-height: 1;
		}
	}
</style>