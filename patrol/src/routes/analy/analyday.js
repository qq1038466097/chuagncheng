import React from 'react';
import { connect } from 'dva';
import { Table, Card,Button, Divider,DatePicker,Row, Col,Icon,Tooltip  } from 'antd';
import styles from '../main.less';
import analy from './analy.less';
import moment from 'moment'
import ExportJsonExcel from 'js-export-excel';

let _format = 'YYYY-MM-DD'

const Analyday = ({
	analyday,
	dispatch,
})=>{
	let { 
		tab1_Index, //页面第一个选中，全部，suiji
		times,
		datas1,  //统计概览
		datas2,  //list数据
	} = analyday;

    //赛选随机
    const setClick=(k)=>{
        //赛选条件
        dispatch({
            type: 'analyday/tab1_Index',
            payload: k,
        })
        getStis(times,k)
		getList(times,k)
	}
	
	//请求统计数据
	const getStis=(_time,_k)=>{
		let _ars={}
		_ars.day = _time
		_ars.roundPoint = _k
		dispatch({
			type: 'analyday/daySummarys',
			payload: _ars
		})
	}

	//请求列表数据
	const getList=(_time,_k)=>{
		let _ars2={}
		_ars2.day = _time
		_ars2.roundPoint = _k
		_ars2.order='desc'
		_ars2.sort='cycle_error_count'
		_ars2.pageIndex=1
		_ars2.pageSize=5000
		dispatch({
			type: 'analyday/dayLists',
			payload: _ars2
		})
	}

    //选中时间
    const showVal=(val)=>{
		let _day = moment(val).format(_format)
		//全部
		dispatch({
            type: 'analyday/tab1_Index',
            payload: -1,
        })
		dispatch({
			type: 'analyday/times',
			payload: _day
		})
		getStis(_day,tab1_Index)
		getList(_day,tab1_Index)
    }

	const showStatistics4=()=>{
        let _totalData = datas1; //统计概览shuju
		if(JSON.stringify(_totalData)=='{}'){
			return false
		}
		//项目合格率
		let ztZgLv = parseInt(((_totalData.cycle_all_item_count-_totalData.cycle_error_count)/_totalData.cycle_all_item_count)*100)||0
		//整改率
		let _hg= parseInt((_totalData.cycle_fix_count/_totalData.cycle_error_count)*100)||0

        let _shows=<Row style={{width:'100%'}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
			<Col className="gutter-row" span={6}>
				<div className={analy.style}>
					<p className={analy.title}>
					问题项目
						<Tooltip placement="topLeft" title={'问题项目'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.numTotal}>{_totalData.cycle_fault_item_count}</p>
					<div className={analy.totalCont}></div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>问题类型 {_totalData.cycle_fault_rule_count}</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style + ' ' + analy.styleblue}>
					<p className={analy.title}>
					巡防项目数
						<Tooltip placement="topLeft" title={'巡防数'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.numTotal}>{_totalData.cycle_all_item_count}</p>
					<div className={analy.totalCont}>
						<span>累计项目总数 {_totalData.cumulative_all_item_count}</span>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>
						累计类型数 {_totalData.cumulative_all_rule_count}
					</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style+ ' ' + analy.styleyellow} >
					<p className={analy.title}>
						项目合格率
						<Tooltip placement="topLeft" title={'合格率'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.num}>{ztZgLv}%</p>
					<div className={analy.qualifiedAll}>
						<div className={analy.qualified} style={{width:''+ztZgLv+'%'}}>
						</div>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>
						项目问题数 {_totalData.cumulative_error_count}
					</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style+ ' ' + analy.stylegreen} >
					<p className={analy.title}>
						整改率
						<Tooltip placement="topLeft" title={'整改率'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.num}>{_hg}%</p>
					<div className={analy.zgAll}>
						<div className={analy.zgs} style={{width:''+_hg+'%'}}></div>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>
						整改问题数 {_totalData.cycle_fix_count}
					</p>
				</div>
			</Col>
		</Row>
        return _shows
	}
	
	const columns = [
		{
			title: '序号',
			dataIndex: 'key',
			key: 'key',
			align: 'center',
			width: '60px'
		},
		{
			title: '问题项目',
			dataIndex: 'item_text',
			key: 'item_text',
			align: 'left',
		},
		{
			title: '问题类型',
			dataIndex: 'rule_name',
			key: 'rule_name',
			align: 'left',
			width: '12%'
		},
		{
			title: '问题数',
			dataIndex: 'cycle_error_count',
			key: 'cycle_error_count',
			align: 'center',
			width: '120px',
			sorter: (a, b) => a.cycle_error_count - b.cycle_error_count,
		},
	];

	//报表下载
	const ExportToExcel = (cloum,title,_datas) => {
		let _name = title+' '+times;
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
		<div>
		{
			times!==''?
			<div className={styles.analyCont}>
				<Card title='日报' bordered={false}>
					<div className={styles.topcont}>
						<div className={analy.exception}>
							<Icon type="exception" />
						</div>
						<div className={styles.topcontL}>

							<span onClick={setClick.bind(this,-1)} className={tab1_Index==-1?styles.spanActive:styles.span}>全部</span>
							<span onClick={setClick.bind(this,0)} className={tab1_Index==0?styles.spanActive:styles.span}>日常</span>
							<span onClick={setClick.bind(this,1)} className={tab1_Index==1?styles.spanActive:styles.span}>随机</span>
						</div>
						<div className={styles.topcontR}>
							<DatePicker onChange={showVal} defaultValue={moment(times,_format)} />
						</div>
						<div>
							<Button type="primary" className={styles.marginRight} onClick={ExportToExcel.bind(this,columns,'日报分析',datas2)}>导出报表</Button>
						</div>
					</div>
					<div className={styles.analyCompany}>
						{showStatistics4()}
					</div>
				</Card>
				<Card title='列表数据' bordered={false} style={{ marginTop: '20px'}}>
					<Table
						columns={columns} 
						dataSource={datas2}
						pagination={true}
					/>
				</Card>
			</div>
			:null
		}
		</div>
	)
}

export default connect(({ analyday }) => ({ analyday }))(Analyday)
