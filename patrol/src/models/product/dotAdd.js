import { dotTypeList,dotAdd,qeryQrg,getUser } from '../../services/api'
import { message } from 'antd';

export default {
  namespace: 'dotAdd',
  state:{
    catId: '',
    typeData: [],
    isSubmits: true,
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
        if (location.pathname === '/dot/dotAdd') {

            dispatch({
              type: 'clearData'
            })

            //查询类型
            let _ars2={}
            _ars2.pageIndex=1
            _ars2.pageSize = 100
            dispatch({
              type:'queryTypes',
              payload: _ars2
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
					type: 'queryType',
					payload: data.data.data,
				})
			}
    },

    //新增
    * addDot ({
      payload,
    }, { call, put }) {
      const data = yield call(dotAdd, payload)
	    if(data.code==200){
        message.success('添加成功!')
        setTimeout(()=>{
          history.go(-1)
        },500)
      }else{
        message.error('添加失败!')
      }
    },
  },
  reducers: {
    clearData(state){
      return {
        ...state,
        logoUrl: '',
        classifyData: [],//分类信息
        catId: '', //分类id
        endTime: '',
        htmls:'',
        defRadio: 0,
        isSubmits: true,
        lat: '',
        lng: '',
        isSetMap: false,
      }
    },
    isSetMap(state,action){
      return {
        ...state,
        isSetMap: action.payload
      }
    },
    setLat(state,action){
      return {
        ...state,
        lat: action.lat,
        lng: action.lng,
      }
    },
    defRadio(state,action){
      return {
        ...state,
        defRadio: action.payload
      }
    },
    queryType(state,action){
      return {
        ...state,
        typeData: action.payload
      }
    },
    isSubmits(state,action){
      return {
        ...state,
        isSubmits: action.payload
      }
    },
    htmls(state,action){
      return {
        ...state,
        htmls: action.payload
      }
    },
    endTime(state,action){
      return {
        ...state,
        endTime: action.payload
      }
    },
    catId(state,action){
      return {
        ...state,
        catId: action.payload
      }
    },
    logoUrl(state,action){
      return {
        ...state,
        logoUrl: action.payload
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
