<template>
	<view class="content dotBg">
		<view class='dot-top report-top addDotBox'>
		    <view class='report-left'>
		        <view class='imgBox' v-if='details.watchStatus==2&&details.watchResult==3&&details.fixStatus==2'>
		            <image :src='setImgs(details)' class='img'></image>
		        </view>
		        <view class='imgBox orangeBg' v-if='details.watchStatus==2&&details.watchResult==3&&details.fixStatus==3'>
		            <image :src='setImgs(details)' class='img'></image>
		        </view>
		        <view class='imgBox blueBg' v-if='details.watchStatus==1'>
		            <image :src='setImgs(details)' class='img'></image>
		        </view>
		        <view class='imgBox greenBg' v-if='details.watchStatus==2&&details.watchResult==1||details.watchResult==2'>
		            <image :src='setImgs(details)' class='img'></image>
		        </view>
		        <view class='imgBox yellowBg' v-if='details.fixStatus==4'>
		            <image :src='setImgs(details)' class='img'></image>
		        </view>
		    </view>
            <view class='report-right'>
                <text class='title'>点位类型</text>
                <view class='flex'>
					<picker @change="bindPickerChange" :value="chooseVal" :range="array" style="width: 100%;">
						<view class="uni-input">{{array[chooseVal]}}</view>
					</picker>
                </view>
            </view>
			<view class='report-icon'>
				<image src='/static/images/arrow.png' class='img'></image>
			</view>
		</view>
		<view class='dot-top report-top addDotBox'>
		    <view class='report-left'>
		       <text class='text'>点位名称</text>
		    </view>
		    <view class='report-right'>
		        <input class='addDot-input' v-model="dotName" />
		    </view>
			<view class='report-icon'>
				<image src='/static/images/arrow.png' class='img'></image>
			</view>
		</view>
		<view class='dot-top report-top addDotBox' @click="chooseAddress">
		    <view class='report-left'>
		       <text class='text'>点位地址</text>
		    </view>
		    <view class='report-right'>
		        <view class='flex'>
		            <text class='status'>{{address}}</text>
		        </view>
		    </view>
			<view class='report-icon'>
				<image src='/static/images/arrow.png' class='img'></image>
			</view>
		</view>
		<view class='dot-top report-top addDotBox' style="margin-top: 32rpx;">
		    <view class='report-left'>
		       <text class='text'>所属街道</text>
		    </view>
		    <view class='report-right'>
				<text class='status' style="display: block;">{{Street}}</text>
		    </view>
		</view>
        <view class='dot-contBox addDot-Btn'>
            <view class='subBtn' @click="subDot">
                <text class='text'>提 交</text>
            </view>
        </view>
    </view>
</template>

<script>
    import {mapState} from 'vuex'
    import {dotSubmitRandom,getManrandom,dotDetail,dotEdit} from '@/api/user.js'
    import {apiUrl} from '@/config/index.js'
    import {addAvatarPrefix} from '@/common/lib/utils.js'
    import QQMapWX from '@/common/lib/qqmap-wx-jssdk.min.js'
    import areaIcon from '@/mock/areaIcon.js'
    import {iconUrl} from '@/config/index.js'
	export default {
		data() {
			return {
				title: 'Hello',
				dotName: '',
                longitude: '',//经度
                latitude: '', //维度
                qqmapsdk: null,
                address: '',
				array: ['小区','背街小巷'],
				chooseVal: 0,
				roleName: '',
				rolePhone: '',
				roleId:'',
				Street:'',
				details: {},
				isLoadding: false,
			}
		},
        computed:{
            ...mapState({
                employee:state=>state.user.employee,
            })
        },
		onLoad(options) {
            this.ids = options.ids
            let _qqmapsdk = new QQMapWX({
                key: 'VGNBZ-YUX66-E4KSV-M43JP-PTXQF-MYB2O'
            }); 
            this.qqmapsdk = _qqmapsdk
        },
        onReady(){
            //详情
            let _that = this
            let _ars={}
            _ars.pointId = this.ids
            dotDetail(_ars).then(res=>{
                if(res!==null){
					_that.details = res 
					_that.dotName = res.pointName
					_that.longitude = res.longitude
					_that.latitude = res.dimension
					_that.address = res.pointAddress
					_that.Street = res.ascription
					_that.roleName = res.contactName
					_that.rolePhone = res.contactTel
					if(res.pointType==36){
						_that.chooseVal = 0
					}else{
						_that.chooseVal = 1
					}
                }
            }).catch(error=>{
                uni.showToast({
                   title: errorN.msg,
                   icon: 'none',
                   duration: 1000
                }); 
            })
        },
		methods: {
			//设置图标
			setImgs(item){
			    let pointType = parseInt(this.chooseVal);
			    if(pointType==0){
			    	pointType = 36
			    }else{
			    	pointType = 37
			    }
			    let icon = areaIcon[pointType].prefix
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
			//获取随机人员
			getMan(){
				let _ars={}
				_ars.roleCode='dotRole'
				_ars.lat = this.latitude
				_ars.lng = this.longitude
				let _that = this
				getManrandom(_ars).then(res=>{
					if(res.data!==null||res.data.length!==0){
						let _k = _that.randomNum(0,res.data.length-1)
						_that.roleName = res.data[_k].employee_name
						_that.roleId = res.data[_k].employee_id
						_that.rolePhone = res.data[_k].employee_phone
					}
				}).catch(err=>{})
			},
			//范围内随机数
			randomNum(minNum,maxNum){ 
			    switch(arguments.length){ 
			        case 1: 
			            return parseInt(Math.random()*minNum+1,10); 
			        break; 
			        case 2: 
			            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
			        break; 
			            default: 
			                return 0; 
			            break; 
			    } 
			},
			bindPickerChange: function(e) {
				this.chooseVal = e.target.value
			},
            callPhone(phones){
                uni.makePhoneCall({
                	phoneNumber: phones,
                })
            },
			chooseAddress(){
				let _this = this
				uni.chooseLocation({
				    success: function (res) {
						_this.latitude = res.latitude
						_this.longitude = res.longitude
						_this.address= res.address
						//更新所属街道
						_this.qqmapsdk.reverseGeocoder({
						    location: {
						        latitude:res.latitude,
						        longitude: res.longitude,
						    },
						    success(res){
								_this.Street = res.result.address_reference.town.title
						    },
						    fail(err){
						        console.log(err)
						    }
						})
				    }
				})
			},
            subDot(){
                let _ars=this.details
				_ars.ascription = this.Street
				_ars.dimension = (parseFloat(this.latitude)).toFixed(6)
				_ars.longitude = (parseFloat(this.longitude)).toFixed(6)
				_ars.employeeId = this.employee.id
				_ars.managerId = this.roleId
				_ars.pointAddress = this.address
				if(this.chooseVal==0){
					//小区
					_ars.pointType = 36
				}else{
					//背街小巷
					_ars.pointType = 37
				}
				_ars.pointName = this.dotName
				//_ars.contactName = this.roleName
				//_ars.contactTel = this.rolePhone
				
				if(this.dotName==''){
					uni.showToast({
						title: '请输入点位名称！',
						icon: 'none',
						duration: 1000
					})
					return false
				}
				if(this.address==''){
					uni.showToast({
						title: '请输入地址！',
						icon: 'none',
						duration: 1000
					})
					return false
				}
				
				let _isLoadding = this.isLoadding
				if(!_isLoadding){
					let _that = this
					_that.isLoadding = true
					uni.showLoading({
					    title: '提交中..'  
					});
					
					dotEdit(_ars).then(res=>{
						uni.hideLoading();
						uni.showToast({
							title: '修改成功!',
							icon: 'none',
							duration: 1000
						})
						_that.isLoadding = false
						uni.navigateBack()
					}).catch(err=>{
						uni.hideLoading();
						_that.isLoadding = false
						uni.showToast({
							title: '修改失败!',
							icon: 'none',
							duration: 1000
						})
					})
				}else{
					console.log('别点了，无效')
				}
            }
		}
	}
</script>
