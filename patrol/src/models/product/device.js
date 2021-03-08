import { deviceList,deviceDel,deviceAdd } from '../../services/api'
import { message } from 'antd'

export default {
  namespace: 'device',
  state:{
    data: [],
    showModal: false,
    searchList: {},
    paginationG: {},
    pageindex: 1, //分页默认当前页
    pagesize: 10, //分页默认条数
    bindIds: null,
    equDetail: null,
    editModal: false,
    editData: null
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/device') {

          dispatch({
            type: 'clearData'
          })

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
		  const data = yield call(deviceList, payload)
      if(data.code==200){
        if(data.data.data==null||data.data.data.length==0){
          let _pag={}
          _pag.total= 0
          _pag.pageSize= 0
          _pag.current= 0
          _pag.pageCount=0
          yield put({
            type: 'querySuccess',
            payload: [],
            page: _pag
          })
        }else{
          let _pag={}
          _pag.total= data.data.totalCount
          _pag.pageSize= data.data.pageSize
          _pag.current= data.data.currentIndex
          //计算总共多少页
          let _nums = Math.ceil(data.data.totalCount/data.data.pageSize)
          _pag.pageCount =_nums
          yield put({
            type: 'querySuccess',
            payload: data.data.data,
            page: _pag
          })
        }	
			}
    },
    //删除
    * deviceDel ({
      payload,
      searchList,
    }, { call, put }) {
      const data = yield call(deviceDel, payload)
			if(data.code==200){
        message.success('删除成功!')
        let _ars = searchList
        yield put({
          type:'queryRule',
          payload: _ars
        })
			}
    },
    //新增
    * deviceSave({
      payload,
    }, { call, put }) {
      const data = yield call(deviceAdd, payload)
			if(data.code==200){
        message.success('操作成功！')
        //更新数据
        yield put({
          type: 'queryRule',
          payload: {}
        })
      }
    },
  },
  reducers: {
    clearData(state){
      return {
        ...state,
        data: [],
        showModal: false,
        searchList: {},
        paginationG: {},
        pageindex: 1, //分页默认当前页
        pagesize: 10, //分页默认条数
        bindIds: null,
        equDetail: null,
        editModal: false,
        editData: null
      }
    },
    editModal(state,action){
      return {
        ...state,
        editModal: action.payload,
      }
    },
    editData(state,action){
      return {
        ...state,
        editData: action.payload,
      }
    },
    equDetail(state,action){
      return {
        ...state,
        equDetail: action.payload,
      }
    },
    bindIds(state,action){
      return {
        ...state,
        bindIds: action.payload,
      }
    },
    querySuccess(state,action){
      return {
        ...state,
        data: action.payload,
        paginationG: action.page
      }
    },
    showModal(state,action){
      return {
        ...state,
        showModal: action.payload,
      }
    },
     //分页参数
    setPage(state, action){
      return {
        ...state,
        pageindex: action.payload,
        pagesize: action.size,
      }
    },
    searchList(state,action){
      return {
        ...state,
        searchList: action.payload,
      }
    },

  }
}
