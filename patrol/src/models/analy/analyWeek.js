import { 
  orgTrendSummary, //所有单位
  listOrgTrend, //单个单位
  weeksList, //周期api 
  listAreaTrend, //地区明细
  pointTypeTrendSummary, //类型
  listPointTypeTrend, //类型明细
  areaTrendSummary, //地区
  groupitemSummary,  //项目指标-概览
  groupitemList, //项目指标-list
} from '../../services/api'
import { getHglv,getXfnum,getXflv,getPronum,getZglv } from '../../utils/config';
import moment from 'moment'

export default {
  namespace: 'analyweek',
  state:{
    weeks: [], //周期
    chooseweeks: 0,
    totalData: {}, //总数
    titles: ['单位趋势','类型趋势','地域趋势','单位报表','类型报表','地区报表','项目指标报表'],
    selected: 0, //选中第几个选项卡
    tab1_Index: -1,
    tab1_company: 0, //页面第一个单位
    tab1_companyDetail: [],//单位详情数据
		tab1_startTime:'', //页面开始时间
    tab1_endTime:'',  //页面结束时间
    tab1_data: [], //合格率-并且排序
    tab1_tabul: 0, //第一个，可点击切换单位的个数
    //第二个
    chooseweeks2: 0,
		tab2_Index:-1, //页面第一个选中，全部，suiji
		tab2_company:0, //页面第一个单位
		tab2_companyDetail: [], //页面单位详情数据
		tab2_startTime: '', //页面开始时间
		tab2_endTime: '',  //页面结束时间
		tab2_data: [], //页面第一个，数据
		tab2_tabul: 0, //选项卡切换单位
  },
  
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/analyWeek') {
          
          //周期
          let _ars2={}
          dispatch({
            type:'queryWeeks',
            payload: _ars2
          })
          dispatch({
              type:'clearData',
          })
        }
      })
    },
  },
  
  effects: {

    //项目指标-列表
    * groupList({
      payload,
    }, { call, put }) {
      const data = yield call(groupitemList, payload)
			if(data.code==200&&data.data!==null&data.data.data!==null){
        let _datas = data.data.data
        for(let i=0; i<_datas.length; i++){
          //本周整改率
          _datas[i].key = i+1
          if(_datas[i].cycle_error_count==0||_datas[i].cycle_error_count==null){
            _datas[i].zgLv = 0
          }else{
            _datas[i].zgLv = parseInt((_datas[i].cycle_fix_count/_datas[i].cycle_error_count)*100)
          }

          if(_datas[i].cumulative_error_count==0||_datas[i].cumulative_error_count==null){
            _datas[i].zgLvNum = 0
          }else{
            _datas[i].zgLvNum = parseInt((_datas[i].cumulative_fix_count/_datas[i].cumulative_error_count)*100)
          }
          
          //累计整改率
          _datas[i].zgLvNum = parseInt((_datas[i].cumulative_fix_count/_datas[i].cumulative_error_count)*100)
        }
        yield put({
          type: 'tab1_data',
          payload: _datas
        })
			}else{
        yield put({
          type: 'tab1_data',
          payload: []
        })
      }
    },

    //项目指标-概览
    * groupSummary({
      payload,
    }, { call, put }) {
      const data = yield call(groupitemSummary, payload)
			if(data.code==200&&data.data!==null&&data.data.data!==null){
        let _datas = data.data
        yield put({
          type: 'totalData',
          payload: _datas
        })
			}
    },

    //地区-合格率
    * areaData({
      payload,
    }, { call, put }) {
      const data = yield call(areaTrendSummary, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        //从新排序，将全部排在最前面
        let _ars={}
        for(let i=0; i<_datas.length; i++){
          if(_datas[i].area_name==null){
            _ars=_datas[i]
            _datas.splice(i,1)
            break;
          }
        }
        _ars.area_name = '整体'
        _ars.org_id=0
        _datas.unshift(_ars)
        yield put({
          type: 'tab1_data',
          payload: _datas
        })

        yield put({
          type: 'tab1_company',
          payload: '整体'
        })

			}
    },

    //地区-整改率
    * areaData2({
      payload,
    }, { call, put }) {
      const data = yield call(areaTrendSummary, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        //从新排序，将全部排在最前面
        let _ars={}
        for(let i=0; i<_datas.length; i++){
          if(_datas[i].area_name==null){
            _ars=_datas[i]
            _datas.splice(i,1)
            break;
          }
        }
        _ars.area_name = '整体'
        _ars.org_id=0
        _datas.unshift(_ars)
        yield put({
          type: 'tab2_data',
          payload: _datas
        })

        yield put({
          type: 'tab2_company',
          payload: '整体'
        })
			}
    },

    //地区报表
    * areaDataDw ({
      payload,
  }, { call, put }) {
    const data = yield call(areaTrendSummary, payload)
    if(data.code==200&&data.data!==null){
        let _datas = data.data
        //从新排序，将全部排在最前面
        let _ars={};
        let _datas2=[]
        let _totalData;
        for(let i=0; i<_datas.length; i++){
            if(_datas[i].area_name!==null){
              //巡防数：点位总数-待巡查数
              _datas[i].stay_checked = getXfnum(_datas[i]);
              //巡防率：
              _datas[i].stay_checkedLv = getXflv(_datas[i])+'%';
              //问题数
              _datas[i].problem = getPronum(_datas[i])
              //整改率
              _datas[i].zgLv = getZglv(_datas[i])+ '%'
              //合格率
              _datas[i].hglv = getHglv(_datas[i]) + '%';
              _datas[i].key = i+1;
              _datas2.push(_datas[i])
            }else{
              _totalData = _datas[i];
            }
        }
        //计算合格率
        yield put({
            type: 'tab1_data',
            payload: _datas2
        });
        //总数
        yield put({
          type: 'totalData',
          payload: _totalData
      });
    }
},

    //类型明细-合格率
    * querypointTypeDetail({
      payload,
    }, { call, put }) {
      const data = yield call(listPointTypeTrend, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        yield put({
          type: 'tab1_companyDetail',
          payload: _datas
        })
			}
    },

    //类型明细2-整改率
    * querypointTypeDetail2({
      payload,
    }, { call, put }) {
      const data = yield call(listPointTypeTrend, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        yield put({
          type: 'tab2_companyDetail',
          payload: _datas
        })
			}
    },

    //类型-报表
    * querypointTypeDw ({
        payload,
    }, { call, put }) {
      const data = yield call(pointTypeTrendSummary, payload)
      if(data.code==200&&data.data!==null){
          let _datas = data.data
          //从新排序，将全部排在最前面
          let _ars={};
          let _datas2=[]
          let _totalData;
          for(let i=0; i<_datas.length; i++){
              if(_datas[i].point_type_name!==null){
                //巡防数：点位总数-待巡查数
                _datas[i].stay_checked = getXfnum(_datas[i]);
                //巡防率：
                _datas[i].stay_checkedLv = getXflv(_datas[i])+'%';
                //问题数
                _datas[i].problem = getPronum(_datas[i])
                //整改率
                _datas[i].zgLv = getZglv(_datas[i])+ '%'
                //合格率
                _datas[i].hglv = getHglv(_datas[i]) + '%';
                _datas[i].key = i+1;
                _datas2.push(_datas[i])
              }else{
                _totalData = _datas[i];
              }
          }
          //计算合格率
          yield put({
              type: 'tab1_data',
              payload: _datas2
          });
          //总数
          yield put({
            type: 'totalData',
            payload: _totalData
        });
      }else{
        yield put({
          type: 'tab1_data',
          payload: []
      });
      //总数
      yield put({
        type: 'totalData',
        payload: {}
      });
    }
  },

    //类型-合格率
    * querypointType ({
      payload,
    }, { call, put }) {
      const data = yield call(pointTypeTrendSummary, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        //从新排序，将全部排在最前面
        let _ars={}
        for(let i=0; i<_datas.length; i++){
          if(_datas[i].point_type==null){
            _ars=_datas[i]
            _datas.splice(i,1)
            break;
          }
        }
        _ars.point_type_name = '整体'
        _ars.point_type='整体'
        _datas.unshift(_ars)
        //计算合格率
        yield put({
          type: 'tab1_data',
          payload: _datas
        })

        yield put({
          type: 'tab1_company',
          payload: '整体'
        })

			}
    },

    
    //类型2-整改率
    * querypointType2 ({
      payload,
    }, { call, put }) {
      const data = yield call(pointTypeTrendSummary, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        //从新排序，将全部排在最前面
        let _ars={}
        for(let i=0; i<_datas.length; i++){
          if(_datas[i].point_type==null){
            _ars=_datas[i]
            _datas.splice(i,1)
            break;
          }
        }
        _ars.point_type_name = '整体'
        _ars.point_type='整体'
        _datas.unshift(_ars)
        //计算合格率
        yield put({
          type: 'tab2_data',
          payload: _datas
        })

        yield put({
          type: 'tab2_company',
          payload: '整体'
        })

			}
    },

    //总的合格率
    * query_orgTrendSummary ({
      payload,
    }, { call, put }) {
      const data = yield call(orgTrendSummary, payload)
          if(data.code==200&&data.data!==null){
              let _datas = data.data
              //从新排序，将全部排在最前面
              let _ars={}
              for(let i=0; i<_datas.length; i++){
                if(_datas[i].org_id==null){
                  _ars=_datas[i]
                  _datas.splice(i,1)
                  break;
                }
              }
              _ars.org_name = '整体'
              _ars.org_id=0
              _datas.unshift(_ars)
              //计算合格率
              yield put({
                type: 'tab1_data',
                payload: _datas
              })
          }
    },

    //总的合格率-单位报表
    * query_orgTrendSummaryDw ({
          payload,
      }, { call, put }) {
        const data = yield call(orgTrendSummary, payload)
        if(data.code==200&&data.data!==null){
            let _datas = data.data
            //从新排序，将全部排在最前面
            let _ars={};
            let _datas2=[]
            let _totalData;
            for(let i=0; i<_datas.length; i++){
                if(_datas[i].org_name!==null){
                  //巡防数：点位总数-待巡查数
                  _datas[i].stay_checked = getXfnum(_datas[i]);
                  //巡防率：
                  _datas[i].stay_checkedLv = getXflv(_datas[i])+'%';
                  //问题数
                  _datas[i].problem = getPronum(_datas[i])
                  //整改率
                  _datas[i].zgLv = getZglv(_datas[i])+ '%'
                  //合格率
                  _datas[i].hglv = getHglv(_datas[i]) + '%';
                  _datas[i].key = i+1;
                  _datas2.push(_datas[i])
                }else{
                  _totalData = _datas[i];
                }
            }
            //计算合格率
            yield put({
                type: 'tab1_data',
                payload: _datas2
            });
            //总数
            yield put({
              type: 'totalData',
              payload: _totalData
          });
        }else{
          //计算合格率
          yield put({
            type: 'tab1_data',
            payload: []
        });
        //总数
        yield put({
          type: 'totalData',
          payload: {}
        });
      }
    },

    //单位详情数据 
    * companyDetail({
      payload,
    }, { call, put }) {
      const data = yield call(listOrgTrend, payload)
          if(data.code==200&&data.data!==null){
            let _datas = data.data
            yield put({
              type: 'tab1_companyDetail',
              payload: _datas
            })
          }
    },

    //单位详情数据 
    * companyDetail2({
      payload,
    }, { call, put }) {
      const data = yield call(listOrgTrend, payload)
          if(data.code==200&&data.data!==null){
            let _datas = data.data
            yield put({
              type: 'tab2_companyDetail',
              payload: _datas
            })
          }
    },

    //地区详情数据 
    * areaDetail({
      payload,
    }, { call, put }) {
      const data = yield call(listAreaTrend, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        yield put({
          type: 'tab1_companyDetail',
          payload: _datas
        })
			}
    },

    //地区详情数据 
    * areaDetail2({
      payload,
    }, { call, put }) {
      const data = yield call(listAreaTrend, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        yield put({
          type: 'tab2_companyDetail',
          payload: _datas
        })
			}
    },
    

    //周期list
    * queryWeeks({
      payload,
    }, { call, put }) {
      const data = yield call(weeksList, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        //判断有没有介绍时间
        if(_datas[0].endTime==null){
          _datas[0].endTime = moment().format('YYYY-MM-DD HH:mm:ss')
        }
        yield put({
          type: 'weeks',
          payload: _datas
        })

        //初始化数据，单位趋势统计概览
        let _ars={}
        _ars.startTime=_datas[0].startTime
        _ars.endTime=_datas[0].endTime
        _ars.sort='pass_count/total_count'
        _ars.order='desc'
        _ars.roundPoint='-1'
        yield put({
          type:'query_orgTrendSummary',
          payload: _ars
        })


        //初始化数据，整改率
        let _ars2={}
        _ars2.startTime=_datas[0].startTime
        _ars2.endTime=_datas[0].endTime
        _ars2.sort='stay_review/(total_count-pass_count-stay_check)'
        _ars2.order='desc'
        _ars2.roundPoint='-1'
        yield put({
          type:'query_orgTrendSummary2',
          payload: _ars2
        })

        //初始化全部合格率
        let _ars3={}
        _ars3.roundPoint='-1'
        _ars3.startTime=_datas[0].startTime
        _ars3.endTime=_datas[0].endTime
        yield put({
          type:'companyDetail',
          payload: _ars3
        })
        yield put({
          type:'companyDetail2',
          payload: _ars3
        })

        //设置初始化的值
        yield put({
          type: 'tab1_setTime',
          time1: _datas[0].startTime,
          time2: _datas[0].endTime,
          time3: 0,
        })

        yield put({
          type: 'tab2_setTime',
          time1: _datas[0].startTime,
          time2: _datas[0].endTime,
          time3: 0,
        })

			}
    },

    //第二个，整改率
    * query_orgTrendSummary2 ({
      payload,
    }, { call, put }) {
      const data = yield call(orgTrendSummary, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        //从新排序，将全部排在最前面
        let _ars={}
        for(let i=0; i<_datas.length; i++){
          if(_datas[i].org_id==null){
            _ars=_datas[i]
            _datas.splice(i,1)
            break;
          }
        }
        _ars.org_name = '整体'
        _ars.org_id=0
        _datas.unshift(_ars)
        //计算合格率
        yield put({
          type: 'tab2_data',
          payload: _datas
        })
			}
    },
    //单位详情数据 
    * companyDetail2({
      payload,
    }, { call, put }) {
      const data = yield call(listOrgTrend, payload)
			if(data.code==200&&data.data!==null){
        let _datas = data.data
        yield put({
          type: 'tab2_companyDetail',
          payload: _datas
        })
			}
    },
    

  },
  reducers: {
    clearData(state){
      return {
        ...state,
        data: [],
        selected:0
      }
    },
	  //返回数据列表
    querySuccess(state, action) {
      return {
        ...state,
        data: action.payload,
      }
    },
    selected(state, action){
      return {
        ...state,
        selected: action.payload,
      }
    },
    /* 页面 第一个组件*/
    tab1_Index(state, action){
      return {
        ...state,
        tab1_Index: action.payload,
      }
    },
    tab1_setTime(state, action){
      return {
        ...state,
        tab1_startTime: action.time1,
        tab1_endTime: action.time2,
        chooseweeks: action.time3,
      }
    },
    tab1_company(state, action){
      return {
        ...state,
        tab1_company: action.payload,
      }
    },
    weeks(state, action){
      return {
        ...state,
        weeks: action.payload,
      }
    },
    tab1_data(state, action){
      return {
        ...state,
        tab1_data: action.payload,
      }
    },
    tab1_tabul(state, action){
      return {
        ...state,
        tab1_tabul: action.payload,
      }
    },
    totalData(state, action){
      return {
        ...state,
        totalData: action.payload,
      }
    },
    tab1_companyDetail(state, action){
      return {
        ...state,
        tab1_companyDetail: action.payload,
      }
    },
    /* 页面 第二个组件*/
    tab2_Index(state, action){
      return {
        ...state,
        tab2_Index: action.payload,
      }
    },
    tab2_setTime(state, action){
      return {
        ...state,
        tab2_startTime: action.time1,
        tab2_endTime: action.time2,
        chooseweeks2: action.time3,
      }
    },
    tab2_company(state, action){
      return {
        ...state,
        tab2_company: action.payload,
      }
    },
    tab2_data(state, action){
      return {
        ...state,
        tab2_data: action.payload,
      }
    },
    tab2_tabul(state, action){
      return {
        ...state,
        tab2_tabul: action.payload,
      }
    },
    tab2_companyDetail(state, action){
      return {
        ...state,
        tab2_companyDetail: action.payload,
      }
    },
  }
}
