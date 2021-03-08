import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Card, Form,Button, Input,Divider,Checkbox  } from 'antd';
import styles from '../main.less';

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item

const formItemLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 12 },
}
const tailLayout = {
	wrapperCol: { offset: 2, span: 13 },
};

const RoleBindEdit = ({
	roleBindEdit, 
	dispatch,
	form: {
		validateFields,
		getFieldDecorator,
	},
})=>{

	let { 
		mobileData,
		pcData,
		checkedAll_Pc,
		checkedAll_Mb,
		checkList_pc,  //已选中的pc项目
		checkList_mb,  //已选中的小程序项目 
		infos 
	} = roleBindEdit

	const handleSubmit = ()=>{
		validateFields((err, values) => {
		    if (!err) {
				let _ars = infos
				_ars.roleName = values.roleName
				_ars.roleCode = values.roleCode
				let _funs=[]
				//已选小程序功能
				for(let i=0; i<checkList_mb.length; i++){
					let _ar={}
					_ar.funId = checkList_mb[i]
					_funs.push(_ar)
				}
				//已选后台功能
				for(let i=0; i<checkList_pc.length; i++){
					let _ar={}
					_ar.funId = checkList_pc[i]
					_funs.push(_ar)
				}
				_ars.funs = _funs 
				dispatch({
					type: 'roleBindEdit/addRole',
					payload: _ars
				})
			}
		})
	}

	//小程序-选中
	const mobileChanges = (e)=>{
		let _fla = e.length == mobileData.length
		if(_fla){
			dispatch({
				type: 'roleBindEdit/checkedAll_Mb',
				payload: true
			})
		}else{
			dispatch({
				type: 'roleBindEdit/checkedAll_Mb',
				payload: false
			})
		}
		dispatch({
			type: 'roleBindEdit/checkList_mb',
			payload: e
		})
	}

	//后台-选中
	const pcChanges = (e)=>{
		let _fla = e.length == pcData.length
		if(_fla){
			dispatch({
				type: 'roleBindEdit/checkedAll_Pc',
				payload: true
			})
		}else{
			dispatch({
				type: 'roleBindEdit/checkedAll_Pc',
				payload: false
			})
		}
		dispatch({
			type: 'roleBindEdit/checkList_pc',
			payload: e
		})
	}

	//设置全选数据
	const setAllDatas=(datas)=>{
		let _datas=[]
		datas.map(item=>{
			_datas.push(item.funId)
		})
		return _datas
	}

	//设置全选-小程序
	const checkedAll_Mb_set=()=>{
		if(checkedAll_Mb==false){
			let _all = setAllDatas(mobileData)
			dispatch({
				type: 'roleBindEdit/checkList_mb',
				payload: _all
			})
		}else{
			dispatch({
				type: 'roleBindEdit/checkList_mb',
				payload: []
			})
		}
		dispatch({
			type: 'roleBindEdit/checkedAll_Mb',
			payload: !checkedAll_Mb
		})
	}

	//设置全选-后台
	const checkedAll_Pc_set=()=>{
		if(checkedAll_Pc==false){
			let _all = setAllDatas(pcData)
			dispatch({
				type: 'roleBindEdit/checkList_pc',
				payload: _all
			})
		}else{
			dispatch({
				type: 'roleBindEdit/checkList_pc',
				payload: []
			})
		}
		dispatch({
			type: 'roleBindEdit/checkedAll_Pc',
			payload: !checkedAll_Pc
		})
	}

	return (
		<div>
			{
				JSON.stringify(infos)=='{}'?null:
				<div>
					<Form onSubmit={handleSubmit}>
						<Card title='修改角色'>
							<FormItem {...formItemLayout} label="角色名称" hasFeedback>
							{getFieldDecorator('roleName',{
								initialValue: infos.roleName,
								rules: [{
									required: true,
									message: '请输入角色名称',
								}],
							})(
									<Input placeholder="请输入"/>
							)}
							</FormItem>

							<FormItem {...formItemLayout} label="角色code" hasFeedback>
							{getFieldDecorator('roleCode',{
								initialValue: infos.roleCode,
								rules: [{
									required: true,
									message: '请输入角色code',
								}],
							})(
								<Input disabled placeholder="请输入"/>
							)}
							</FormItem>

							<FormItem {...tailLayout}>
								<div><span className={styles.redColor}>*</span>功能权限（请选择角色需要使用的功能权限）</div>
								<div className={styles.roleSystem}>
									<div className={styles.leftCont}>
										<div className={checkedAll_Mb?styles.leftChecked:styles.leftCheck}>
											<Checkbox 
												checked={checkedAll_Mb}
												onChange={checkedAll_Mb_set}
											>小程序</Checkbox>
										</div>
									</div>
									<Divider className={styles.divider} type="vertical" />
									<div className={styles.rightCont}>
										<CheckboxGroup
											options={mobileData}
											onChange={mobileChanges}
											value={checkList_mb}
											style={{ marginTop: '8px'}}
										/>
									</div>
								</div>
								<div className={styles.roleSystem}>
									<div className={styles.leftCont}>
									<div className={checkedAll_Pc?styles.leftChecked:styles.leftCheck}>
											<Checkbox
												onChange={checkedAll_Pc_set}
												checked={checkedAll_Pc}
											>后台管理</Checkbox>
										</div>
									</div>
									<Divider className={styles.divider} type="vertical" />
									<div className={styles.rightCont}>
										<CheckboxGroup
											options={pcData}
											onChange={pcChanges}
											value={checkList_pc}
											style={{ marginTop: '8px'}}
										/>
									</div>
								</div>
							</FormItem>
							
						</Card>
						<Button style={{ marginTop: '20px'}} type="primary" onClick={handleSubmit}>提  交</Button>	
					</Form>
				</div>
			}
		</div>
	)
}

export default connect(({ roleBindEdit }) => ({ roleBindEdit }))(Form.create()(RoleBindEdit))
