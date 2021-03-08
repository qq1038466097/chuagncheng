import { roleBindList,roleBindDel } from '../../services/api'
import { message } from 'antd'

export default {
  namespace: 'roleBind',
  state:{
    data: [],
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/roleBind') {

          let _ars={}
          dispatch({
            type: 'queryRule',
            payload: _ars
          })

        }
      })
    },
  },
  
  effects: {
    * queryRule ({
      payload,
    }, { call, put }) {
		  const data = yield call(roleBindList, payload)
      if(data.code==200){
				yield put({
					type: 'querySuccess',
					payload: data.data.data,
				})
			}
    },
    * delFuns ({
      payload,
    }, { call, put }) {
		  const data = yield call(roleBindDel, payload)
      if(data.code==200){
        message.success('删除成功！')
        let _ars={}
        yield put({
          type: 'queryRule',
          payload: _ars
        })
      }else{
        message.error('删除失败，'+data.msg)
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
    querySuccess(state,action){
      return {
        ...state,
        data: action.payload,
      }
    },

  }
}
