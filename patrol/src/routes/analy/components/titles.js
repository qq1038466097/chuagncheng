import React, { PureComponent } from 'react';
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
		let _start = this.props.startTime
		let _end = this.props.endTime
		_dispatch({
			type: _typeName,
			payload: k,
		})
		_dispatch({
			type: 'analyweek/tab1_Index',
			payload: -1,
		})
		_dispatch({
			type: 'analyweek/tab1_tab',
			payload: [],
		})
		//设置默认值
		_dispatch({
			type: 'analyweek/tab1_company',
			payload: 0,
		})
		_dispatch({
			type: 'analyweek/tab2_company',
			payload: 0,
		})
		//选项卡还原
		_dispatch({
			type: 'analyweek/tab1_tabul',
			payload: 0,
		})
		_dispatch({
			type: 'analyweek/tab2_tabul',
			payload: 0,
		})
		//清楚数据 
		_dispatch({
			type: 'analyweek/tab1_data',
			payload: [],
		})
		if(k==0){
			//单位
			let _ars={}
			_ars.startTime= _start
			_ars.endTime= _end
			_ars.sort='pass_count/total_count'
			_ars.order='desc'
			_ars.roundPoint='-1'
			_dispatch({
			  type:'analyweek/query_orgTrendSummary',
			  payload: _ars
			})
	
			//初始化数据，整改率
			let _ars2={}
			_ars2.startTime= _start
			_ars2.endTime= _end
			_ars2.sort='stay_review/(total_count-pass_count-stay_check)'
			_ars2.order='desc'
			_ars2.roundPoint='-1'
			_dispatch({
			  type:'analyweek/query_orgTrendSummary2',
			  payload: _ars2
			})

			//初始化全部合格率
			let _ars3={}
			_ars3.roundPoint='-1'
			_ars3.startTime=_start
			_ars3.endTime=_end
			_dispatch({
			  type:'analyweek/companyDetail',
			  payload: _ars3
			})
			_dispatch({
			  type:'analyweek/companyDetail2',
			  payload: _ars3
			})

		}
		else if(k==1){
			let _ars={}
			_ars.endTime= _end
			_ars.startTime= _start
			_ars.sort='pass_count/total_count'
			_ars.order='desc'
			_ars.roundPoint='-1'
			//类型
			_dispatch({
				type: 'analyweek/querypointType',
				payload: _ars
			})
			//类型整改率
			let _ars2={}
			_ars2.startTime= _start
			_ars2.endTime= _end
			_ars2.sort='stay_review/(total_count-pass_count-stay_check)'
			_ars2.order='desc'
			_ars2.roundPoint='-1'
			_dispatch({
			  type:'analyweek/querypointType2',
			  payload: _ars2
			})

			//初始化全部合格率
			let _ars3={}
			_ars3.roundPoint='-1'
			_ars3.startTime=_start
			_ars3.endTime=_end
			_dispatch({
			  type:'analyweek/querypointTypeDetail',
			  payload: _ars3
			})
			_dispatch({
			  type:'analyweek/querypointTypeDetail2',
			  payload: _ars3
			})

		}
		else if(k==2){
			//地区 -合格率
			let _ars={}
			_ars.endTime=_end
			_ars.startTime=_start
			_ars.sort='pass_count/total_count'
			_ars.order='desc'
			_ars.roundPoint='-1'
			_dispatch({
				type: 'analyweek/areaData',
				payload: _ars
			})
			//地区 - 整改率
			let _ars2={}
			_ars2.endTime=_end
			_ars2.startTime=_start
			_ars2.sort='stay_review/(total_count-pass_count-stay_check)'
			_ars2.order='desc'
			_ars2.roundPoint='-1'
			_dispatch({
				type: 'analyweek/areaData2',
				payload: _ars2
			})

			//初始化全部合格率
			let _ars3={}
			_ars3.roundPoint='-1'
			_ars3.startTime=_start
			_ars3.endTime=_end
			_dispatch({
			  type:'analyweek/areaDetail',
			  payload: _ars3
			})
			_dispatch({
			  type:'analyweek/areaDetail2',
			  payload: _ars3
			})

		}else if(k==3){
            //单位报表
            let _ars={}
            _ars.startTime= _start
            _ars.endTime= _end
            _ars.sort='pass_count/total_count'
            _ars.order='desc'
            _ars.roundPoint='-1'
            _dispatch({
                type:'analyweek/query_orgTrendSummaryDw',
                payload: _ars
            })
        }else if(k==4){
			//类型报表
			let _ars={}
			_ars.endTime= _end
			_ars.startTime= _start
			_ars.sort='pass_count/total_count'
			_ars.order='desc'
			_ars.roundPoint='-1'
			//类型
			_dispatch({
				type: 'analyweek/querypointTypeDw',
				payload: _ars
			})
		}else if(k==5){
			//地区 -报表
			let _ars={}
			_ars.endTime=_end
			_ars.startTime=_start
			_ars.sort='pass_count/total_count'
			_ars.order='desc'
			_ars.roundPoint='-1'
			_dispatch({
				type: 'analyweek/areaDataDw',
				payload: _ars
			})
		}else if(k==6){
			//项目指标报表-list
			let _ars={}
			_ars.endTime=_end
			_ars.startTime=_start
			_ars.sort='cumulative_fix_count'
			_ars.pageIndex=1
			_ars.pageSize=5000
			_ars.order='desc'
			_ars.roundPoint='-1'
			_dispatch({
				type: 'analyweek/groupList',
				payload: _ars
			})

			//项目指标-概览
			let _ars2={}
			_ars2.endTime=_end
			_ars2.startTime=_start
			_ars2.roundPoint='-1'
			_dispatch({
				type: 'analyweek/groupSummary',
				payload: _ars2
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
