import { daySummary,dayList } from '../../services/api'
import moment from 'moment'

export default {
  namespace: 'analyday',
  state:{
      tab1_Index: -1,
      times: '',
      datas1: {},
      datas2: [],
  },
  
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/analyday') {
          //初始化数据，单位趋势统计概览
          let _day = moment().format('YYYY-MM-DD')
          let _ars={}
          _ars.day = _day
          _ars.roundPoint = -1

          dispatch({
            type: 'times',
            payload: _day
          })

          dispatch({
            type: 'daySummarys',
            payload: _ars
          })

          let _ars2={}
          _ars2.day = _day
          _ars2.roundPoint = -1
          _ars2.order='desc'
          _ars2.sort='cycle_error_count'
          _ars2.pageIndex=1
          _ars2.pageSize=5000
          dispatch({
            type: 'dayLists',
            payload: _ars2
          })

        }
      })
    },
  },
  
  effects: {
    * daySummarys ({
      payload,
    }, { call, put }) {
      const data = yield call(daySummary, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        //计算合格率
        yield put({
          type: 'datas1',
          payload: _datas
        })
			}
    },

    * dayLists({
      payload,
    }, { call, put }) {
      const data = yield call(dayList, payload)
			if(data.code==200&&data.data!==null&&data.data.data!==null){
        let _datas = data.data.data
        for(let i=0; i<_datas.length; i++){
          _datas[i].key = i+1
        }
        yield put({
          type: 'datas2',
          payload: _datas
        })
			}else{
        yield put({
          type: 'datas2',
          payload: []
        })
      }
    },
  },
  reducers: {
	  //返回数据列表
    datas1(state, action) {
      return {
        ...state,
        datas1: action.payload,
      }
    },
    datas2(state, action) {
      return {
        ...state,
        datas2: action.payload,
      }
    },
    times(state, action) {
      return {
        ...state,
        times: action.payload,
      }
    },
    tab1_Index(state, action){
      return {
        ...state,
        tab1_Index: action.payload,
      }
    },
   
  }
}
