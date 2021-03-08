import { 
    orgCycleAnalysis, //单位
    pointTypeCycleAnalysis, //类型
    areaCycleAnalysis,  //地区
    weeksList, //周期api 
} from '../../services/api'
import moment from 'moment'
import { getRate } from '../../utils/config.js'

export default {
    namespace: 'analyCycle',
    state:{
        titles: ['单位合格率分析','类型合格率分析','地区合格率分析'],
        weeks: [], //周期
        datas: [],
        typeData: [],
        areaData: [],
        selected: 0, //选中第几个选项卡
        tab1_Index: -1,
        tab1_company: 0, //页面第一个单位
        tab1_companyDetail: [],//单位详情数据
        tab1_startTime:'', //页面开始时间
        tab1_endTime:'',  //页面结束时间
        tab1_data: [], //合格率-并且排序

        colorVal1:'60',
        colorVal2:'80',
        colorVal3:'90',
        colorVal4:'95',

        cashColorVal1:'60',
        cashColorVal2:'80',
        cashColorVal3:'90',
        cashColorVal4:'95',
        modalVisible:false
    },

    subscriptions: {
        setup ({ dispatch, history }) {
            history.listen((location) => {
                if (location.pathname === '/analyCycle') {

                    //周期
                    let _ars2={}
                    dispatch({
                        type:'queryWeeks',
                        payload: _ars2,
                        number: -1,
                    })
                }
            })
        },
    },

    effects: {
        //周期list
        * queryWeeks({
            payload,
            number,
        }, { call, put }) {
            const data = yield call(weeksList, payload)
            if(data.code==200&&data.data!==null&&data.data.length>0){
                let _datas = data.data
                //判断有没有介绍时间
                if(_datas[0].endTime==null){
                    _datas[0].endTime = moment().format('YYYY-MM-DD HH:mm:ss')
                }
                let _datas2=[]
                if(number==-1){
                    //初始化，自多显示4个周期
                    let _length = _datas.length
                    if(_length>4){
                        _length=4
                        _datas2.push(_datas[0])
                        _datas2.push(_datas[1])
                        _datas2.push(_datas[2])
                        _datas2.push(_datas[3])
                        _datas2.push(_datas[4])
                    }else{
                        _datas2 = _datas
                    }
                    let _st = _datas[_length-1].startTime
                    let _end = _datas[0].endTime
                    yield put({
                        type: 'tab1_setTime',
                        time1: _st,
                        time2: _end
                    })
                    //初始化数据，单位趋势统计概览
                    let _ars={}
                    _ars.startTime= _st
                    _ars.endTime= _end
                    _ars.sort='pass_count/total_count'
                    _ars.order='desc'
                    _ars.roundPoint='-1'
                    yield put({
                        type:'query_orgTrendSummary',
                        payload: _ars
                    })
                }else if(number==0){
                    //单位
                    let _ars={}
                    _ars.startTime= payload.startTime
                    _ars.endTime= payload.endTime
                    _ars.sort='pass_count/total_count'
                    _ars.order='desc'
                    _ars.roundPoint='-1'
                    yield put({
                        type:'query_orgTrendSummary',
                        payload: _ars
                    })
                    _datas2=_datas
                }else if(number==1){
                    //类型
                    let _ars={}
                    _ars.startTime= payload.startTime
                    _ars.endTime= payload.endTime
                    _ars.order='desc'
                    _ars.roundPoint='-1'
                    yield put({
                        type:'query_type',
                        payload: _ars
                    })
                    _datas2=_datas
                }else if(number==2){
                    //地区
                    let _ars={}
                    _ars.startTime= payload.startTime
                    _ars.endTime= payload.endTime
                    _ars.order='desc'
                    _ars.roundPoint='-1'
                    yield put({
                        type:'query_area',
                        payload: _ars
                    })
                    _datas2=_datas
                }
                yield put({
                    type: 'weeks',
                    payload: _datas2
                })
            }else{
                if(number==-1||number==0){
                    yield put({
                        type: 'datas',
                        payload: []
                    })
                }else if(number==1){
                    yield put({
                        type: 'typeData',
                        payload: []
                    })
                }else if(number==2){
                    yield put({
                        type: 'areaData',
                        payload: []
                    })
                }
            }
        },

        //总的合格率
        * query_orgTrendSummary ({
            payload,
        }, { call, put }) {
            const data = yield call(orgCycleAnalysis, payload)
            if(data.code==200&&data.data!==null){
                let _datas = data.data
                for(let i=0; i<_datas.length; i++){
                    let _new = _datas[i]
                    for(let t in _new){
                        if(t!=='org_name'){
                            _new[t] = getRate(_new[t],2)+'%'
                        }
                    }
                    _new.keys = i+1
                }
                //计算合格率
                yield put({
                    type: 'datas',
                    payload: _datas
                })
            }else{
                yield put({
                    type: 'datas',
                    payload: []
                })
            }
        },
        //类型
        * query_type ({
            payload,
        }, { call, put }) {
            const data = yield call(pointTypeCycleAnalysis, payload)
            if(data.code==200&&data.data!==null){
                let _datas = data.data
                for(let i=0; i<_datas.length; i++){
                    let _new = _datas[i]
                    for(let t in _new){
                        if(t!=='point_type_name'){
                            _new[t] = getRate(_new[t],2)+'%'
                        }
                    }
                    _new.keys = i+1
                }
                //计算合格率
                yield put({
                    type: 'typeData',
                    payload: _datas
                })
            }else{
                yield put({
                    type: 'typeData',
                    payload: []
                })
            }
        },
        //地区
        * query_area ({
            payload,
        }, { call, put }) {
            const data = yield call(areaCycleAnalysis, payload)
            if(data.code==200&&data.data!==null){
                let _datas = data.data
                for(let i=0; i<_datas.length; i++){
                    let _new = _datas[i]
                    for(let t in _new){
                        if(t!=='area_name'){
                            _new[t] = getRate(_new[t],2)+'%'
                        }
                    }
                    _new.keys = i+1
                }
                //计算合格率
                yield put({
                    type: 'areaData',
                    payload: _datas
                })
            }else{
                yield put({
                    type: 'areaData',
                    payload: []
                })
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
        weeks(state, action){
            return {
                ...state,
                weeks: action.payload,
            }
        },
        typeData(state, action){
            return {
                ...state,
                typeData: action.payload,
            }
        },
        areaData(state, action){
            return {
                ...state,
                areaData: action.payload,
            }
        },
        datas(state, action){
            return {
                ...state,
                datas: action.payload,
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
                tab1_endTime: action.time2
            }
        },
        tab1_company(state, action){
            return {
                ...state,
                tab1_company: action.payload,
            }
        },
        tab1_data(state, action){
            return {
                ...state,
                tab1_data: action.payload,
            }
        },
        tab1_companyDetail(state, action){
            return {
                ...state,
                tab1_companyDetail: action.payload,
            }
        },

        setColorVal1(state, action){
            return {
                ...state,
                colorVal1: action.payload,
            }
        },
        setColorVal2(state, action){
            return {
                ...state,
                colorVal2: action.payload,
            }
        },
        setColorVal3(state, action){
            return {
                ...state,
                colorVal3: action.payload,
            }
        },
        setColorVal4(state, action){
            return {
                ...state,
                colorVal4: action.payload,
            }
        },
        setVisible(state, action){
            return {
                ...state,
                modalVisible: action.payload,
            }
        },

        setCashColorVal1(state, action){
            return {
                ...state,
                cashColorVal1: action.payload,
            }
        },
        setCashColorVal2(state, action){
            return {
                ...state,
                cashColorVal2: action.payload,
            }
        },
        setCashColorVal3(state, action){
            return {
                ...state,
                cashColorVal3: action.payload,
            }
        },
        setCashColorVal4(state, action){
            return {
                ...state,
                cashColorVal4: action.payload,
            }
        },

    }
}
