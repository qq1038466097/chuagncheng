import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Table, Card,Button, Modal, DatePicker,Row, Col,Input ,message } from 'antd';

import styles from '../main.less';

import analy from './analy.less';
import ShowTitle from './components/titles2.js'
import moment from 'moment'
import ExportJsonExcel from 'js-export-excel';

const AnalyCycle = ({
    analyCycle,
    dispatch,
})=>{
    let {
		datas,
		weeks,
        typeData, //类型
        areaData, //地区
        titles,
        selected,
        tab1_Index, //页面第一个选中，全部，suiji
        tab1_startTime, //页面开始时间
        tab1_endTime,  //页面结束时间
        colorVal1,
        colorVal2,
        colorVal3,
        colorVal4,
        modalVisible,  //显示切换颜色
        cashColorVal1,
        cashColorVal2,
        cashColorVal3,
        cashColorVal4,
	} = analyCycle
	
	const dateFormat = 'YYYY-MM-DD HH:mm:ss'

    //赛选数据-单位
    const newDatas=(st,end,k)=>{
		//重新请求数据接口
		let _ars={}
		_ars.startTime = st
		_ars.endTime = end
		_ars.order = 'desc'
		_ars.roundPoint= k
		if(selected==0){
			dispatch({
				type: 'analyCycle/query_orgTrendSummary',
				payload: _ars,
			})
		}else if(selected==1){
			dispatch({
				type: 'analyCycle/query_type',
				payload: _ars,
			})
		}else if(selected==2){
			dispatch({
				type: 'analyCycle/query_area',
				payload: _ars,
			})
		}   
	}
    //赛选随机
    const setClick=(k)=>{
        //赛选条件
        dispatch({
            type: 'analyCycle/tab1_Index',
            payload: k,
        })
        newDatas(tab1_startTime,tab1_endTime,k);
    }

    //选中时间
    const showVal=(val)=>{
		let _time1 = moment(val[0]).format(dateFormat)
		let _time2 = moment(val[1]).format(dateFormat)
		dispatch({
			type: 'analyCycle/tab1_setTime',
			time1: _time1,
			time2: _time2
		})
		dispatch({
            type: 'analyCycle/tab1_Index',
            payload: -1,
		})
		//从新获取周期、赛选数据
		let _ars={}
		_ars.startTime = _time1
		_ars.endTime = _time2
		dispatch({
			type: 'analyCycle/queryWeeks',
			payload: _ars,
			number: selected,
		})
    }

    const setColor =()=> {
        dispatch({
            type: 'analyCycle/setVisible',
            payload: true
        })
    }

    const set0 =(e)=> {
        dispatch({
            type: 'analyCycle/setCashColorVal1',
            payload: e.target.value
        })
    }

    const set1 =(e)=> {
        if(e.target.value<cashColorVal1){
            message.warning('请设置合理的值');
            return false
        }
        dispatch({
            type: 'analyCycle/setCashColorVal2',
            payload: e.target.value
        })
    }

    const set2 =(e)=> {
        if(e.target.value<cashColorVal2){
            message.warning('请设置合理的值');
            return false
        }
        dispatch({
            type: 'analyCycle/setCashColorVal3',
            payload: e.target.value
        })
    }

    const set3 =(e)=> {
        if(e.target.value<cashColorVal3){
            message.warning('请设置合理的值');
            return false
        }
        dispatch({
            type: 'analyCycle/setCashColorVal4',
            payload: e.target.value
        })
    }

    const okHandle =()=> {

        dispatch({
            type: 'analyCycle/setColorVal1',
            payload: cashColorVal1
        })
        dispatch({
            type: 'analyCycle/setColorVal2',
            payload: cashColorVal2
        })
        dispatch({
            type: 'analyCycle/setColorVal3',
            payload: cashColorVal3
        })
        dispatch({
            type: 'analyCycle/setColorVal4',
            payload: cashColorVal4
        })
        dispatch({
            type: 'analyCycle/setVisible',
            payload: false
        })


    }
    const cancle =()=> {
        dispatch({
            type: 'analyCycle/setVisible',
            payload: false
        })
	}

	//动态表头
	const getTableHead=(datas)=>{
		return (datas.startTime).substring(5,11) + '~ '+(datas.endTime).substring(5,11)
	}

	//计算表格百分比圆颜色
	const getColor = (num)=>{
		//console.log(num)
		if(num==undefined){
			return 0
		}
		num = num.substring(0, num.length - 1);  
		let _pass = num
		let k=''
		if(_pass==0){
			k=analy.color1
		}else if(_pass>0&&_pass<=60){
			k=analy.color2
		}else if(_pass>60&&_pass<=80){
			k=analy.color3
		}else if(_pass>80&&_pass<=90){
			k=analy.color4
		}else if(_pass>90&&_pass<=95){
			k=analy.color5
		}else if(_pass>95&&_pass<=100){
			k=analy.color6
		}
		return k
	}
	
	let columns=[],columns2=[],columns3=[]
	//设置动态表头-单位
	const setTables = ()=>{
		columns.push({
            title: '序号',
            key: 'keys',
            dataIndex: 'keys',
		})
		columns.push({
			title: '单位名称',
			dataIndex: 'org_name',
			key: 'org_name',
			align: 'left',
		})
		for(let i=0; i<weeks.length; i++){
			/*if(i>4){
				return false
			}*/
			let _title=getTableHead(weeks[i])
			let _indexs= weeks[i].recordIndex
			columns.push({
				title: _title,
				dataIndex: _indexs,
				key: _indexs,
				align: 'center',
				render: (text, record) => {
					let k = getColor(text)
					return <div className={analy.flexs}>
							<span className={k}></span>
							<span className={analy.names}>{text}</span>
						</div>
				}
			})
		}
	}

	const setTables2 = ()=>{
		columns2.push({
            title: '序号',
            key: 'keys',
            dataIndex: 'keys',
		})
		columns2.push({
			title: '类型名称',
			dataIndex: 'point_type_name',
			key: 'point_type_name',
			align: 'left',
		})
		for(let i=0; i<weeks.length; i++){
			/*if(i>4){
				return false
			}*/
			let _title=getTableHead(weeks[i])
			let _indexs= weeks[i].recordIndex
			columns2.push({
				title: _title,
				dataIndex: _indexs,
				key: _indexs,
				align: 'center',
				render: (text, record) => {
					let k = getColor(text)
					return <div className={analy.flexs}>
							<span className={k}></span>
							<span className={analy.names}>{text}</span>
						</div>
				}
			})
		}
	}

	const setTables3 = ()=>{
		columns3.push({
            title: '序号',
            key: 'keys',
            dataIndex: 'keys',
		})
		columns3.push({
			title: '单位名称',
			dataIndex: 'area_name',
			key: 'area_name',
			align: 'left',
		})
		for(let i=0; i<weeks.length; i++){
			/*if(i>4){
				return false
			}*/
			let _title=getTableHead(weeks[i])
			let _indexs=weeks[i].recordIndex
			columns3.push({
				title: _title,
				dataIndex: _indexs,
				key: _indexs,
				align: 'center',
				render: (text, record) => {
					let k = getColor(text)
					return <div className={analy.flexs}>
							<span className={k}></span>
							<span className={analy.names}>{text}</span>
						</div>
				}
			})
		}
	}

	//报表下载
	const ExportToExcel = (cloum,title,_datas) => {
		let _name = title;
		let option={}
		let dataTable = _datas
		option.fileName = _name
		//计算表头
		let _filter=[]
		let _header=[]
		for(let j in cloum){
			_filter.push(cloum[j].key)
			_header.push(cloum[j].title)
		}
		option.datas = [
		  {
			sheetData: dataTable,
			sheetName: _name,
			sheetFilter: _filter,
			sheetHeader: _header,
		  }
		]
		var toExcel = new ExportJsonExcel(option);
		toExcel.saveExcel();
	}

    return (
	<Fragment>
		<ShowTitle
			title={titles}
			select={selected}
			typeName='analyCycle/selected'
			startTime={tab1_startTime}
			endTime={tab1_endTime}
			dispatch={dispatch}
		/>
        {
            selected==0&&tab1_startTime!==''?
				<div className={styles.analyCont}>
					<Card title='单位合格率分析' bordered={false}>
						<div className={analy.tipWeek}>
							提示: 手动设置周期颜色分布值
						</div>
						<div className={styles.topcont}>
							<div className={analy.colorWeek} onClick={setColor}>
								设置分布颜色
							</div>
							<div className={styles.topcontL}>
								<span onClick={setClick.bind(this,-1)} className={tab1_Index==-1?styles.spanActive:styles.span}>全部</span>
								<span onClick={setClick.bind(this,0)} className={tab1_Index==0?styles.spanActive:styles.span}>日常</span>
								<span onClick={setClick.bind(this,1)} className={tab1_Index==1?styles.spanActive:styles.span}>随机</span>
							</div>
							<div className={styles.topcontR}>
								<DatePicker.RangePicker
									onChange={showVal} 
									defaultValue={[moment(tab1_startTime, dateFormat), moment(tab1_endTime, dateFormat)]}
									format={dateFormat}
								/>
							</div>
							<div>
								<Button type="primary" className={styles.marginRight} onClick={ExportToExcel.bind(this,columns,'单位合格率分析',datas)}>导出报表</Button>
							</div>
						</div>
						<div className={styles.analyCompany}>
							<Row style={{width:'100%',textAlign:'center',lineHeight:'30px'}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
								<Col className="gutter-row" span={2}>
									<span>颜色分布</span>
								</Col>
								<Col className="gutter-row" span={2}>
									<span className={analy.color1}></span>
									<span className={analy.top}>0%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color2}></span>
									<span className={analy.top}>1%-{colorVal1}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color3}></span>
									<span className={analy.top}>{colorVal1}%-{colorVal2}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color4}></span>
									<span className={analy.top}>{colorVal2}%-{colorVal3}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color5}></span>
									<span className={analy.top}>{colorVal3}%-{colorVal4}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color6}></span>
									<span className={analy.top}>{colorVal4}%-100%</span>
								</Col>
							</Row>
						</div>
						{setTables()}
                        <Table 
                            columns={columns} 
                            dataSource={datas}
                            pagination={true}
                        />
					</Card>
				</div>
                :null
        }

        {
            selected==1?
				<div className={styles.analyCont}>
					<Card title='类型合格率分析' bordered={false}>
						<div className={analy.tipWeek}>
							提示: 手动设置周期颜色分布值
						</div>
						<div className={styles.topcont}>
							<div className={analy.colorWeek} onClick={setColor}>
								设置分布颜色
							</div>
							<div className={styles.topcontL}>
								<span onClick={setClick.bind(this,-1)} className={tab1_Index==-1?styles.spanActive:styles.span}>全部</span>
								<span onClick={setClick.bind(this,0)} className={tab1_Index==0?styles.spanActive:styles.span}>日常</span>
								<span onClick={setClick.bind(this,1)} className={tab1_Index==1?styles.spanActive:styles.span}>随机</span>
							</div>
							<div className={styles.topcontR}>
								<DatePicker.RangePicker
									onChange={showVal} 
									defaultValue={[moment(tab1_startTime, dateFormat), moment(tab1_endTime, dateFormat)]}
									format={dateFormat}
								/>
							</div>
							<div>
								<Button type="primary" className={styles.marginRight} onClick={ExportToExcel.bind(this,columns2,'类型合格率分析',typeData)}>导出报表</Button>
							</div>
						</div>
						<div className={styles.analyCompany}>
							<Row style={{width:'100%',textAlign:'center',lineHeight:'30px'}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
								<Col className="gutter-row" span={2}>
									<span>颜色分布</span>
								</Col>
								<Col className="gutter-row" span={2}>
									<span className={analy.color1}></span>
									<span className={analy.top}>0%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color2}></span>
									<span className={analy.top}>1%-{colorVal1}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color3}></span>
									<span className={analy.top}>{colorVal1}%-{colorVal2}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color4}></span>
									<span className={analy.top}>{colorVal2}%-{colorVal3}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color5}></span>
									<span className={analy.top}>{colorVal3}%-{colorVal4}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color6}></span>
									<span className={analy.top}>{colorVal4}%-100%</span>
								</Col>
							</Row>
						</div>
						{setTables2()}
                        <Table 
                            columns={columns2} 
                            dataSource={typeData}
                            pagination={true}
                        />
					</Card>
				</div>
                :null
        }

		{
            selected==2?
				<div className={styles.analyCont}>
					<Card title='地区合格率分析' bordered={false}>
						<div className={analy.tipWeek}>
							提示: 手动设置周期颜色分布值
						</div>
						<div className={styles.topcont}>
							<div className={analy.colorWeek} onClick={setColor}>
								设置分布颜色
							</div>
							<div className={styles.topcontL}>
								<span onClick={setClick.bind(this,-1)} className={tab1_Index==-1?styles.spanActive:styles.span}>全部</span>
								<span onClick={setClick.bind(this,0)} className={tab1_Index==0?styles.spanActive:styles.span}>日常</span>
								<span onClick={setClick.bind(this,1)} className={tab1_Index==1?styles.spanActive:styles.span}>随机</span>
							</div>
							<div className={styles.topcontR}>
								<DatePicker.RangePicker
									onChange={showVal} 
									defaultValue={[moment(tab1_startTime, dateFormat), moment(tab1_endTime, dateFormat)]}
									format={dateFormat}
								/>
							</div>
							<div>
								<Button type="primary" className={styles.marginRight} onClick={ExportToExcel.bind(this,columns3,'地区合格率分析',areaData)}>导出报表</Button>
							</div>
						</div>
						<div className={styles.analyCompany}>
							<Row style={{width:'100%',textAlign:'center',lineHeight:'30px'}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
								<Col className="gutter-row" span={2}>
									<span>颜色分布</span>
								</Col>
								<Col className="gutter-row" span={2}>
									<span className={analy.color1}></span>
									<span className={analy.top}>0%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color2}></span>
									<span className={analy.top}>1%-{colorVal1}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color3}></span>
									<span className={analy.top}>{colorVal1}%-{colorVal2}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color4}></span>
									<span className={analy.top}>{colorVal2}%-{colorVal3}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color5}></span>
									<span className={analy.top}>{colorVal3}%-{colorVal4}%</span>
								</Col>
								<Col className="gutter-row" span={4}>
									<span className={analy.color6}></span>
									<span className={analy.top}>{colorVal4}%-100%</span>
								</Col>
							</Row>
						</div>
						{setTables3()}
                        <Table 
                            columns={columns3} 
                            dataSource={areaData}
                            pagination={true}
                        />

					</Card>
				</div>
                :null
        }

		<Modal
			title="设置颜色分布"
			visible={modalVisible}
			onOk={okHandle}
			onCancel={cancle}
			width='600px'
		>
			<div>
				<Row style={{width:'100%',textAlign:'center',lineHeight:'30px'}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
					<Col className="gutter-row" span={4}>
						<span className={analy.color1}></span>
					</Col>
					<Col className="gutter-row" span={4}>
						<span className={analy.color2}></span>
					</Col>
					<Col className="gutter-row" span={4}>
						<span className={analy.color3}></span>
					</Col>
					<Col className="gutter-row" span={4}>
						<span className={analy.color4}></span>
					</Col>
					<Col className="gutter-row" span={4}>
						<span className={analy.color5}></span>
					</Col>
					<Col className="gutter-row" span={4}>
						<span className={analy.color6}></span>
					</Col>
				</Row>
				<Row style={{width:'100%',textAlign:'center',lineHeight:'30px'}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>

					<Col className="gutter-row" span={4}>
						<span className={analy.top}>0%</span>
					</Col>
					<Col className="gutter-row" span={4}>
						<Input placeholder={colorVal1} onBlur={set0}/>
						<span className={analy.top}>0%-{cashColorVal1}%</span>
					</Col>
					<Col className="gutter-row" span={4}>
						<Input placeholder={colorVal2}  onBlur={set1}/>
						<span className={analy.top}>{cashColorVal1}%-{cashColorVal2}%</span>
					</Col>
					<Col className="gutter-row" span={4}>
						<Input placeholder={colorVal3} onBlur={set2}/>
						<span className={analy.top}>{cashColorVal2}%-{cashColorVal3}%</span>
					</Col>
					<Col className="gutter-row" span={4}>
						<Input placeholder={colorVal4}  onBlur={set3}/>
						<span className={analy.top}>{cashColorVal3}%-{cashColorVal4}%</span>
					</Col>
					<Col className="gutter-row" span={4}>
						<span className={analy.top}>{colorVal4}%-100%</span>
					</Col>
				</Row>
			</div>
		</Modal>

	</Fragment>
    )
}

export default connect(({ analyCycle }) => ({ analyCycle }))(AnalyCycle)
