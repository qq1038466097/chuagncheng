import { roleBindAdds,funList,roleBindInfo } from '../../services/api'
import { message } from 'antd'
import { getQueryStringHash } from '../../utils/config'

export default {
  namespace: 'roleBindEdit',
  state:{
    mobileData: [],
    pcData: [],
    checkedAll_Mb: false,
    checkedAll_Pc: false,
    checkList_mb: [],
    checkList_pc: [],
    infos:{},
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/roleBind/edit') {

            dispatch({
              type: 'clearData'
            })

            //查询功能
            let _ars={}
            _ars.pageSize = 50
            dispatch({
              type:'queryRule',
              payload:_ars 
            })
        }
      })
    },
  },
  
  effects: {
    * queryInfo ({
      payload,
      _mobile, //小程序数据
      _pc, //手机数据
    }, { call, put }) {
		  const data = yield call(roleBindInfo, payload)
      if(data.code==200){
				yield put({
					type: 'infos',
					payload: data.data,
        })
        //设置默认
        let _data=data.data.funs
        if(_data!==null&&_data.length>0){
          let _mobileList=[]  //小程序已选项
          let _pcList=[]  //pc已选项
          for(let j=0; j<_mobile.length; j++){
            for(let i=0; i<_data.length; i++){
              if(_mobile[j].funId==_data[i].funId){
                _mobileList.push(_mobile[j].funId)
                break;
              }
            }
          }

          for(let j=0; j<_pc.length; j++){
            for(let i=0; i<_data.length; i++){
              if(_pc[j].funId==_data[i].funId){
                _pcList.push(_pc[j].funId)
                break;
              }
            }
          }

          //已选-小程序数据
          yield put({
            type: 'checkList_mb',
            payload: _mobileList
          })

          //已选-pc数据
          yield put({
            type: 'checkList_pc',
            payload: _pcList
          })

          //判断是否全选-小程序
          if(_mobileList.length==_mobile.length){
            yield put({
              type: 'checkedAll_Mb',
              payload: true
            })
          }

          //判断是否全选-pc
          if(_pcList.length==_pc.length){
            yield put({
              type: 'checkedAll_Pc',
              payload: true
            })
          }

          

        }

			}
    },
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
        //查询角色详情
        let _ars2={}
        _ars2.roleId = getQueryStringHash('ids')
        yield put({
          type:'queryInfo',
          payload:_ars2,
          _mobile,
          _pc,
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
        mobileData: [],
        pcData: [],
        checkedAll_Mb: false,
        checkedAll_Pc: false,
        checkList_mb: [],
        checkList_pc: [],
        infos:{},
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
    infos(state,action){
      return {
        ...state,
        infos: action.payload,
      }
    },
  }
}
