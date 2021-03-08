import store from '@/store/index.js'
import $H from '@/common/lib/request.js';

//绑定code
export const getUserInfoByCode=(data)=>{
	return $H.post('/miniprogram/getUserInfoByCode',data,{},true)
}
//发送短信
export const sendBindCode=(data)=>{
	return $H.post('/miniprogram/sendBindCode',data,{},true)
}
//绑定用户
export const BindEmployees=(data)=>{
	return $H.post('/miniprogram/bindEmployee',data,{},true)
}
//解除绑定用户
export const unBindEmployees=(data)=>{
	return $H.post('/miniprogram/unBindEmployee',data,{},true)
}
//我的巡查点位
export const myDot=(data)=>{
	return $H.post('/checkpoint/myCheckPoint',data,{},true)
}
//我的巡查点位统计
export const dotStatistics=(data)=>{
	return $H.post('/checkpoint/myCheckPointCount',data,{},true)
}
//根据条例id,查询具体条例
export const ruleInfo=(data)=>{
	return $H.post('/checkrule/info',data,{},true)
}
//巡查点位条例
export const dotRule=(data)=>{
	return $H.post('/checkpoint/loadCheckRule',data,{},true)
}
//巡查点位条例
export const dotDetail=(data)=>{
	return $H.post('/checkpoint/pointInfo',data,{},true)
}
//巡查记录
export const dotHistory=(data)=>{
	return $H.post('/checkpoint/listCheckRecord',data,{},true)
}
//巡查记录详情
export const dotHistoryDetail=(data)=>{
	return $H.post('/checkpoint/loadRecord',data,{},true)
}
//巡查上报提交
export const dotSubmit=(data)=>{
	return $H.post('/checkpoint/addCheckRecord',data,{},true)
}
/*******创建聊天池********/
export const creatChat = (rawModeData)=>{
	return $H.post('/im/createChatRom',rawModeData)
}
//聊天,chatman
export const chatMan=(memberId)=>{
	return $H.post('/im/listChatRom',memberId)
}
/*******拉取聊天池信息********/
export const chatList = (memberId)=>{
	return $H.post('/im/listMSG',memberId)
}
/*******发送消息********/
export const sendMs = (memberId)=>{
	return $H.post('/im/sendMSG',memberId)
}
/*******消息标记已读********/
export const msRead = (memberId)=>{
	return $H.post('/im/markLastReadTime',memberId)
}
/*******通知list********/
export const noticeList = (memberId)=>{
	return $H.post('/notice/list',memberId)
}
/*******员工信息********/
export const userInfo = (memberId)=>{
	return $H.post('/employee/info',memberId)
}
/*******员工角色********/
export const userRole = (memberId)=>{
	return $H.post('/authen/listUserRole',memberId)
}
/*******通讯录********/
export const getTel = (memberId)=>{
	return $H.post('/employee/list',memberId)
}
/*******点位处理********/
export const dotReports = (memberId)=>{
	return $H.post('/checkpoint/addCheckRecordFix',memberId)
}
/*******dotadd 随机人员********/
export const getManrandom = (memberId)=>{
	return $H.post('/checkpoint/listPointRole',memberId)
}
/*********新增随机点位*****************/
export const dotSubmitRandom = (memberId)=>{
	return $H.post('/checkpoint/addRoundPoint',memberId)
}
/*********个人中心 统计*****************/
export const userStic = (memberId)=>{
	return $H.post('/employee/dataCount',memberId)
}
/*********点位修改-提交*****************/
export const dotEdit = (memberId)=>{
	return $H.post('/checkpoint/save',memberId)
}
/*********聊天室列表*****************/
export const imList = (memberId)=>{
	return $H.post('/im/listChatRom',memberId)
}
/*********初始 消息缓存100条*****************/
export const imMsgList = (memberId)=>{
	return $H.post('/im/currentMsg',memberId)
}
/*********聊天室人员*****************/
export const imManList = (memberId)=>{
	return $H.post('/im/listChatRomMembers',memberId)
}
/*********创建聊天室*****************/
export const imCreatRom = (memberId)=>{
	return $H.post('/im/createChatRom',memberId)
}
/*********周期*****************/
export const myTimes = (memberId)=>{
	return $H.post('/weekCount/listResetRecord',memberId)
}

/*********读取系统配置-短信,消息*****************/
export const sysCfg = (memberId)=>{
	return $H.post('/sysCfg/loadCfg',memberId)
}

