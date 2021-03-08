<template>
    <view class="content">
        <view class='user-top'>
			<view class='left'>
				<text class='name'>{{employee.name}}</text>
				<text class='nameTip'>{{roles}}</text>
				<text class='phone'>{{employee.phone}}</text>
			</view>
            <view class='user-imgBox'>
                <view class='user-imgBox2'>
                    <image class='img' :src='setUrl(employee.avatar)'></image>
                </view>
            </view>
        </view>
        <view class='user-list'>
            <view class='user-li flex' @click="todot" v-if="rolesCode!=='dotRole'&&rolesCode!=='dotGrid'">
                <view class='user-icon'>
                    <image class='img' src='/static/images/task.png'></image>
                </view>
                <text class='name'>点位巡查记录</text>
                <text class='num'>{{fixCount}}条</text>
                <view class='right-arrow'>
                    <image src='/static/images/arrow.png' class='img'></image>
                </view>
            </view>
			<view class='user-li flex' v-if="rolesCode=='dotRole'">
			    <view class='user-icon'>
			        <image class='img' src='/static/images/task.png'></image>
			    </view>
			    <text class='name'>点位处理记录</text>
			    <text class='num'>{{roundFixCount}}条</text>
			    <view class='right-arrow'>
			        <image src='/static/images/arrow.png' class='img'></image>
			    </view>
			</view>
			<view class='user-li flex' v-if="ischoose&&rolesCode!=='dotRole'&&rolesCode!=='dotGrid'" @click="todotRandom">
			    <view class='user-icon'>
			        <image class='img' src='/static/images/icon-choose.png'></image>
			    </view>
			    <text class='name'>随机点位巡查记录</text>
			    <text class='num'>{{roundCount}}条</text>
			    <view class='right-arrow'>
			        <image src='/static/images/arrow.png' class='img'></image>
			    </view>
			</view>
            <view class='user-li flex' @click="toClick">
                <view class='user-icon'>
                    <image class='img' src='/static/images/mess.png'></image>
                </view>
                <text class='name'>通知消息</text>
                <text class='num'>{{noticeCount}}条</text>
                <view class='right-arrow'>
                    <image src='/static/images/arrow.png' class='img'></image>
                </view>
            </view>
        </view>
        <view class='userBtn' @click="editUser">
            <text class='title'>退出账号</text>
        </view>
        <uni-popup ref="popup" type="bottom">
        	<view class='uniModal'>
        		<view class='uniModal-title'>
        			<text>参考欢迎语</text>
        		</view>
        		<view class='uniModal-li' v-for="(item,index) in datas" :key='index' @click="clickLi(index)">
        			<text>{{item.name}}</text>
        		</view>
        		<view class='uniModal-button' @click="hideModal">
        			<text>取消</text>
        		</view>
        	</view>
        </uni-popup>
        <uni-popup ref="popup" type="bottom">
            <view class='alertBox'>
                <view class='alert-top'>
                    <text class='title'>退出账号</text>
                    <text class='content'>确认要退出当前账号吗？</text>
                </view>
                <view class='alert-bottom flex'>
                    <view class='alert-b-left' @click="sure">
                        <text class='text'>退出账号</text>
                    </view>
                    <view class='alert-b-right' @click="cancel">
                        <text class='text'>取消</text>
                    </view>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script>
    import {mapState} from 'vuex'
    import uniPopup from "@/components/uni-popup/uni-popup.vue"
    import {addAvatarPrefix} from '@/common/lib/utils.js'
    import {unBindEmployees,userStic} from '@/api/user.js'
	export default {
        name: 'userInfo',
        components: {uniPopup},
		data() {
			return {
				title: 'Hello',
				noticeCount:'0', //通知消息数
                checkCount: 0, //巡查点位数
                fixCount: 0, //点位处理数
				roundCount: 0, //随机处理条数
				roundFixCount: 0, //点位处理记录
				ischoose: 'false',
			}
		},
        computed:{
            ...mapState({
                wxId:state=>state.user.wxId,
				roles: state=>state.user.roles,
				rolesCode: state=>state.user.rolesCode,
				employee:state=>state.user.employee,
            })
        },
        /*监听*/
        watch:{
            employee:{
                handler:function(datas){
                    this.mydotfun()
					//判断是否有随机
					let _fla = false
					if(this.rolesCode=='dotPatrolHas'){
						_fla = true
						if(_fla==true){
							this.ischoose = true
						}
					}
                },
                immediate: true
            },
        },
		methods: {
            todot(){
                uni.navigateTo({
                    url: '/pages/task/dot?keys=0',
                });
            },
			todotRandom(){
			    uni.navigateTo({
			        url: '/pages/task/dotRandom?keys=0',
			    });
			},
            mydotfun(){
				let _ars={}
				_ars.employeeId = this.employee.id
				let _that = this
                userStic(_ars).then(res=>{
					_that.noticeCount = res.noticeCount
					_that.checkCount = res.normalCheckCount
					_that.fixCount = res.normalFixCount
					_that.roundCount = res.roundCheckCount
					_that.roundFixCount = res.roundFixCount
				}).catch(err=>{})
            },
            toClick(){
                uni.navigateTo({
                    url: '/pages/task/userMessage',
                    success: res => {},
                    fail: () => {},
                    complete: () => {}
                });
            },
            setUrl(url){
                if(url==null||url==''){
                    return '/static/images/head.png'
                }else{
                    return addAvatarPrefix(url)
                }
            },
            editUser(){
                this.$refs.popup.open()
            },
            sure(){
                let _ars = {}
                _ars.employeeId = this.employee.id
                _ars.wxId = this.wxId
                unBindEmployees(_ars).then(res=>{
                    //更新员工信息
                    let _ars={}
                    this.$store.commit('SET_LOGIN','false')
                    this.$store.commit('SET_EMPLOYEES', _ars)
					this.$store.state.user.ws.closeSocket()
					this.$store.commit('SET_WS',null)
					//关闭所有页面
					uni.reLaunch({
					    url: '/pages/login/login',
					});
                }).catch((error)=>{
                    uni.showToast({
                        title: error.msg,
                        icon: 'none',
                        duration: 2000
                    });
                })
                this.$refs.popup.close()
            },
            cancel(){
                this.$refs.popup.close()
            }
		}
	}
</script>

