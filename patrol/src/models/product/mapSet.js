import { messloadCfg,messupdateCfg } from '../../services/api'
import { message } from 'antd';

export default {
  namespace: 'mapSet',
  state:{
    datas:{},
  },
  
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/mapSet') {

            let _ars={}
            _ars.cfgCode = 'SCREEN.ONLINE.USER.interval'
            dispatch({
              type:'queryRule',
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
      const data = yield call(messloadCfg, payload)
			if(data.code==200&data.data!==null){
        yield put({
          type: 'querySuccess',
          payload: data.data,
        })
			}
    },
    //提交
    * submit({
      payload,
    }, { call, put }) {
      const data = yield call(messupdateCfg, payload)
			if(data.code==200){
        message.success('配置成功!')
			}
    },

  },
  reducers: {
    querySuccess(state, action){
      return {
        ...state,
        datas: action.payload,
      }
    },
  }
}
