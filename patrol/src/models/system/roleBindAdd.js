import { roleBindAdds,funList } from '../../services/api'
import { message } from 'antd'

export default {
  namespace: 'roleBindAdd',
  state:{
    mobileData: [],
    pcData: [],
    checkedAll_Mb: false,
    checkedAll_Pc: false,
    checkList_mb: [],
    checkList_pc: [],
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/roleBind/add') {
            let _ars={}
            _ars.pageSize=50
            dispatch({
              type:'queryRule',
              payload:_ars 
            })
        }
      })
    },
  },
  
  effects: {
    * queryRule ({
      payload,
    }, { call, put }) {
		  const data = yield call(funList, payload)
      if(data.code==200&&data.data!==null){
        let _datas = data.data.data
        let _mobile=[]
        let _pc=[]
        for(let i=0; i<_datas.length; i++){
          _datas[i].value=_datas[i].funId
          _datas[i].label=_datas[i].funName
          if((_datas[i].funCode.indexOf('mb-'))>-1){
            _mobile.push(_datas[i])
          }else{
            _pc.push(_datas[i])
          }
        }
				yield put({
					type: 'mobileData',
					payload: _mobile,
        })
        yield put({
					type: 'pcData',
					payload: _pc,
				})
			}
    },
    * addRole({
      payload,
    },{ call, put }){
      const data = yield call(roleBindAdds, payload)
      if(data.code==200){
        message.success('操作成功！')
        setTimeout(()=>{
          history.go(-1)
        },500)
      }else{
        message.error('操作失败，'+data.msg)
      }
    },
  },
  reducers: {
    clearData(state){
      return {
        ...state,
        data: [],
      }
    },
    mobileData(state,action){
      return {
        ...state,
        mobileData: action.payload,
      }
    },
    pcData(state,action){
      return {
        ...state,
        pcData: action.payload,
      }
    },
    checkedAll_Mb(state,action){
      return {
        ...state,
        checkedAll_Mb: action.payload,
      }
    },
    checkedAll_Pc(state,action){
      return {
        ...state,
        checkedAll_Pc: action.payload,
      }
    }, 
    checkList_mb(state,action){
      return {
        ...state,
        checkList_mb: action.payload,
      }
    },
    checkList_pc(state,action){
      return {
        ...state,
        checkList_pc: action.payload,
      }
    },
  }
}
