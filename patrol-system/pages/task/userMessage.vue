<template>
    <view class="content">
        <view class='mess-li' v-for="(item,i) in datas" :key='i'>
            <view class='mess-li-top flex'>
                <view class='mess-icon'>
                    <image class='img' src='/static/images/mess.png'></image>
                </view>
                <text class='name'>通知</text>
                <text class='time'>{{item.create_time}}</text>
            </view>
			<view class='noticeBox'>
				<view class='noticeLi' v-for="(item2,k) in item.imgList" :key='k'>
					<image class='img' mode="widthFix" lazy-load :src='setUrl(item2)' @click="handlePreviewImage(item2)"></image>
				</view>
			</view>
            <rich-text class='notice-text' type="text" :nodes="item.notice_text"></rich-text>
        </view>
        <view v-if="datas==null||datas.length==0">
            <text class='centertext'>暂无通知</text>
        </view>
        <view v-if="datas!==null&&datas.length>=10">
            <uni-load-more :status="status"  :content-text="contentText" color="#999"  />
        </view>
    </view>
</template>

<script>
    import {mapState} from 'vuex'
    import {noticeList,myDot} from '@/api/user.js'
    import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue'
	import graceRichText from "@/common/lib/rich.js"
	import {addAvatarPrefix} from '@/common/lib/utils.js'
	export default {
        components: {
            uniLoadMore
        },
		data() {
			return {
				title: 'Hello',
                datas: [],
                status: 'more',
                pageIndex:1,
                number: 10,
                isPull: 2,
                contentText: {
                    contentdown: '查看更多',
                    contentrefresh: '加载中...',
                    contentnomore: '没有更多'
                }
			}
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
                    this.mynotice()
                },
                immediate: true
            },
        },
        onShow(){
            wx.setNavigationBarTitle({
              title: "通知信息"
            })

        },
        // 上拉加载
        onReachBottom() {
            let _self = this
            if(_self.isPull==3){
                return false
            }
            this.pageIndex = this.pageIndex+1
            let _datas =[]
            let _ars = {}
            /*_ars.employeeId = this.employee.id
            _ars.pageIndex= this.pageIndex
            _ars.pageSize= this.number*/
            _self.status = 'loading'
            
            noticeList(_ars).then(res=>{
                if(res.data!==null){
                    let _datas2 = _self.datas.concat(res.data)
					for(let i=0; i<_datas2.length; i++){
						_datas2[i].notice_text = graceRichText.format(_datas2[i].notice_text)
						//判断是否有图片
						let _isnew = (_datas2[i].notice_title).indexOf('isNew')
						if(_isnew>0){
							let _imgsHtml=''
							let _imgData = JSON.parse(_datas2[i].notice_title)
							let _imgs = _imgData.imglist.split(',')
							_datas2[i].imgList = _imgs
						}
					}
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
		methods: {
            mynotice(){
                let _that = this
                let _ars = {}
                /*_ars.employeeId = this.employee.id
                _ars.pageIndex= this.pageIndex
                _ars.pageSize= this.number*/
                 
                //通知list
                noticeList(_ars).then(res=>{
					let _datas = res.data
					for(let i=0; i<_datas.length; i++){
						_datas[i].notice_text = graceRichText.format(_datas[i].notice_text)
						//判断是否有图片
						let _isnew = (_datas[i].notice_title).indexOf('isNew')
						if(_isnew>0){
							let _imgsHtml=''
							let _imgData = JSON.parse(_datas[i].notice_title)
							let _imgs = _imgData.imglist.split(',')
							_datas[i].imgList = _imgs
						}
					}
					//console.log(res.data)
                    _that.datas=res.data
                }).catch((error)=>{})
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

