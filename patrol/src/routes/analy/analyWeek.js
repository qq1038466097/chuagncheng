import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import styles from '../main.less';

import ShowTitle from './components/titles.js'
import ShowContent from './components/contents.js'

const AnalyWeek = ({
	analyweek, 
	dispatch,
	qryLoading,
})=>{
	let { 
		titles,
		selected,
		chooseweeks,
		weeks, //周期
		totalData, //总数据
		tab1_Index, //页面第一个选中，全部，suiji
		tab1_company, //页面第一个单位
		tab1_companyDetail, //页面单位详情数据
		tab1_startTime, //页面开始时间
		tab1_endTime,  //页面结束时间
		tab1_data, //页面第一个，数据
		tab1_tabul, //选项卡切换单位
		/* 第二个 */
		chooseweeks2,
		tab2_Index, //页面第一个选中，全部，suiji
		tab2_company, //页面第一个单位
		tab2_companyDetail, //页面单位详情数据
		tab2_startTime, //页面开始时间
		tab2_endTime,  //页面结束时间
		tab2_data, //页面第一个，数据
		tab2_tabul, //选项卡切换单位

	} = analyweek

	return (
		<Fragment>
			
			<ShowTitle 
				title={titles} 
				select={selected} 
				typeName='analyweek/selected' 
				dispatch={dispatch} 
				startTime={tab1_startTime}
				endTime={tab1_endTime}
			/>
			{
				selected==0?
				<div className={styles.relative}>
					<ShowContent 
						selected={selected}
						dispatch={dispatch} 
						title='单位合格率趋势'
						tabIndex={tab1_Index}  //选择随机、全部、日常
						typeName='analyweek/tab1_Index'
						startTime={tab1_startTime}
						endTime={tab1_endTime}
						typeName_setTime='analyweek/tab1_setTime'
						company={tab1_company}  //选中的街镇
						typeName_company='analyweek/tab1_company'
						datas={tab1_data}  //所有街镇
						reports='analyweek/query_orgTrendSummary'
						tab1_tabul={tab1_tabul}
						typeName_tab1_tabul='analyweek/tab1_tabul'  //左右切换镇
						typeName_detail='analyweek/companyDetail'
						detail={tab1_companyDetail}  //单个单位数据
						weeks={weeks}  //周期数据
						chooseweeks={chooseweeks}  //选择周期
						sorts='pass_count/total_count' //排序方式
						isCompont='1'  //第一个组件
					/>

					<ShowContent 
						selected={selected}
						dispatch={dispatch} 
						title='单位整改率趋势'
						tabIndex={tab2_Index}  //选择随机、全部、日常
						typeName='analyweek/tab2_Index'
						startTime={tab2_startTime}
						endTime={tab2_endTime}
						typeName_setTime='analyweek/tab2_setTime'
						company={tab2_company}  //选中的街镇
						typeName_company='analyweek/tab2_company'
						datas={tab2_data}  //所有街镇
						reports='analyweek/query_orgTrendSummary2'
						tab1_tabul={tab2_tabul}
						typeName_tab1_tabul='analyweek/tab2_tabul'  //左右切换镇
						typeName_detail='analyweek/companyDetail2'
						detail={tab2_companyDetail}  //单个单位数据
						weeks={weeks}  //周期数据
						chooseweeks={chooseweeks2}  //选择周期
						sorts='stay_review/(total_count-pass_count-stay_check)' //排序方式
						isCompont='2' //第二个组件
					/>
				</div>
				:null
			}

			{
				selected==1?
				<div>
					<ShowContent 
						selected={selected}
						dispatch={dispatch} 
						title='类型合格率趋势'
						tabIndex={tab1_Index}  //选择随机、全部、日常
						typeName='analyweek/tab1_Index'
						startTime={tab1_startTime}
						endTime={tab1_endTime}
						typeName_setTime='analyweek/tab1_setTime'
						company={tab1_company}  //选中的街镇
						typeName_company='analyweek/tab1_company'
						datas={tab1_data}  //所有街镇
						reports='analyweek/querypointType'
						tab1_tabul={tab1_tabul}
						typeName_tab1_tabul='analyweek/tab1_tabul'  //左右切换镇
						typeName_detail='analyweek/querypointTypeDetail'
						detail={tab1_companyDetail}  //单个单位数据
						weeks={weeks}  //周期数据
						chooseweeks={chooseweeks}  //选择周期
						sorts='pass_count/total_count' //排序方式
						isCompont='1'  //第一个组件
					/>

					<ShowContent 
						selected={selected}
						dispatch={dispatch} 
						title='类型整改率趋势'
						tabIndex={tab2_Index}  //选择随机、全部、日常
						typeName='analyweek/tab2_Index'
						startTime={tab2_startTime}
						endTime={tab2_endTime}
						typeName_setTime='analyweek/tab2_setTime'
						company={tab2_company}  //选中的街镇
						typeName_company='analyweek/tab2_company'
						datas={tab2_data}  //所有街镇
						reports='analyweek/querypointType2'
						tab1_tabul={tab2_tabul}
						typeName_tab1_tabul='analyweek/tab2_tabul'  //左右切换镇
						typeName_detail='analyweek/querypointTypeDetail2'
						detail={tab2_companyDetail}  //单个单位数据
						weeks={weeks}  //周期数据
						chooseweeks={chooseweeks2}  //选择周期
						sorts='stay_review/(total_count-pass_count-stay_check)' //排序方式
						isCompont='2' //第二个组件
					/>
				</div>
				:null
			}

			{
				selected==2?
				<div>
					<ShowContent 
						selected={selected}
						dispatch={dispatch} 
						title='地区-点位合格率趋势'
						tabIndex={tab1_Index}  //选择随机、全部、日常
						typeName='analyweek/tab1_Index'
						startTime={tab1_startTime}
						endTime={tab1_endTime}
						typeName_setTime='analyweek/tab1_setTime'
						company={tab1_company}  //选中的街镇
						typeName_company='analyweek/tab1_company'
						datas={tab1_data}  //所有街镇
						reports='analyweek/areaData'  //整体合格率-api
						tab1_tabul={tab1_tabul}
						typeName_tab1_tabul='analyweek/tab1_tabul'  //左右切换镇
						typeName_detail='analyweek/areaDetail'   //单个合格率-api
						detail={tab1_companyDetail}  //单个单位数据
						weeks={weeks}  //周期数据
						chooseweeks={chooseweeks}  //选择周期
						sorts='pass_count/total_count' //排序方式
						isCompont='1'  //第一个组件
					/>

					<ShowContent 
						selected={selected}
						dispatch={dispatch} 
						title='地区-点位整改率趋势'
						tabIndex={tab2_Index}  //选择随机、全部、日常
						typeName='analyweek/tab2_Index'
						startTime={tab2_startTime}
						endTime={tab2_endTime}
						typeName_setTime='analyweek/tab2_setTime'
						company={tab2_company}  //选中的街镇
						typeName_company='analyweek/tab2_company'
						datas={tab2_data}  //所有街镇
						reports='analyweek/areaData2'
						tab1_tabul={tab2_tabul}
						typeName_tab1_tabul='analyweek/tab2_tabul'  //左右切换镇
						typeName_detail='analyweek/areaDetail2'
						detail={tab2_companyDetail}  //单个单位数据
						weeks={weeks}  //周期数据
						chooseweeks={chooseweeks2}  //选择周期
						sorts='stay_review/(total_count-pass_count-stay_check)' //排序方式
						isCompont='2' //第二个组件
					/>
				</div>
				:null
			}


            {
                selected==3?
					<div>
						<ShowContent
							selected={selected}
							dispatch={dispatch}
							title='单位报表'
							tabIndex={tab1_Index}  //选择随机、全部、日常
							typeName='analyweek/tab1_Index'
							startTime={tab1_startTime}
							endTime={tab1_endTime}
							typeName_setTime='analyweek/tab1_setTime'
							company={tab1_company}  //选中的街镇
							typeName_company='analyweek/tab1_company'
							datas={tab1_data}  //所有街镇
							reports='analyweek/query_orgTrendSummaryDw'
							tab1_tabul={tab1_tabul}
							typeName_tab1_tabul='analyweek/tab1_tabul'  //左右切换镇
							typeName_detail='analyweek/areaDetail'
							detail={tab1_companyDetail}  //单个单位数据
							weeks={weeks}  //周期数据
							chooseweeks={chooseweeks}  //选择周期
							sorts='pass_count/total_count' //排序方式
							isCompont='3'  //第一个组件
							totalData={totalData}
						/>

					</div>
                    :null
            }


            {
                selected==4?
					<div>
						<ShowContent
							selected={selected}
							dispatch={dispatch}
							title='类型报表'
							tabIndex={tab1_Index}  //选择随机、全部、日常
							typeName='analyweek/tab1_Index'
							startTime={tab1_startTime}
							endTime={tab1_endTime}
							typeName_setTime='analyweek/tab1_setTime'
							company={tab1_company}  //选中的街镇
							typeName_company='analyweek/tab1_company'
							datas={tab1_data}  //所有街镇
							reports='analyweek/querypointTypeDw'
							tab1_tabul={tab1_tabul}
							typeName_tab1_tabul='analyweek/tab1_tabul'  //左右切换镇
							typeName_detail='analyweek/areaDetail'
							detail={tab1_companyDetail}  //单个单位数据
							weeks={weeks}  //周期数据
							chooseweeks={chooseweeks}  //选择周期
							sorts='pass_count/total_count' //排序方式
							isCompont='4'  //第一个组件
							totalData={totalData}
						/>

					</div>
                    :null
            }

            {
                selected==5?
					<div>
						<ShowContent
							selected={selected}
							dispatch={dispatch}
							title='地区报表'
							tabIndex={tab1_Index}  //选择随机、全部、日常
							typeName='analyweek/tab1_Index'
							startTime={tab1_startTime}
							endTime={tab1_endTime}
							typeName_setTime='analyweek/tab1_setTime'
							qw = {20}
							zg = {20}
							company={tab1_company}  //选中的街镇
							typeName_company='analyweek/tab1_company'
							datas={tab1_data}  //所有街镇
							reports='analyweek/areaDataDw'
							tab1_tabul={tab1_tabul}
							typeName_tab1_tabul='analyweek/tab1_tabul'  //左右切换镇
							typeName_detail='analyweek/areaDetail'
							detail={tab1_companyDetail}  //单个单位数据
							weeks={weeks}  //周期数据
							chooseweeks={chooseweeks}  //选择周期
							sorts='pass_count/total_count' //排序方式
							isCompont='5'  //第一个组件
							totalData={totalData}
						/>

					</div>
                    :null
            }

			{
                selected==6?
					<div className={styles.relative}>
						{
							qryLoading==true?
							<div className={styles.loadding}>
									<Spin spinning={qryLoading} size={"large"} >
										<span class={styles.loaddingText}>加载中...</span>
									</Spin>
								</div>
							:null
						}
						<ShowContent
							selected={selected}
							dispatch={dispatch}
							title='项目指标报表'
							tabIndex={tab1_Index}  //选择随机、全部、日常
							typeName='analyweek/tab1_Index'
							startTime={tab1_startTime}
							endTime={tab1_endTime}
							typeName_setTime='analyweek/tab1_setTime'
							company={tab1_company}  //选中的街镇
							typeName_company='analyweek/tab1_company'
							datas={tab1_data}  //所有街镇
							reports='analyweek/groupList'
							tab1_tabul={tab1_tabul}
							typeName_tab1_tabul='analyweek/tab1_tabul'  //左右切换镇
							typeName_detail='analyweek/groupSummary'
							detail={tab1_companyDetail}  //单个单位数据
							weeks={weeks}  //周期数据
							chooseweeks={chooseweeks}  //选择周期
							sorts='cumulative_fix_count' //排序方式
							isCompont='6'  //第一个组件
							totalData={totalData}
						/>

					</div>
                    :null
            }

		</Fragment>
	)
}

export default connect(({ analyweek,loading }) => ({ 
	analyweek,
	qryLoading:  loading.effects['analyweek/groupList'],
}))(AnalyWeek)
