<template>
    <view class="content">
        信号管理 Lists
    </view>
</template>

<script>
    import {mapState} from 'vuex'
    import {addAvatarPrefix} from '@/common/lib/utils.js'
    import {myDot,unBindEmployees,noticeList} from '@/api/user.js'
	export default {
		data() {
			return {
				title: 'Hello',
                number: 0,
                noticeNum: 0,
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
                    this.mydotfun()
                },
                immediate: true
            },
        },
        onReady(){
            wx.setNavigationBarTitle({
              title: "信号管理"
            })
        },
		methods: {
            
		}
	}
</script>

