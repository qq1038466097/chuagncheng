import { dotList,productDel,dotTypeList,dotDel,qeryQrg } from '../../services/api'
import { message } from 'antd';
import { isAdmin,searchOrg } from '../../utils/config'


export default {
  namespace: 'dot',
  state:{
    data:[],
    paginationG: {},
    searchList: {}, //查询条件
    pageindex: 1, //分页默认当前页
    pagesize: 10, //分页默认条数
    classifyData: [],
    catId: '',
    selected: 2,
    companyList: [],
    typedata: [],
    orgData: [],//机构数据
    history: null,
  },
  
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/dot') {

            //是否有缓存-返回的时候
            let _dotSearchs = localStorage.getItem('dotSearchs')
            let _ars={}
            if(_dotSearchs==null){
              //判断-如果不是管理员，只能查看自己机构的点位
              if(isAdmin==null){
                _ars.authOrgId = searchOrg
              }
              _ars.pageIndex=1
              _ars.pageSize = 10
              dispatch({
                type:'clearData',
              })
              dispatch({
                type:'searchList',
                payload: _ars
              })
            }else{
              _ars = JSON.parse(_dotSearchs)
              if(isAdmin==null){
                _ars.authOrgId = searchOrg
              }
              dispatch({
                type:'history',
                payload: _ars
              })
              dispatch({
                type:'searchList',
                payload: _ars
              })
            }

            dispatch({
              type:'queryRule',
              payload: _ars
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
    //删除
    * dotDelete ({
      payload,
      searchList,
    }, { call, put }) {
      const data = yield call(dotDel, payload)
			if(data.code==200){
        message.success('删除成功!')
				let _ars = searchList
        yield put({
          type:'queryRule',
          payload: _ars
        })
			}
	  
    },
    * queryRule ({
      payload,
    }, { call, put }) {
      const data = yield call(dotList, payload)
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
          /* 清空数据 */
          yield put({
            type: 'clearList',
          })
          yield put({
            type: 'querySuccess',
            payload: data.data,
            page: _pag
          })
        }
				
			}
	  
    },
	  //删除
	  * delProduct ({
      payload,
      selected
    }, { call, put }) {
      const data = yield call(productDel, payload)
	    if(data.code==200){
        message.success('删除成功!')
        let _ars={}
        _ars.goodsStatus = selected
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
  //返回数据列表
    clearList(state){
      return {
        ...state,
        data:[],
        paginationG: {},
        pageindex: 1, //分页默认当前页
        pagesize: 10, //分页默认条数
      }
    },
    clearData(state){
      return {
        ...state,
        data:[],
        paginationG: {},
        searchList: {}, //查询条件
        pageindex: 1, //分页默认当前页
        pagesize: 10, //分页默认条数
        classifyData: [],
        catId: '',
        selected: 2,
        companyList: [],
        history: null,
      }
    },
    orgData(state, action){
      return {
        ...state,
        orgData: action.payload,
      }
    },
    queryType(state, action){
      return {
        ...state,
        typedata: action.payload,
      }
    },
    companyList(state, action){
      return {
        ...state,
        companyList: action.payload,
      }
    },
    selected(state, action){
      return {
        ...state,
        selected: action.payload,
      }
    },
    queryClassData(state, action){
      return {
        ...state,
        classifyData: action.payload,
      }
    },
    catId(state, action){
      return {
        ...state,
        catId: action.payload,
      }
    },
    querySuccess(state, action) {
      return {
        ...state,
        data: action.payload,
        paginationG: action.page
      }
    },
    searchList(state, action){
      return {
        ...state,
        searchList: action.payload
      }
    },
    history(state, action){
      return {
        ...state,
        history: action.payload
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
  }
}
