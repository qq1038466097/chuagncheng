
import $H from '@/common/lib/request.js';

// 获取我的巡查点位
// {"employeeId":"9527","pageIndex":1,"pageSize":50}
export const getMyCheckPoint=(data)=>{
	return $H.post('/checkpoint/myCheckPoint',data)
}
// 我的巡查点位统计
// {"employeeId":"9527"}
export const myCheckPointCount=(data)=>{
	return $H.post('/checkpoint/myCheckPointCount',data)
}
// 获取点位检查条例
// {"pointId":"40289fd87013cccd017013ccd6ca0000"}
export const loadCheckRule = (data)=>{
	return $H.post('/checkpoint/loadCheckRule',data)
}
//获取事件列表
export const listEvent = (data={})=>{
	return $H.post('/watchEvent/listEvent',data)
}
//上报事件
// {"employeeId":"9527","eventName":"中央巡查组来了","lat":"30.88","lng":"92.99","subsidiary":"扩展信息自行定义"}
export const addEvent=(data)=>{
	return $H.post('/watchEvent/addEvent',data)
}
// 取消事件
// {"id": "2c98808d701db49501701db697800000","cancelEmployeeId":"9527"}
export const cancelEvent=(data)=>{
	return $H.post('/watchEvent/cancelEvent',data)
}
// 获取地图gps配置
export const getGpsSet=(data)=>{
	return $H.post('/employee/loadGPSconfig',data)
}
// 上传坐标
export const uploadGPS=(data)=>{
	return $H.post('/employee/uploadGPS',data)
}
// 获取在线用户
export const getLineUserApi=(data)=>{
	return $H.post('/employee/getOnlineEmployee',data)
}

// 获取所有的点
export const getAlldot=(data)=>{
	return $H.post('/checkpoint/list',data)
}