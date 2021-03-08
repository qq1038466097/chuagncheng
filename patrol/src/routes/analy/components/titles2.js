import React, { PureComponent } from 'react';
import { Table, Card, Form,Button, Modal, Divider,Pagination } from 'antd';
import styles from '../../main.less';

class ShowTitle extends PureComponent{
	constructor(props) {
	  super(props);
	  this.state = { }
	}
	title = ()=>{
		let _title = this.props.title
		let _index = this.props.select
		let _div=[]
		for(let i=0; i<_title.length; i++){
			_div.push(<div key={i} onClick={this.setClick.bind(this,i)} className={_index==i?styles.analyTopLiActive:styles.analyTopLi}><span className={styles.border}>{_title[i]}</span></div>)
		}
		return _div
	}

	setClick=(k)=>{
		let _dispatch = this.props.dispatch
		let _typeName = this.props.typeName
		let _st = this.props.startTime
		let _end = this.props.endTime
		_dispatch({
			type: _typeName,
			payload: k,
		})
		//赛选条件，重置
		_dispatch({
            type: 'analyCycle/tab1_Index',
            payload: -1,
		})
		let _ars={}
		_ars.startTime=_st
		_ars.endTime=_end
		_ars.order='desc'
		_ars.roundPoint='-1'
		if(k==0){
			//单位
			_dispatch({
				type:'analyCycle/query_orgTrendSummary',
				payload: _ars
			})
		}else if(k==1){
			//类型
			_dispatch({
				type: 'analyCycle/query_type',
				payload: _ars
			})
		}else if(k==2){
			//类型
			_dispatch({
				type: 'analyCycle/query_area',
				payload: _ars
			})
		}
		
	}

	render() {
		return (
			<div className={styles.analyTopbox}>
				<div className={styles.analyTop}>
					{this.title()}
				</div>
			</div>
		);
	}
  }
  
  export default ShowTitle
