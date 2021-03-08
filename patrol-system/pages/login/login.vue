<template>
	<view class="content whiteBg ">
		<uni-nav-bar
			:title="title"
			:fixed="false" 
			:status-bar="true"
			:shadow="false"
			:border="false"
		>
		    <view slot="left">
				<view class="nav-bar-leftbtn">
					<image src="" mode=""></image>
				</view>
			</view>
		</uni-nav-bar>
		
		<view class='login-top'>
            <image class='img' src="/static/images/loginBg.png"></image>
        </view>
        <view class='login-title'>
            <text class='title'>欢迎使用智慧创城巡访</text>
        </view>
        <view class='login-input'>
            <text class='inputText'>手机号</text>
            <input type="input" v-model="phone" class="input" placeholder="请输入手机号"/>
            <text class='inputText'>验证码</text>
            <input type="input" class="input" placeholder="请输入验证码" v-model="verification"/>
            <view class='position' @click="clickphone">
                <text class='text' v-if="shows==0">获取验证码</text>
                <text class='textgray' v-if="shows==1">重新获取({{number}})</text>
            </view>
        </view>
        <view class='loginBtn' v-if="isSub==true" @click="subLogin">
            <text class='title'>登 录</text>
        </view>
		
		<view class='subBtnGray subBtnGray2' v-if="isSub==false">
		    <text class='text'>登 录</text>
		</view>
    </view>
</template>

<script>
    import {mapState} from 'vuex'
    import uCharts from '@/components/u-charts/u-charts.js';
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue";
    import {canvasData} from '@/mock/canvasData.js';
    import {verifyPhone} from '@/common/lib/utils.js';
    import {sendBindCode,BindEmployees} from '@/api/user.js'
    var _self;
    var canvaRing=null;
	export default {
		components:{
			uniNavBar
		},
		data() {
			return {
				title: '智慧创城巡访',
                phone: '',
                shows: 0,
                number: 90,
                verification: '',
                employeeId: '',
                codeId: '',
				isLoadding: false,
				isSub: false,
			}
		},
        computed:{
            ...mapState({
            	wxId:state=>state.user.wxId,
				employee:state=>state.user.employee,
                userinfo:state=>state.user.userinfo
            })
			
        },
        /*监听*/
        watch:{
        	wxId:{
        		handler:function(datas){
        			//this.wxId = datas
        		},
        		immediate: true
        	},
			employee:{
        		handler:function(employee){
        			if(employee.id){
						/*uni.redirectTo({
						    url: '/pages/map/map',
						});*/
					}
        		},
        		immediate: true
        	},
			
        },
		methods: {
           clickphone(){
               let _fla = verifyPhone(this.phone)
               if(!_fla){
                    uni.showToast({
                       title: '手机号无效，请重新输入',
                       icon: 'none',
                       duration: 1000
                    });
               }else{
				    if(this.shows==1){
					   return false
				    }
                    //发送验证码
                    let _ars={}
                    _ars.phone = this.phone
                    let _that = this
				    console.log('666')
				   /*
				    uni.showToast({
				      title: '验证码已发送，请查收！',
				      icon: 'none',
				      duration: 1000
				    });*/
					_that.shows=1
					//验证
					let _setinterval
					_setinterval= setInterval(()=>{
					    _that.number=_that.number-1
					    if(_that.number<0){
					        clearInterval(_setinterval)
					        _setinterval=null
					        _that.shows=0
					        _that.number=10
					    }
					    //console.log(_that.number)
					},1000)
                    sendBindCode(_ars).then(resN=>{
                        if(resN!==null){
                           _that.codeId = resN.codeId
                           _that.employeeId = resN.employee.id
						   _that.isSub = true
                       }
                    }).catch(errorN=>{
						_that.isSub = false
                        uni.showToast({
                            title: errorN.msg,
                            icon: 'none',
                            duration: 2000
                        }); 
                    }) 
               }
            },
            subLogin(){
                if(this.phone==''){
					uni.showToast({
					   title: '手机号无效，请重新输入',
					   icon: 'none',
					   duration: 1000
					});
                    return false
                }
				if(this.verification==''){
					uni.showToast({
					   title: '请输入手机验证码',
					   icon: 'none',
					   duration: 1000
					});
				    return false
				}
                let _ars = {}
                _ars.phone = this.phone
                _ars.codeId = this.codeId
                _ars.code = this.verification
                _ars.wxId = this.wxId
                _ars.employeeId = this.employeeId
                if(JSON.stringify(this.userinfo)=='{}'){
                    _ars.avatar=null
                    _ars.nickName=null
                }else{
                    _ars.avatar=this.userinfo.avatarUrl
                    _ars.nickName=this.userinfo.nickName
                }
                //绑定员工
				let _that = this
				let _isLoadding = this.isLoadding
				if(!_isLoadding){
					_that.isLoadding = true
					uni.showLoading({
					    title: '提交中..'  
					});
					BindEmployees(_ars).then(res=>{
					    if(res!==null){
					        //更新员工信息
					        _that.$store.commit('SET_EMPLOYEES', res.employee)
					        /*uni.redirectTo({
					        	url : '/pages/map/map',
					        })*/
							_that.$store.dispatch('initUser')
							uni.redirectTo({
								url : '/pages/map/map',
							})
						}
					}).catch(error=>{
						uni.hideLoading();  
						_that.isLoadding = false
					    uni.showToast({
					        title: error.msg,
					        icon: 'none',
					        duration: 1000
					    });
					})
				}else{
					console.log('别点了，无效')
				}
                
            },     
		}
	}
</script>
