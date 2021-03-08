import React, { PureComponent } from 'react';
import { Card,Select,Row, Col,Icon,Tooltip ,Divider,Table,Pagination,Button } from 'antd';

import styles from '../../main.less';
import analy from '../analy.less';
import { 
	$ ,
	getXflv, //巡防率
	getZglv,//整改率
	getHglv, //合格率
	getXfnum, //巡防数
	getPronum, //问题数
} from '../../../utils/config.js'

const ReactHighcharts = require('react-highcharts');
import ExportJsonExcel from 'js-export-excel';

class ShowContent extends PureComponent{
	constructor(props) {
	    super(props);
	    this.state = {
			...this.props,
			vals1: [],
			vals2: [],
			vals3: [],
			vals4: [],
			vals5: [],
			vals6: [],
		}
	    this.getRote = this.getRote.bind(this)
	}

	//赛选数据-全部单位
	newDatas=(k,st,ed)=>{
		//全部
		let _selected = this.props.selected
		let _dispatch = this.props.dispatch
		//重新请求数据接口
		let _reports = this.props.reports
		let _ars={}
		_ars.startTime = st
		_ars.endTime = ed
		_ars.sort = this.props.sorts  //排序方式
		_ars.order = 'desc'
		_ars.roundPoint= k
		if(_selected==6){	
			//项目指标
			_ars.pageIndex=1
			_ars.pageSize=5000
		}
		//从新请求数据
		_dispatch({
			type: _reports,
			payload: _ars,
		})
	}

	//单个-单位详情数据
	newDatas2=(areaName,st,ed,index)=>{
		let _dispatch = this.props.dispatch
		//重新请求数据接口
		let _reports = this.props.typeName_detail
		let _selected = this.props.selected
		let _ars={}
		if(areaName==0||areaName=='整体'){
			areaName=''
		}
		if(_selected==0){
			_ars.startTime = st
			_ars.endTime =ed
			_ars.orgId = areaName
			_ars.roundPoint= index
		}else if(_selected==1){
			_ars.endTime=ed
			_ars.startTime=st
			_ars.pointType=areaName
			_ars.roundPoint=index
		}else if(_selected==2){
			_ars.startTime = st
			_ars.endTime =ed
			_ars.areaName = areaName
			_ars.roundPoint= index
		}else if(_selected==6){
			//项目指标报表-统计概览
			_ars.endTime=ed
			_ars.startTime=st
			_ars.roundPoint=index
		}
		//从新请求数据
		_dispatch({
			type: _reports,
			payload: _ars,
		})
	}

	//根据id，获取单位名字
	getNames=(ids)=>{
		let _datas = this.props.datas
		let _names=''
		for(let i=0; i<_datas.length; i++){
			if(_datas[i].org_id == ids){
				_names = _datas[i].org_name
				break
			}
		}
		return _names
	}

	//赛选随机
	setClick=(k)=>{
		let _dispatch = this.props.dispatch
		let _typeName = this.props.typeName
		let _selected = this.props.selected
		let _type2 = this.props.typeName_company
		//赛选条件
		_dispatch({
			type: _typeName,
			payload: k,
		})

		_dispatch({
			type: _type2,
			payload: 0,
		})

		if(_selected==6){
			//项目指标报表
			this.newDatas(k,this.props.startTime,this.props.endTime);
			this.newDatas2('',this.props.startTime,this.props.endTime,k);
			return false
		}
		//let _names = this.props.company
		//判断是全部 还是
		if(_selected<3){
			//全部
			this.newDatas(k,this.props.startTime,this.props.endTime);
			this.newDatas2('',this.props.startTime,this.props.endTime,k);
		}else{
			this.newDatas(k,this.props.startTime,this.props.endTime);
		}
		//清楚滚动,重置
		$('.contOver').css('margin-left',0)
		_dispatch({
			type: this.props.typeName_tab1_tabul,
			payload: 0,
		})
	}

	//选中时间
	showVal=(k)=>{
		let _weeks = this.props.weeks
		let _time1 = _weeks[k].startTime
		let _time2 = _weeks[k].endTime
		let _typeName = this.props.typeName_setTime
		let _dispatch = this.props.dispatch
		let _selected = this.props.selected
		let _index = this.props.tabIndex
		let _type2 = this.props.typeName_company
		_dispatch({
			type: _typeName,
			time1: _time1,
			time2: _time2,
			time3: k
		})
		_dispatch({
			type: _type2,
			payload: 0,
		})
		//let _names = this.props.company;
		if(_selected<3){
			//全部
			this.newDatas2('',_time1,_time2,_index);
			this.newDatas(_index,_time1,_time2);
		}else{
			this.newDatas(k,this.props.startTime,this.props.endTime);
		}
	}

	//选中单位
	chooseCom=(k)=>{
		let _typeName = this.props.typeName_company
		let _dispatch = this.props.dispatch
		let _selected = this.props.selected
		_dispatch({
			type: _typeName,
			payload: k,
		})
		let _names;
		if(_selected==0){
			_names = k
			//_names = this.getNames(k)
		}else if(_selected==1){
			_names = k
		}else if(_selected==2){
			_names = k
		}
		this.newDatas2(_names,this.props.startTime,this.props.endTime,this.props.tabIndex)
	}

	//设置圆饼百分比
	getRote=(a,name)=>{
		if(a<=50){
			let _num = (a*3.6 - 180)
			$('.'+name+' .right_deg').css('transform','rotate('+_num+'deg)')
			$('.'+name+' .left_deg').css('transform','rotate(-180deg)')
		}else{
			let _num = (a-50)*3.6-180
			$('.'+name+' .right_deg').css('transform','rotate(0deg)')
			$('.'+name+' .left_deg').css('transform','rotate('+_num+'deg)')
		}
	}

	//单位合格
	showCompany=()=>{
		this.state.vals1=[]
		let _company = this.props.company
		let _data=this.props.datas
		let _shows=[]
		for(let i=0; i<_data.length; i++){
			let _newdata = _data[i]
			let _nums = parseInt((_newdata.pass_count/_newdata.total_count)*100);
			let _show = <div onClick={this.chooseCom.bind(this,_newdata.org_id)} className={_company==_newdata.org_id?[styles.contbox+' ' +styles.contboxActive]:styles.contbox} key={i}>
					<div className={styles.title}>{_newdata.org_name}</div>
					<div className={styles.contbtm}>
						<div className={styles.left}>
							<div className={styles.text}>合格率</div>
							<div className={styles.num}>{_nums}%</div>
						</div>
						<div className={styles.rights}>
							<div className={[styles.pie + ' pie '+'pie'+i]}>
								<div className={[styles.circle + ' circle']}></div>
								<div className={[styles.left + ' left']}>
									<div className={[styles.left_deg + ' left_deg']}></div>
								</div>
								<div className={[styles.right + ' right']}>
									<div className={[styles.right_deg + ' right_deg']}></div>
								</div>
								
							</div>
						</div>
					</div>
				</div>
				let _ars={num:_nums,name:'pie'+i}
				this.state.vals1.push(_ars)
			_shows.push(_show)
		}
        return _shows
	}
	//单位整改
	showCompany2=()=>{
		this.state.vals2=[]
		let _company = this.props.company
		let _data=this.props.datas
		let _shows=[]
		for(let i=0; i<_data.length; i++){
			let _newdata = _data[i]
			let _nums = this.getZheng(_data[i]);
			let _show = <div onClick={this.chooseCom.bind(this,_newdata.org_id)} className={_company==_newdata.org_id?[styles.contbox+' ' +styles.contboxActive]:styles.contbox} key={i}>
					<div className={styles.title}>{_newdata.org_name}</div>
					<div className={styles.contbtm}>
						<div className={styles.left}>
							<div className={styles.text}>整改率</div>
							<div className={styles.num}>{_nums}%</div>
						</div>
						<div className={styles.rights}>
							<div className={[styles.pie + ' pie '+'pies'+i]}>
								<div className={[styles.circle + ' circle']}></div>
								<div className={[styles.left + ' left']}>
									<div className={[styles.left_deg + ' left_deg']}></div>
								</div>
								<div className={[styles.right + ' right']}>
									<div className={[styles.right_deg + ' right_deg']}></div>
								</div>
								
							</div>
						</div>
					</div>
				</div>
				let _ars={num:_nums,name:'pies'+i}
				this.state.vals2.push(_ars)
			_shows.push(_show)
		}
		return _shows
	}

	//类型合格
	showCompany3=()=>{
		this.state.vals3=[]
		let _company = this.props.company
		let _data=this.props.datas
		let _shows=[]
		for(let i=0; i<_data.length; i++){
			let _newdata = _data[i]
			let _nums = parseInt((_newdata.pass_count/_newdata.total_count)*100);
			let _show = <div onClick={this.chooseCom.bind(this,_newdata.point_type)} className={_company==_newdata.point_type?[styles.contbox+' ' +styles.contboxActive]:styles.contbox} key={i}>
					<div className={styles.title}>{_newdata.point_type_name}</div>
					<div className={styles.contbtm}>
						<div className={styles.left}>
							<div className={styles.text}>合格率</div>
							<div className={styles.num}>{_nums}%</div>
						</div>
						<div className={styles.rights}>
							<div className={[styles.pie + ' pie '+'pieb'+i]}>
								<div className={[styles.circle + ' circle']}></div>
								<div className={[styles.left + ' left']}>
									<div className={[styles.left_deg + ' left_deg']}></div>
								</div>
								<div className={[styles.right + ' right']}>
									<div className={[styles.right_deg + ' right_deg']}></div>
								</div>
								
							</div>
						</div>
					</div>
				</div>
				let _ars={num:_nums,name:'pieb'+i}
				this.state.vals3.push(_ars)
			_shows.push(_show)
		}
		return _shows
	}

	//类型整改
	showCompany4=()=>{
		this.state.vals4=[]
		let _company = this.props.company
		let _data=this.props.datas
		let _shows=[]
		for(let i=0; i<_data.length; i++){
			let _newdata = _data[i]
			let _nums = this.getZheng(_data[i]);
			let _show = <div onClick={this.chooseCom.bind(this,_newdata.point_type)} className={_company==_newdata.point_type?[styles.contbox+' ' +styles.contboxActive]:styles.contbox} key={i}>
					<div className={styles.title}>{_newdata.point_type_name}</div>
					<div className={styles.contbtm}>
						<div className={styles.left}>
							<div className={styles.text}>整改率</div>
							<div className={styles.num}>{_nums}%</div>
						</div>
						<div className={styles.rights}>
							<div className={[styles.pie + ' pie '+'piea'+i]}>
								<div className={[styles.circle + ' circle']}></div>
								<div className={[styles.left + ' left']}>
									<div className={[styles.left_deg + ' left_deg']}></div>
								</div>
								<div className={[styles.right + ' right']}>
									<div className={[styles.right_deg + ' right_deg']}></div>
								</div>
								
							</div>
						</div>
					</div>
				</div>
				let _ars={num:_nums,name:'piea'+i}
				this.state.vals4.push(_ars)
			_shows.push(_show)
		}
		return _shows
	}

	//地区合格
	showCompany5=()=>{
		this.state.vals5=[]
		let _company = this.props.company
		let _data=this.props.datas
		let _shows=[]
		for(let i=0; i<_data.length; i++){
			let _newdata = _data[i]
			let _nums = parseInt((_newdata.pass_count/_newdata.total_count)*100);
			let _show = <div onClick={this.chooseCom.bind(this,_newdata.area_name)} className={_company==_newdata.area_name?[styles.contbox+' ' +styles.contboxActive]:styles.contbox} key={i}>
					<div className={styles.title}>{_newdata.area_name}</div>
					<div className={styles.contbtm}>
						<div className={styles.left}>
							<div className={styles.text}>合格率</div>
							<div className={styles.num}>{_nums}%</div>
						</div>
						<div className={styles.rights}>
							<div className={[styles.pie + ' pie '+'piec'+i]}>
								<div className={[styles.circle + ' circle']}></div>
								<div className={[styles.left + ' left']}>
									<div className={[styles.left_deg + ' left_deg']}></div>
								</div>
								<div className={[styles.right + ' right']}>
									<div className={[styles.right_deg + ' right_deg']}></div>
								</div>
								
							</div>
						</div>
					</div>
				</div>
				let _ars={num:_nums,name:'piec'+i}
				this.state.vals5.push(_ars)
			_shows.push(_show)
		}
		return _shows
	}

	//地区整改
	showCompany6=()=>{
		this.state.vals6=[]
		let _company = this.props.company
		let _data=this.props.datas
		let _shows=[]
		for(let i=0; i<_data.length; i++){
			let _newdata = _data[i]
			let _nums = this.getZheng(_data[i]);
			let _show = <div onClick={this.chooseCom.bind(this,_newdata.area_name)} className={_company==_newdata.area_name?[styles.contbox+' ' +styles.contboxActive]:styles.contbox} key={i}>
					<div className={styles.title}>{_newdata.area_name}</div>
					<div className={styles.contbtm}>
						<div className={styles.left}>
							<div className={styles.text}>整改率</div>
							<div className={styles.num}>{_nums}%</div>
						</div>
						<div className={styles.rights}>
							<div className={[styles.pie + ' pie '+'pied'+i]}>
								<div className={[styles.circle + ' circle']}></div>
								<div className={[styles.left + ' left']}>
									<div className={[styles.left_deg + ' left_deg']}></div>
								</div>
								<div className={[styles.right + ' right']}>
									<div className={[styles.right_deg + ' right_deg']}></div>
								</div>
								
							</div>
						</div>
					</div>
				</div>
				let _ars={num:_nums,name:'pied'+i}
				this.state.vals6.push(_ars)
			_shows.push(_show)
		}
		return _shows
	}

	//计算整改率
	getZheng=(_data)=>{
		let _nums
		if((_data.stay_review+_data.fixing+_data.stay_fix)==0){
			_nums = 0
		}else{
			_nums = parseInt((_data.stay_review/(_data.stay_review+_data.fixing+_data.stay_fix))*100);
			//_nums = parseInt((_data.stay_review/(_data.total_count-_data.pass_count-_data.stay_check))*100);
		}
		return _nums
	}

	setTAbles=()=>{
		let _vals
		let _selected = this.props.selected
		if(_selected==0){
			_vals = this.state.vals1.concat(this.state.vals2)
		}else if(_selected==1){
			_vals = this.state.vals3.concat(this.state.vals4)
		}else if(_selected==2){
			_vals = this.state.vals5.concat(this.state.vals6)
		}
		setTimeout(()=>{
			for(let i=0; i<_vals.length; i++){
				this.getRote(_vals[i].num,_vals[i].name)
			}
		},50)
	}

	//左右切换事件
	tabChanges=(k)=>{
		let _dispatch = this.props.dispatch
		let _maxwidth=181*this.props.datas.length;
		let _width2 = $('.conts').width();
		let _number = parseInt(_maxwidth/_width2);
		let _index = this.props.tab1_tabul
		let _typeName = this.props.typeName_tab1_tabul
		let _comp = this.props.isCompont
		//最多几页
		if(k==0){
			//左边点击
			if(_index!==0){
				_index = _index -1
				_dispatch({
					type: _typeName,
					payload: _index,
				})
				$('.contOver'+_comp).css('margin-left',-_width2*_index)
			}
		}else{
			//右边点击
			if(_number!==_index){
				_index= _index+1
				$('.contOver'+_comp).css('margin-left',-_width2*_index)
				_dispatch({
					type: _typeName,
					payload: _index,
				})
			}
		}
	}

	children=()=>{
		let _week = this.props.weeks
		let _children = []
		_week.map((item,i)=>{
			_children.push(<Select.Option key={i} value={i}>{item.startTime} - {item.endTime}</Select.Option>)
		})
		return _children
	}

	ExportToExcel = (datas,title) => {
		let option={}
		let _company = this.props.company
		let _name;
		if(_company==0||_company=='整体'){
			_name=title
		}else{
			_name = _company+'报表'
		}
		let _datas = this.props.datas
		let dataTable = []
		if (_datas) {
		  for (let i in _datas) {
			dataTable.push(_datas[i]);
		  }
		}
		option.fileName = _name
		//计算表头
		let _filter=[]
		let _header=[]
		for(let j in datas){
			_filter.push(datas[j].key)
			_header.push(datas[j].title)
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

	//单位报表
    showStatistics1=()=>{
		let _totalData = this.props.totalData; //总数据
		if(JSON.stringify(_totalData)=='{}'){
			return false
		}
		let _data = this.props.datas;
		let _length = _data.length
		let xfs = 0; //完成巡防率 100%
        let zgs = 0; //完成整改 100%
		let hgs = 0;  //合格率>80
		let zg = 20

        // 整体巡防率
        let ztXflPre= getXflv(_totalData);
        // 整体巡防数
        let ztXfs = getXfnum(_totalData);
        // 整体整改率
		let ztZgLv = getZglv(_totalData);
		//问题数
		let _problem=getPronum(_totalData)
		let _hg = getHglv(_totalData);
		for(let i = 0;i<_length;i++){
			let _nums = getXflv(_data[i])
			let _nums2 = getZglv(_data[i])
			let _hege = getHglv(_data[i])
			if(_nums==100){
				xfs+=1
			}
			if(_nums2==100){
				zgs+=1
			}
			if(_hege>=80){
				hgs+=1
			}
		}

        let _shows=<Row style={{width:'100%'}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
			<Col className="gutter-row" span={6}>
				<div className={analy.style}>
					<p className={analy.title}>
						单位
						<Tooltip placement="topLeft" title={'单位'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.numTotal}>{_length+1}</p>
					<div className={analy.totalCont}>
						<span>完成巡防 {xfs}</span>
						<span style={{float:'right'}}>完成整改 {zgs}</span>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>合格率80%以上 {hgs}</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style + ' ' + analy.styleblue}>
					<p className={analy.title}>
						巡防率
						<Tooltip placement="topLeft" title={'巡防率'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.num}>{ztXflPre}%</p>
					<div className={analy.qualifiedAll}>
						<div className={analy.qualified} style={{width:''+ztXflPre+'%'}}>

						</div>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>
						巡防数 {ztXfs}
						<span style={{float:'right'}}>点位数 {_totalData.total_count}</span>
					</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style+ ' ' + analy.styleyellow} >
					<p className={analy.title}>
						整改率
						<Tooltip placement="topLeft" title={'整改率'}>
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
						问题数 {_problem}
						<span style={{float:'right'}}>整改数 {_totalData.fix_count}</span>
					</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style+ ' ' + analy.stylegreen} >
					<p className={analy.title}>
						合格率
						<Tooltip placement="topLeft" title={'合格率'}>
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
						合格数 {_totalData.pass_count}
					</p>
				</div>
			</Col>
		</Row>
        return _shows
    }

    //单位报表
    showStatistics2=()=>{
        let _totalData = this.props.totalData; //总数据
		if(JSON.stringify(_totalData)=='{}'){
			return false
		}
		let _data = this.props.datas;
		let _length = _data.length
		let xfs = 0; //完成巡防率 100%
        let zgs = 0; //完成整改 100%
		let hgs = 0;  //合格率>80
		let zg = 20

        // 整体巡防率
        let ztXflPre= getXflv(_totalData);
        // 整体巡防数
        let ztXfs = getXfnum(_totalData);
        // 整体整改率
		let ztZgLv = getZglv(_totalData);
		//问题数
		let _problem=getPronum(_totalData)
		let _hg = getHglv(_totalData);
		for(let i = 0;i<_length;i++){
			let _nums = getXflv(_data[i])
			let _nums2 = getZglv(_data[i])
			let _hege = getHglv(_data[i])
			if(_nums==100){
				xfs+=1
			}
			if(_nums2==100){
				zgs+=1
			}
			if(_hege>=80){
				hgs+=1
			}
		}

        let _shows=<Row style={{width:'100%'}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
			<Col className="gutter-row" span={6}>
				<div className={analy.style}>
					<p className={analy.title}>
						类型
						<Tooltip placement="topLeft" title={'类型'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.numTotal}>{_length+1}</p>
					<div className={analy.totalCont}>
						<span>完成巡防 {xfs}</span>
						<span style={{float:'right'}}>完成整改 {zgs}</span>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>合格率80%以上 {hgs}</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style + ' ' + analy.styleblue}>
					<p className={analy.title}>
						巡防率
						<Tooltip placement="topLeft" title={'巡防率'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.num}>{ztXflPre}%</p>
					<div className={analy.qualifiedAll}>
						<div className={analy.qualified} style={{width:''+ztXflPre+'%'}}>

						</div>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>
						巡防数 {ztXfs}
						<span style={{float:'right'}}>点位数 {_totalData.total_count}</span>
					</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style+ ' ' + analy.styleyellow} >
					<p className={analy.title}>
						整改率
						<Tooltip placement="topLeft" title={'整改率'}>
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
						问题数 {_problem}
						<span style={{float:'right'}}>整改数 {_totalData.fix_count}</span>
					</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style+ ' ' + analy.stylegreen} >
					<p className={analy.title}>
						合格率
						<Tooltip placement="topLeft" title={'合格率'}>
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
						合格数 {_totalData.pass_count}
					</p>
				</div>
			</Col>
		</Row>
        return _shows
    }

    //单位报表
    showStatistics3=()=>{
        let _totalData = this.props.totalData; //总数据
		if(JSON.stringify(_totalData)=='{}'){
			return false
		}
		let _data = this.props.datas;
		let _length = _data.length
		let xfs = 0; //完成巡防率 100%
        let zgs = 0; //完成整改 100%
		let hgs = 0;  //合格率>80
		let zg = 20

        // 整体巡防率
        let ztXflPre= getXflv(_totalData);
        // 整体巡防数
        let ztXfs = getXfnum(_totalData);
        // 整体整改率
		let ztZgLv = getZglv(_totalData);
		//问题数
		let _problem=getPronum(_totalData)
		let _hg = getHglv(_totalData);
		for(let i = 0;i<_length;i++){
			let _nums = getXflv(_data[i])
			let _nums2 = getZglv(_data[i])
			let _hege = getHglv(_data[i])
			if(_nums==100){
				xfs+=1
			}
			if(_nums2==100){
				zgs+=1
			}
			if(_hege>=80){
				hgs+=1
			}
		}

        let _shows=<Row style={{width:'100%'}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
			<Col className="gutter-row" span={6}>
				<div className={analy.style}>
					<p className={analy.title}>
					地区
						<Tooltip placement="topLeft" title={'地区'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.numTotal}>{_length+1}</p>
					<div className={analy.totalCont}>
						<span>完成巡防 {xfs}</span>
						<span style={{float:'right'}}>完成整改 {zgs}</span>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>合格率80%以上 {hgs}</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style + ' ' + analy.styleblue}>
					<p className={analy.title}>
						巡防率
						<Tooltip placement="topLeft" title={'巡防率'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.num}>{ztXflPre}%</p>
					<div className={analy.qualifiedAll}>
						<div className={analy.qualified} style={{width:''+ztXflPre+'%'}}>

						</div>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>
						巡防数 {ztXfs}
						<span style={{float:'right'}}>点位数 {_totalData.total_count}</span>
					</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style+ ' ' + analy.styleyellow} >
					<p className={analy.title}>
						整改率
						<Tooltip placement="topLeft" title={'整改率'}>
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
						问题数 {_problem}
						<span style={{float:'right'}}>整改数 {_totalData.fix_count}</span>
					</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style+ ' ' + analy.stylegreen} >
					<p className={analy.title}>
						合格率
						<Tooltip placement="topLeft" title={'合格率'}>
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
						合格数 {_totalData.pass_count}
					</p>
				</div>
			</Col>
		</Row>
        return _shows
	}
	
	//项目指标报表
    showStatistics4=()=>{
        let _totalData = this.props.totalData; //统计概览shuju
		if(JSON.stringify(_totalData)=='{}'){
			return false
		}
		//本周问题项目数占比
		let hgs = parseInt((_totalData.cycle_fault_item_count/_totalData.cycle_all_item_count)*100)||0
		//本周问题类型数占比
		let ztXfs = parseInt((_totalData.cycle_fault_rule_count/_totalData.cycle_all_rule_count)*100)||0
		//累计整改率
		let ztZgLv = parseInt((_totalData.cumulative_fix_count/_totalData.cumulative_error_count)*100)||0
		//周期整改率
		let _hg= parseInt((_totalData.cycle_fix_count/_totalData.cycle_error_count)*100)||0

        let _shows=<Row style={{width:'100%'}} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
			<Col className="gutter-row" span={6}>
				<div className={analy.style}>
					<p className={analy.title}>
					本周问题项目
						<Tooltip placement="topLeft" title={'本周问题项目'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.numTotal}>{_totalData.cycle_fault_item_count}</p>
					<div className={analy.totalCont}>
						<span>总项目数 {_totalData.cycle_all_item_count	}</span>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>本周问题项目数占比 {hgs}%</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style + ' ' + analy.styleblue}>
					<p className={analy.title}>
					本周问题类型数
						<Tooltip placement="topLeft" title={'本周问题类型数'}>
							<Icon  className={analy.iconRight} type="exclamation-circle" />
						</Tooltip>
					</p>
					<p className={analy.numTotal}>{_totalData.cycle_fault_rule_count}</p>
					<div className={analy.totalCont}>
						<span>总类型数 {_totalData.cycle_all_rule_count}</span>
					</div>
					<Divider orientation="left" className={analy.xian}>
					</Divider>
					<p  className={analy.text}>
						本周问题类型数占比 {ztXfs}%
					</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style+ ' ' + analy.styleyellow} >
					<p className={analy.title}>
						累计整改率
						<Tooltip placement="topLeft" title={'累计整改率'}>
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
						问题数 {_totalData.cumulative_error_count}
						<span style={{float:'right'}}>整改数 {_totalData.cumulative_fix_count}</span>
					</p>
				</div>
			</Col>
			<Col className="gutter-row" span={6}>
				<div className={analy.style+ ' ' + analy.stylegreen} >
					<p className={analy.title}>
						本周整改率
						<Tooltip placement="topLeft" title={'本周整改率'}>
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
						问题数 {_totalData.cycle_error_count}
						<span style={{float:'right'}}>整改数 {_totalData.cycle_fix_count}</span>
					</p>
				</div>
			</Col>
		</Row>
        return _shows
    }

	render() {
		let _spanIndex = this.props.tabIndex
		let _passdata=[]
		let _xcdata=[]
		let _name=[]
		let _data = this.props.datas
		let _detail = this.props.detail
		let _company = this.props.company

		//报表表头
        let columns = [];
		let data_dw = [];

		//巡查率数据
		//合格率数据
		let config;
		if(this.props.isCompont==1){
			//第一个组件
			let _datas = _detail
			//单位详情
			for(let i=0; i<_datas.length; i++){
				//合格率
				let _pass= parseInt((_datas[i].pass_count/_datas[i].total_count)*100)
				//巡查率
				let _xc= parseInt(((_datas[i].total_count-_datas[i].stay_check)/_datas[i].total_count)*100)
				_passdata.push(_pass)
				_xcdata.push(_xc)
				_name.push(_datas[i].count_time.substring(5,16))
			}
			config = {
				credits: {
					enabled: false
				},
				chart: {
					height: 250,
				},
				xAxis: {
					categories: _name
				},
				title: {
					text:null,
				},
				legend: {
					  enabled: false
				},
				yAxis: {
					title: {
						enabled: false
					},
				},
				series: [{
					name:'合格率',
					data: _passdata
				},{
					name:'巡查率',
					data: _xcdata
				}]
			};
		}
		else if(this.props.isCompont==2){
			//第二个组件
			let _datas = _detail
			//单位详情
			for(let i=0; i<_datas.length; i++){
				//发现问题数量
				let _pass= _datas[i].fault_count + _datas[i].grid_count + _datas[i].fix_count
				//整改数
				let _xc= _datas[i].fix_count
				_passdata.push(_pass)
				_xcdata.push(_xc)
				_name.push(_datas[i].count_time.substring(5,16))
			}
			config = {
				credits: {
					enabled: false
				},
				chart: {
					height: 250,
				},
				xAxis: {
					categories: _name
				},
				title: {
					text:null,
				},
				legend: {
					  enabled: false
				},
				yAxis: {
					title: {
						enabled: false
					},
				},
				series: [{
					name:'发现问题数',
					data: _passdata
				},{
					name:'整改数',
					data: _xcdata
				}]
			};
		}
        else if(this.props.isCompont==3){
			columns = [
                {
                    title: '序号',
                    dataIndex: 'key',
                    key: 'key',
                },
                {
                    title: '单位名称',
                    dataIndex: 'org_name',
                    key: 'org_name',
                },
                {
                    title: '点位数',
                    dataIndex: 'total_count',
                    key: 'total_count',
                    sorter: (a, b) => a.total_count - b.total_count,
                },
                {
                    title: '巡防数',
                    dataIndex: 'stay_checked',
                    key: 'stay_checked',
                    sorter: (a, b) => a.stay_checked - b.stay_checked,
                },
                {
                    title: '巡防率',
                    dataIndex: 'stay_checkedLv',
                    key: 'stay_checkedLv',
                    sorter: (a, b) => parseInt(a.stay_checkedLv) - parseInt(b.stay_checkedLv),
                },
                {
                    title: '问题数',
                    dataIndex: 'problem',
                    key: 'problem',
                    sorter: (a, b) => a.stay_fix - b.stay_fix,
                },
                {
                    title: '已整改数',
                    dataIndex: 'stay_review',
                    key: 'stay_review',
                    sorter: (a, b) => parseInt(a.stay_review) - parseInt(b.stay_review),
                },
                {
                    title: '整改率',
                    dataIndex: 'zgLv',
                    key: 'zgLv',
                    sorter: (a, b) => parseInt(a.zgLv) - parseInt(b.zgLv),
                },
                {
                    title: '网格单',
                    dataIndex: 'grid_count',
                    key: 'grid_count',
                    sorter: (a, b) => a.grid_count - b.grid_count,
				},
				{
                    title: '合格数',
                    dataIndex: 'pass_count',
                    key: 'pass_count',
                    sorter: (a, b) => parseInt(a.pass_count) - parseInt(b.pass_count),
                },
                {
                    title: '合格率',
                    dataIndex: 'hglv',
                    key: 'hglv',
                    sorter: (a, b) => parseInt(a.hglv) - parseInt(b.hglv),
                },
            ];

            if(_company==0||_company=='整体'){
                data_dw= _data
            }
            else{
                data_dw= _detail
            }
        }else if(this.props.isCompont==4){
            columns = [
                {
                    title: '序号',
                    dataIndex: 'key',
                    key: 'key',
                },
                {
                    title: '类型名称',
                    dataIndex: 'point_type_name',
                    key: 'point_type_name',
                },
                {
                    title: '点位数',
                    dataIndex: 'total_count',
                    key: 'total_count',
                    sorter: (a, b) => a.total_count - b.total_count,
                },
                {
                    title: '巡防数',
                    dataIndex: 'stay_checked',
                    key: 'stay_checked',
                    sorter: (a, b) => a.stay_checked - b.stay_checked,
                },
                {
                    title: '巡防率',
                    dataIndex: 'stay_checkedLv',
                    key: 'stay_checkedLv',
                    sorter: (a, b) => parseInt(a.stay_checkedLv) - parseInt(b.stay_checkedLv),
                },
                {
                    title: '问题数',
                    dataIndex: 'problem',
                    key: 'problem',
                    sorter: (a, b) => a.stay_fix - b.stay_fix,
                },
                {
                    title: '已整改数',
                    dataIndex: 'stay_review',
                    key: 'stay_review',
                    sorter: (a, b) => parseInt(a.stay_review) - parseInt(b.stay_review),
                },
                {
                    title: '整改率',
                    dataIndex: 'zgLv',
                    key: 'zgLv',
                    sorter: (a, b) => parseInt(a.zgLv) - parseInt(b.zgLv),
                },
                {
                    title: '网格单',
                    dataIndex: 'grid_count',
                    key: 'grid_count',
                    sorter: (a, b) => a.grid_count - b.grid_count,
				},
				{
                    title: '合格数',
                    dataIndex: 'pass_count',
                    key: 'pass_count',
                    sorter: (a, b) => parseInt(a.pass_count) - parseInt(b.pass_count),
                },
                {
                    title: '合格率',
                    dataIndex: 'hglv',
                    key: 'hglv',
                    sorter: (a, b) => parseInt(a.hglv) - parseInt(b.hglv),
                },
            ];

            if(_company==0||_company=='整体'){
                data_dw= _data
            }
            else{
                data_dw= _detail
            }
        }
        else if(this.props.isCompont==5){
            columns = [
                {
                    title: '序号',
                    dataIndex: 'key',
                    key: 'key',
                },
                {
                    title: '地区名称',
                    dataIndex: 'area_name',
                    key: 'area_name',
                },
                {
                    title: '点位数',
                    dataIndex: 'total_count',
                    key: 'total_count',
                    sorter: (a, b) => a.total_count - b.total_count,
                },
                {
                    title: '巡防数',
                    dataIndex: 'stay_checked',
                    key: 'stay_checked',
                    sorter: (a, b) => a.stay_checked - b.stay_checked,
                },
                {
                    title: '巡防率',
                    dataIndex: 'stay_checkedLv',
                    key: 'stay_checkedLv',
                    sorter: (a, b) => parseInt(a.stay_checkedLv) - parseInt(b.stay_checkedLv),
                },
                {
                    title: '问题数',
                    dataIndex: 'problem',
                    key: 'problem',
                    sorter: (a, b) => a.stay_fix - b.stay_fix,
                },
                {
                    title: '已整改数',
                    dataIndex: 'stay_review',
                    key: 'stay_review',
                    sorter: (a, b) => parseInt(a.stay_review) - parseInt(b.stay_review),
                },
                {
                    title: '整改率',
                    dataIndex: 'zgLv',
                    key: 'zgLv',
                    sorter: (a, b) => parseInt(a.zgLv) - parseInt(b.zgLv),
                },
                {
                    title: '网格单',
                    dataIndex: 'grid_count',
                    key: 'grid_count',
                    sorter: (a, b) => a.grid_count - b.grid_count,
				},
				{
                    title: '合格数',
                    dataIndex: 'pass_count',
                    key: 'pass_count',
                    sorter: (a, b) => parseInt(a.pass_count) - parseInt(b.pass_count),
                },
                {
                    title: '合格率',
                    dataIndex: 'hglv',
                    key: 'hglv',
                    sorter: (a, b) => parseInt(a.hglv) - parseInt(b.hglv),
                },
            ];

            if(_company==0||_company=='整体'){
                data_dw= _data
            }
            else{
                data_dw= _detail
            }
        }else if(this.props.isCompont==6){
            columns = [
                {
                    title: '序号',
                    dataIndex: 'key',
					key: 'key',
					width: '60px'
                },
                {
                    title: '项目名称',
                    dataIndex: 'item_text',
					key: 'item_text',
					width: '30%',
                },
                {
                    title: '项目类型',
                    dataIndex: 'rule_name',
                    key: 'rule_name',
                },
                {
                    title: '累计问题',
                    dataIndex: 'cumulative_error_count',
                    key: 'cumulative_error_count',
                    sorter: (a, b) => a.cumulative_error_count - b.cumulative_error_count,
                },
                {
                    title: '累计整改数',
                    dataIndex: 'cumulative_fix_count',
                    key: 'cumulative_fix_count',
                    sorter: (a, b) => parseInt(a.cumulative_fix_count) - parseInt(b.cumulative_fix_count),
                },
                {
                    title: '累计整改率',
                    dataIndex: 'zgLvNum',
                    key: 'zgLvNum',
                    sorter: (a, b) => a.zgLvNum - b.zgLvNum,
                },
                {
                    title: '本周问题数',
                    dataIndex: 'cycle_error_count',
                    key: 'cycle_error_count',
                    sorter: (a, b) => parseInt(a.cycle_error_count) - parseInt(b.cycle_error_count),
                },
                {
                    title: '本周整改率',
                    dataIndex: 'zgLv',
                    key: 'zgLv',
                    sorter: (a, b) => parseInt(a.zgLv) - parseInt(b.zgLv),
                },
                {
                    title: '周期网格单',
                    dataIndex: 'cycle_grid_count',
                    key: 'cycle_grid_count',
                    sorter: (a, b) => a.cycle_grid_count - b.cycle_grid_count,
				},
				{
                    title: '累计网格单',
                    dataIndex: 'cumulative_grid_count',
                    key: 'cumulative_grid_count',
                    sorter: (a, b) => a.cumulative_grid_count - b.cumulative_grid_count,
				},
			];
            if(_company==0||_company=='整体'){
                data_dw= _data
            }
            else{
                data_dw= _detail
            }
        }
		return (
			<div className={styles.analyCont}>
				<Card title={this.props.title} bordered={false}>
					<div className={styles.topcont}>


                        {
                            this.props.selected==3?
								<div className={analy.exception}>
									<Icon type="exception" />
								</div>:
                                null
                        }
                        {
                            this.props.selected==4?
								<div className={analy.exception}>
									<Icon type="exception" />
								</div>:
                                null
                        }

                        {
                            this.props.selected==5?
								<div className={analy.exception}>
									<Icon type="exception" />
								</div>:
                                null
                        }


						<div className={styles.topcontL}>
							<span onClick={this.setClick.bind(this,-1)} className={_spanIndex==-1?styles.spanActive:styles.span}>全部</span>
							<span onClick={this.setClick.bind(this,0)} className={_spanIndex==0?styles.spanActive:styles.span}>日常</span>
							<span onClick={this.setClick.bind(this,1)} className={_spanIndex==1?styles.spanActive:styles.span}>随机</span>
						</div>
						<div className={styles.topcontR}>
							<Select className={styles.topcontSelect} value={this.props.chooseweeks} onChange={this.showVal.bind(this)}>
								{this.children()}
							</Select>
						</div>
						{
                            this.props.selected==3?
								<div>
									<Button type="primary" className={styles.marginRight} onClick={this.ExportToExcel.bind(this,columns,'全部单位报表')}>导出报表</Button>
								</div>:
								null
						}
                        {
                            this.props.selected==4?
								<div>
									<Button type="primary" className={styles.marginRight} onClick={this.ExportToExcel.bind(this,columns,'全部类型报表')}>导出报表</Button>
								</div>:
                                null
                        }
                        {
                            this.props.selected==5?
								<div>
									<Button type="primary" className={styles.marginRight} onClick={this.ExportToExcel.bind(this,columns,'全部地区报表')}>导出报表</Button>
								</div>:
                                null
                        }

						
						{this.props.selected==6?
								<div>
									<Button type="primary" className={styles.marginRight} onClick={this.ExportToExcel.bind(this,columns,'项目指标报表')}>导出报表</Button>
								</div>:
                                null
                        }

					</div>

                    {
                        this.props.selected==0?
							<div>
								<div className={styles.analyCompany}>
									<div className={styles.leftIcon} onClick={this.tabChanges.bind(this,0)}></div>
									<div className={[styles.cont+' conts']}>
										<div className={styles.contOver+' contOver'+this.props.isCompont}>
                                            {
                                                this.props.isCompont==1?
                                                    this.showCompany()
                                                    :this.showCompany2()
                                            }
                                            {this.setTAbles()}
										</div>
									</div>
									<div className={styles.rightIcon} onClick={this.tabChanges.bind(this,1)}></div>
								</div>
								<div className={styles.linebox}>
									<ReactHighcharts config={config}></ReactHighcharts>
								</div>
							</div>
							:null
                    }
                    {
                        this.props.selected==1?
							<div>
								<div className={styles.analyCompany}>
									<div className={styles.leftIcon} onClick={this.tabChanges.bind(this,0)}></div>
									<div className={[styles.cont+' conts']}>
										<div className={styles.contOver+' contOver'+this.props.isCompont}>
                                            {
                                                this.props.isCompont==1?
                                                    this.showCompany3()
                                                    :this.showCompany4()
                                            }

                                            {this.setTAbles()}
										</div>
									</div>
									<div className={styles.rightIcon} onClick={this.tabChanges.bind(this,1)}></div>
								</div>
								<div className={styles.linebox}>
									<ReactHighcharts config={config}></ReactHighcharts>
								</div>
							</div>
                            :null
                    }
                    {
                        this.props.selected==2?
							<div>
								<div className={styles.analyCompany}>
									<div className={styles.leftIcon} onClick={this.tabChanges.bind(this,0)}></div>
									<div className={[styles.cont+' conts']}>
										<div className={styles.contOver+' contOver'+this.props.isCompont}>
                                            {
                                                this.props.isCompont==1?
                                                    this.showCompany5()
                                                    :this.showCompany6()
                                            }
                                            {this.setTAbles()}
										</div>
									</div>
									<div className={styles.rightIcon} onClick={this.tabChanges.bind(this,1)}></div>
								</div>
								<div className={styles.linebox}>
									<ReactHighcharts config={config}></ReactHighcharts>
								</div>
							</div>
                            :null
                    }

                    {
                        this.props.selected==3?
							<div>
								<div className={styles.analyCompany}>

									{
                                        this.showStatistics1()
									}
								</div>
								<Table
									className={analy.marginTop}
									columns={columns}
									dataSource={data_dw}
									pagination={true}
								/>

							</div>
                            :null
                    }

                    {
                        this.props.selected==4?
							<div>
								<div className={styles.analyCompany}>

                                    {
                                        this.showStatistics2()
                                    }
								</div>
								<Table
									className={analy.marginTop}
									columns={columns}
									dataSource={data_dw}
									pagination={true}
								/>

							</div>
                            :null
                    }

                    {
                        this.props.selected==5?
							<div>
								<div className={styles.analyCompany}>

                                    {
                                        this.showStatistics3()
                                    }
								</div>
								<Table
									className={analy.marginTop}
									columns={columns}
									dataSource={data_dw}
									pagination={true}
								/>

							</div>
                            :null
                    }

					{
                        this.props.selected==6?
							<div>
								<div className={styles.analyCompany}>
                                    {
                                        this.showStatistics4()
                                    }
								</div>
								<Table
									className={analy.marginTop}
									columns={columns}
									dataSource={data_dw}
									pagination={true}
								/>

							</div>
                            :null
                    }

				</Card>
			</div>
		);
	}
}
  
  export default ShowContent
