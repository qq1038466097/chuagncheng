import { dotDetail,dotRule,dotHistory,dotTypeList,dotAdd,dotHistoryDetail,qeryQrg,getUser } from '../../services/api'
import { message } from 'antd';
import { getQueryStringHash } from '../../utils/config'

export default {
  namespace: 'dotEdit',
  state:{
    detail: {}, //详情数据
    ruleData: [],
    typeData: [],
    hisData: [], //巡查历史
    deId: '',  //历史记录id
    historys: {},  //巡查基本信息
    hisDataDetail: [], //巡查历史-条例data
    defRadio: 0,
    lat: '',
    lng: '',
    isSetMap: false,
    orgData: [],
    employeeData: [],
  },
  
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/dot/dotEdit') {

            let _id  = location.query.ids;
            let _ars={}
            _ars.pointId = _id

            //点位检查条例
            dispatch({
              type:'getRule',
              payload: _ars
            })

            //点位详情
            dispatch({
              type:'queryDetail',
              payload: _ars
            })

            //点位巡查历史记录
            let _ar2={}
            _ar2.pointId=_id
            _ar2.pageSize=50
            dispatch({
              type:'queryHistory',
              payload: _ar2
            })

            //查询类型
            let _ars3={}
            _ars3.pageIndex=1
            _ars3.pageSize = 100
            dispatch({
              type:'queryTypes',
              payload: _ars3
            })

            //查询机构数据
            dispatch({
              type:'queryOrgs',
              payload: {}
            })

        }
      })
    },
  },
  
  effects: {
    //获得员工列表
    * getUsers ({
      payload,
    }, { call, put }) {
      const data = yield call(getUser, payload)
      if(data.code==200&&data.data!==null){
        let _data = data.data
        if(_data!==null){
          yield put({
            type:'employeeData',
            payload: _data.data,
          })
        }else{
          yield put({
            type:'employeeData',
            payload: [],
          })
        }
        
      }else{
        yield put({
          type:'employeeData',
          payload: [],
        })
      }
    },
    //机构数据
    * queryOrgs ({
      payload,
    }, { call, put }) {
      const data = yield call(qeryQrg, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        if(_datas.length>0){
          if(_datas[0].children!==null){
            let _children = _datas[0].children
            yield put({
              type: 'orgData',
              payload: _datas[0].children,
            })
          }
        }
			}
    },
    //点位类型
    * queryTypes ({
      payload,
    }, { call, put }) {
      const data = yield call(dotTypeList, payload)
			if(data.code==200&&data.data.data!==null){
				yield put({
					type: 'setType',
					payload: data.data.data,
				})
			}
    },
    //点位详情
    * queryDetail ({
      payload,
    }, { call, put }) {
      const data = yield call(dotDetail, payload)
			if(data.code==200){
          yield put({
            type: 'defRadio',
            payload: parseInt(data.data.roundPoint)
          })
          yield put({
            type: 'setDetail',
            payload: data.data
          })

          yield put({
            type: 'isSetMap',
            payload: true,
          })

          yield put({
            type: 'setLat',
            lat: data.data.dimension,
            lng: data.data.longitude,
          })

          //如果责任单位不为空，获取单位下的人员list
          /*if(data.data.orgs!==null){
            let _ars={}
            _ars.orgId = data.data.orgs[0].id
            _ars.pageIndex=1
            _ars.pageSize=1000
            yield put({
              type: 'getUsers',
              payload:_ars
            })
          }*/
			}
    },
    //点位检查条例
    * getRule ({
      payload,
    }, { call, put }) {
      const data = yield call(dotRule, payload)
			if(data.code==200){
        if(data.data!==null&&data.data.length!==0){
          yield put({
            type: 'setRule',
            payload: data.data[0].checkRuleItems
          })
          
        }
			}
    },
    //点位检查历史记录
    * queryHistory ({
      payload,
    }, { call, put }) {
      const data = yield call(dotHistory, payload)
			if(data.code==200){
        if(data.data!==null&&data.data.length!==0){
          yield put({
            type: 'setHistory',
            payload: data.data.data
          })
          
        }
			}
    },
    //历史记录详情 
    * getHistory ({
      payload,
    }, { call, put }) {
      const data = yield call(dotHistoryDetail, payload)
			if(data.code==200){
        if(data.data!==null){
          yield put({
            type: 'hisDataDetail',
            payload: data.data.checkRecordItems
          })
        }
			}
    },
    //点位提交
    * addDot ({
      payload,
    }, { call, put }) {
      const data = yield call(dotAdd, payload)
			if(data.code==200){
        if(data.code==200){
          message.success('修改成功!')
          setTimeout(()=>{
            history.go(-1)
          },500)
        }else{
          message.error('修改失败!')
        }
			}
    },
  },
  reducers: {
    clearData(state){
      return {
        ...state,
        detail: {}, //详情数据
        ruleData: [],
        typeData: [],
        hisData: [], //巡查历史
        showDetail: false,
        deId: '',
        historys: {},
        defRadio: 0,
        lat: '',
        lng: '',
        isSetMap: false,
      }
    },
    setLat(state, action){
      return {
        ...state,
        lat: action.lat,
        lng: action.lng,
      }
    },
    isSetMap(state, action){
      return {
        ...state,
        isSetMap: action.payload,
      }
    },
    defRadio(state, action){
      return {
        ...state,
        defRadio: action.payload,
      }
    },
    deId(state, action){
      return {
        ...state,
        deId: action.payload,
      }
    },
    historys(state, action){
      return {
        ...state,
        historys: action.payload,
      }
    },
    showDetail(state, action){
      return {
        ...state,
        showDetail: action.payload,
      }
    },
    setType(state, action){
      return {
        ...state,
        typeData: action.payload,
      }
    },
    setDetail(state,action){
      return {
        ...state,
        detail: action.payload
      }
    },
    setRule(state,action){
      return {
        ...state,
        ruleData: action.payload
      }
    },
    hisDataDetail(state,action){
      return {
        ...state,
        hisDataDetail: action.payload
      }
    },
    setHistory(state,action){
      return {
        ...state,
        hisData: action.payload
      }
    },
    querySuccess(state,action){
      return {
        ...state,
        data: action.payload
      }
    },
    employeeData(state,action){
      return {
        ...state,
        employeeData: action.payload
      }
    },
    orgData(state,action){
      return {
        ...state,
        orgData: action.payload
      }
    },
  }
}
