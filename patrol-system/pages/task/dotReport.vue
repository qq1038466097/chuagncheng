<template>
	<view class="content dotBg">
		<view class='dot-top report-top report-top2' style="border-bottom: 1px solid #eee;">
		    <view class='report-left'>
		        <view class='imgBox' v-if='details.watchStatus==2&&details.watchResult==3&&details.fixStatus==2'>
		            <image :src='setImgs(details)' class='img'></image>
		        </view>
		        <view class='imgBox orangeBg' v-if='details.fixStatus==3'>
		            <image :src='setImgs(details)' class='img'></image>
		        </view>
		        <view class='imgBox blueBg' v-if='details.watchStatus==1'>
		            <image :src='setImgs(details)' class='img'></image>
		        </view>
				<view class='imgBox yellowBg' v-if='details.fixStatus==4'>
				    <image :src='setImgs(details)' class='img'></image>
				</view>
		        <view class='imgBox greenBg' v-if='details.watchStatus==2&&(details.watchResult==1||details.watchResult==2)&&parseInt(details.fixStatus)!==3'>
		            <image :src='setImgs(details)' class='img'></image>
		        </view>
		    </view>
		    <view class='report-right'>
		        <text class='title' v-if='details.roundPoint==0'>{{details.pointName}}</text>
		        <text class='title' v-if='details.roundPoint==1'>{{details.pointName}}(随机点位)</text>
		        <view class='flex'>
		            <text class='time'>{{details.pointAddress||''}}</text>
		        </view>
		    </view>
		</view>
        <view class='dot-contBox'>
            <view v-for="(item,i) in rules" :key='i'>
                <view v-for='(item2,k) in hasRules' :key='k'>
                    <view class='report-showcont' v-if='item2.itemId===item.itemId'>
                        <view class='flex'>
                            <text class='text'>{{item.itemOrder}}.{{item.itemText}}</text>
                            <view class='tips' @click="showTips(i)">
                                <image class='img' src='/static/images/icon-tips.png'></image>
                            </view>
                        </view>
                        <view>
                            <text class='title green' v-if='parseInt(item2.checkOption)==1'>优秀</text>
                            <text class='title green' v-if='parseInt(item2.checkOption)=="2"'>合格</text>
                            <text class='title red' v-if='parseInt(item2.checkOption)=="3"'>不合格</text>
                        </view>
                        <view class='uploadUl' v-if='item2.enclosure.length!==0'>
                            <view class='imgBox'>
                                <image v-for='(item3,y) in item2.enclosure' :key='y' class="img" :src='item3' style='width: 128rpx; height: 128rpx;' lazy-load @click="handlePreviewImage(item3)"></image>
                            </view>
                        </view>
                    </view>
					<view v-if='item2.fixResult!==null&&parseInt(item2.checkOption)==3&&item2.itemId===item.itemId'>
						<view class='report-showcont reportLine'>
						    <view class="imgshows">
						        <text class="left">处理结果</text>
						        <text class="right" v-if="item2.fixResult==1">已处理</text>
								<text class="right" v-if="item2.fixResult==2">无法处理-上报系统</text>
						    </view>
							<view class='uploadUl'>
								<view class='inlineblock'>
									<view class="imgs" v-for="(item4,t) in JSON.parse(item2.fixEnclosure)" :key='t'>
										<view class='imgBox'>
											<image class="img" :src='setUrl(item4)' mode="" @click="handlePreviewImage(item4)"></image>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view v-if='item2.fixResult==null&&item2.itemId===item.itemId&&parseInt(item2.checkOption)=="3"'>
						<view class='report-showcont reportLine'>
							<text class='imgshows'>处理结果</text>
							<view class='uploadUl'>
								<view v-for="(item4,s) in proList" :key='s' class='inlineblock'>
									<view v-if='item4.itemId==item2.itemId' class='inlineblock'>
										<view class="imgs" v-for="(item5,t) in proList[s].fixEnclosure" :key='t'>
										    <view class='cancleBox' @click="delimgs(s,t)">
										        <image class="img" src='/static/images/cancle.png' mode=""></image>
										    </view>
										    <view class='imgBox'>
										        <image class="img" :src='setUrl(item5)' mode=""></image>
										    </view>
										</view>
									</view>
								</view>
								<view class="upload" @tap="upload(i,item2)">
									<image class="img" src="/static/images/add.png" mode=""></image>
								</view>
							</view>
						</view>
						<view class='report-showcont reportLine flex'>
							<text class='imgshows'>无法处理，需要上报</text>
							<switch @change="switchChange" :id="item2.id" color="#0091FF" style="transform:scale(0.8);" />
						</view>
					</view>
                </view>
            </view>
            <view class='report-showcont' style="margin-bottom: 40rpx;">
                <text class='text'>巡查反馈</text>
                <text class='text' style="display: block; text-align: left; color: rgba(22, 31, 61, 0.5);">{{historydetail.feedback}}</text>
            </view>
            
            <view class='subBtn' @click="subDot" v-if="isSubmit==true&&proList.length!==0">
                <text class='text'>提 交</text>
            </view>
			
			<view class='subBtnGray' v-if="isSubmit==true&&proList.length==0">
			    <text class='text'>提 交</text>
			</view>
			
			<view class='subBtnGray' v-if="isSubmit==false">
			    <text class='text'>提 交</text>
				<text class='num'>(距离点位{{newDistance}})</text>
			</view>
        </view>
        
    </view>
</template>


<script>
    import {mapState} from 'vuex'
    import {dotRule,dotDetail,dotHistoryDetail,dotReports} from '@/api/user.js'
    import {addAvatarPrefix,isSystem} from '@/common/lib/utils.js'
	import areaIcon from '@/mock/areaIcon.js'
	import {iconUrl,apiUrl} from '@/config/index.js'
	export default {
		data() {
			return {
				title: '',
                ids: '',
                recordId:'',
                historydetail: {},
                rules: [],
                hasRules: [], //已巡查的记录
                ruleId: '',
                names:'',
                phones: '',
				distance: "",
				isSubmit: false,
				newDistance: '',
				details:{},
				proList: [],
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
            this.recordId = options.recordId
            this.names = options.names
            this.phones = options.phones
			let _distance = options.distance
			this.distance = _distance
            //判断距离范围
			let _isFla = isSystem(_distance)
			this.isSubmit = _isFla
			//转换成m，km
			let _distance2 = _distance
			if(_distance2>1000){
			    _distance2=(_distance2/1000).toFixed(2)+'km'
			}else{
			   _distance2=_distance2+'m' 
			}
			this.newDistance =_distance2
			//设置详情
			let _detail = options.detail
			this.details = JSON.parse(_detail)
        },
        onReady(){
            let _that = this
            //历史详情
            let _ars2={}
            _ars2.recordId = this.recordId
            dotHistoryDetail(_ars2).then(res=>{
                if(res!==null){
                    _that.historydetail = res
                    if(res.checkRecordItems!==null){
                        //_that.hasRules = res.checkRecordItems
                        let _datas = res.checkRecordItems
                        for(let i=0; i<_datas.length; i++){
                            if(_datas[i].enclosure!==''||_datas[i].enclosure!==null){
                                let _k = _datas[i].enclosure.split(',')
                                //去掉第一个空字符串
								//去掉第一个空字符串
								if(_k[0]==''){
									let _new = _k.shift()
								}
								//判断
								for(let j=0; j<_k.length; j++){
									if(_k[j].indexOf('https')>0){
										
									}else{
										_k[j] = _that.setUrl(_k[j])
									}
								}
                                _datas[i].enclosure = _k
                            }else{
                                _datas[i].enclosure=[]
                            }
                        }
                        _that.hasRules = _datas
                    }
                }
            }).catch(error=>{})  
            
            //规则
            let _ars={}
            _ars.pointId = this.ids
            dotRule(_ars).then(res=>{
                if(res!==null){
                    let _rules = res[0].checkRuleItems
                    let _rules2 =[]
                    for(let i=0; i<_rules.length; i++){
                        _rules[i].imgs=[]
                        _rules[i].selected=-1
                        _rules2.push(_rules[i])
                    }
                    _that.rules = _rules2
                    _that.ruleId = res[0].id
                }
            }).catch(error=>{})
        },
		methods: {
			delimgs(i,k){
			    let _datas = this.proList[i].fixEnclosure;
			    _datas.splice(k,1)
				this.proList[i].fixEnclosure = _datas
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
			switchChange: function (e) {
				let _pro = this.proList
				let _fla=false
				let _k=null
				let _result=null
				let _ids = e.target.id
				for(let i=0; i<_pro.length; i++){
					if(_ids == _pro[i].id){
						_fla=true
						_k=i
						if(e.target.value==true){
							_result = 2
						}else{
							_result = 1
						}
						break;
					}
				}
				if(_fla==true){
					_pro[_k].fixResult = _result
				}else{
					//新增
					let _hasrule = this.hasRules
					for(let i=0; i<_hasrule.length; i++){
						if(_hasrule[i].id == _ids){
							let _ar={}
							_ar.id = _hasrule[i].id
							_ar.recordId = _hasrule[i].recordId
							_ar.itemId = _hasrule[i].itemId
							_ar.fixEmployeeId = this.employee.id
							_ar.fixEnclosure = []
							_ar.fixResult = 2
							_pro.push(_ar)
							break;
						}
					}
				}
				this.proList = _pro
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
            toHistory(ids){
               uni.navigateTo({
                   url: '/pages/task/history?ids='+ids,
               }); 
            },
            callPhone(phones){
                uni.makePhoneCall({
                	phoneNumber: phones,
                })
            },
            setUrl(urls){
                return addAvatarPrefix(urls)
            },
            showTips(k){
                uni.showModal({
                    title: '检查标准',
                    content: this.rules[k].itemText,
                    showCancel: false,
                    confirmText: '知道了',
                    confirmColor: '#666',
                    success: function (res) {
                        if (res.confirm) {
                            console.log('用户点击确定');
                        } else if (res.cancel) {
                            console.log('用户点击取消');
                        }
                    }
                })
            },
			//去掉图片的前缀
			replaceImg(imgs){
				let _shows = imgs
				let _shows2=[]
				for(let i=0; i<_shows.length; i++){
					let _length = _shows[i].indexOf('/watchman_data/') + 14
					_shows[i] = _shows[i].substring(_length)
					_shows2.push(_shows[i])
				}
				return _shows2
			},
            subDot(){
				let _pro=JSON.parse(JSON.stringify(this.proList))
				let _ars=[]
				let _fla=false
				for(let i=0; i<_pro.length; i++){
					let _ar={}
					let _string = _pro[i].fixEnclosure
					_string = this.replaceImg(_string)
					_ar.id = _pro[i].id
					_ar.recordId = _pro[i].recordId
					_ar.fixEmployeeId = _pro[i].fixEmployeeId
					_ar.fixResult = _pro[i].fixResult
					_ar.fixEnclosure = JSON.stringify(_string)
					_ars.push(_ar)
				}
				
				let _isLoadding = this.isLoadding
				if(!_isLoadding){
					let _that = this
					_that.isLoadding = true
					uni.showLoading({
					    title: '提交中..'  
					});
					dotReports(_ars).then(res=>{
						let _fla = false
						let _code=''
						for(let i=0; i<res.length; i++){
							if(res[i].gridId!==null){
								_fla=true
								_code = res[i].gridId
							}
						}
						if(_fla==true){
							uni.hideLoading();  
							uni.showToast({
								title: '问题上报成功，单号：'+_code,
								icon: 'none',
								duration: 1500
							})
							setTimeout(()=>{
								_that.isLoadding = false
								uni.navigateBack();
							},1000)
						}else{
							uni.hideLoading();  
							uni.showToast({
								title: '处理成功!',
								icon: 'none',
								duration: 1000
							})
							setTimeout(()=>{
								_that.isLoadding = false
								uni.navigateBack();
							},1000)
						}
					}).catch(error=>{
						uni.hideLoading(); 
						_that.isLoadding = false
						uni.showToast({
							title: '处理失败，'+error.msg,
							icon: 'none',
							duration: 1500
						})
					})
				}else{
					console.log('别点了，无效')
				}  
            },
			upload(k,ids){
			    let _that = this;
			    uni.chooseImage({
			        count: 1,
			        sizeType:['compressed'],
			        success(res) {
			            var imgFiles = res.tempFilePaths[0]
			    		let _url = apiUrl+'/upload/singleFile'
			            var uper = uni.uploadFile({
			                url: _url,
			                filePath: imgFiles,
			                name: 'file',
			                success(res1) {
			    				if(res1.statusCode==200){
			    					let _imgUrl = JSON.parse(res1.data).data
									let _imgUrl2 = _that.setUrl(_imgUrl)
									//图片显示
									let _pro = _that.proList
									let _fla = false
									let _k=null
									for(let i=0; i<_pro.length; i++){
										if(ids.itemId==_pro[i].itemId){
											_fla=true
											_k=i
											break;
										}
									}
									if(_fla==true){
										_pro[_k].fixEnclosure.push(_imgUrl2)
									}else{
										let _ar={}
										_ar.id = ids.id
										_ar.recordId = ids.recordId
										_ar.itemId = ids.itemId
										_ar.fixEmployeeId = _that.employee.id
										_ar.fixEnclosure = []
										_ar.fixEnclosure.push(_imgUrl2)
										_ar.fixResult = 1
										_pro.push(_ar)
									}
									_that.proList = _pro
			    				}
			    			}
			    		});
			        }
			    })
			},
		}
	}
</script>
