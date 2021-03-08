<template>
    <view style='height: 100%;'>
        <map style="width: 100%; height: 100%;" :latitude="latitude" :longitude="longitude" :markers="covers"></map>
    </view>
</template>

<script>
    export default {
        name: 'mapshow',
    	data() {
    		return {
    			title: '',
                latitude: '',
                longitude: '',
                covers: [
                      {
                        latitude: '',//纬度，范围为-90~90，负数表示南纬
                        longitude: '',//经度，范围为-180~180，负数表示西经
                      },
                ]
    		}
    	},
        onLoad(ops){
            this.latitude = ops.keys1
            this.longitude = ops.keys2
            this.covers[0].latitude = ops.keys1
            this.covers[0].longitude = ops.keys2
            //console.log(this.covers)
        },
        onReady(){
            wx.setNavigationBarTitle({
              title: "位置"
            })
        },
    	methods: {
           
    	}
    }
</script>

