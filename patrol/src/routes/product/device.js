import React from 'react';
import {useRef} from 'react';
import { connect } from 'dva';
import { Card, Form,Button,Table,Modal,Input,Select,Row, Col, Pagination, Divider } from 'antd';
import { userIds } from '../../utils/config'
import styles from '../main.less';
import styles2 from '../TableList.less';
const confirm = Modal.confirm;
import ChooseMan from './chooseMan';

const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {span: 4},
	wrapperCol: {span: 15},
};

const Device = ({
	device, 
	loading,
	dispatch,
	form: {
		validateFields,
		getFieldsValue,
		getFieldDecorator,
		setFieldsValue,
	},
})=>{

	const childRef = useRef();

	let { data,showModal,searchList,paginationG,bindIds,equDetail,editModal,editData } = device

	const delList = (ids)=>{
		confirm({
			title: '确认要删除该设备？',
			okText: '确定',
			cancelText: '取消',
			onOk() {
				let _ars={}
				_ars.equId = ids
				dispatch({
					type: 'device/deviceDel',
					payload: _ars,
					searchList: searchList,
				})
			}
		})
	}

	const columns = [
		{
			title: '设备名称',
			dataIndex: 'equName',
			key: 'equName',
		},
		{
			title: '设备编码',
			dataIndex: 'equCode',
			key: 'equCode',
		},
		{
			title: '操作员',
			dataIndex: 'createrName',
			key: 'createrName',
		},
		{
			title: '已绑定人员',
			dataIndex: 'employeeName',
			key: 'employeeName',
			render: (text, record) => {
				return <div>
					<div>{record.employeeName}</div>
					<div>{record.employeePhone}</div>
				</div>
			}
		},
	    {
			title: '操作',
			key: 'system',
            render: (text, record) => (
				<div>
					{
						record.bindId==null?
						<a onClick={bindOne.bind(this,record.equId,record)}>绑定</a>
						:
						<a className={styles.orangeBg} onClick={bindOne.bind(this,record.equId,record)}>重新绑定</a>
					}
					<Divider type="vertical" />
					<a onClick={editName.bind(this,record)}>修改</a>
					<Divider type="vertical" />
					<a onClick={delList.bind(this,record.equId)}>删除</a>
				</div>
            ),
	    },
	]; 

	const editName = (val)=>{
		dispatch({
			type: 'device/editModal',
			payload: true
		})
		dispatch({
			type: 'device/editData',
			payload: val
		})
	}

	// 解绑 <a className={styles.orangeBg} onClick={removebind.bind(this,record.equId,record)}>解绑</a>

	//解绑
	const removebind=(ids,detail,val)=>{
		dispatch({
			type: 'device/bindIds',
			payload: ids
		})
		dispatch({
			type: 'device/equDetail',
			payload: detail
		})
		childRef.current.removeBind(detail);
	}

	const addDevice = ()=>{
		dispatch({
			type: 'device/showModal',
			payload: true
		})
	}

	const handleSearch = (e) => {
		e.preventDefault();
		let values = getFieldsValue()
		let _ars = values

		dispatch({
			type: 'device/queryRule',
			payload: _ars,
		});
        dispatch({
			type: 'device/searchList',
			payload: _ars,
		});
	}

	//重置
	const handleFormReset = () =>{
		const fields = getFieldsValue()
		for (let item in fields) {
		  if ({}.hasOwnProperty.call(fields, item)) {
			if (fields[item] instanceof Array) {
			  fields[item] = []
			} else {
			  fields[item] = undefined
			}
		  }
		}
		setFieldsValue(fields)
		let _ars={}
		dispatch({
			type: 'device/queryRule',
			payload: _ars,
		});

		dispatch({
			type: 'device/searchList',
			payload: _ars
		});
	}

	//搜索-内容
	const renderSimpleForm=()=>{
		return (
		  <Form onSubmit={handleSearch}>
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
			  <Col md={8} sm={24}>
				<FormItem label="设备名称">
				  {getFieldDecorator('equName')(
					<Input placeholder="请输入" />
				  )}
				</FormItem>
			  </Col>
			  <Col md={8} sm={24}>
				<FormItem label="已绑定人员">
				  {getFieldDecorator('employeeName')(
					<Input placeholder="请输入" />
				  )}
				</FormItem>
			  </Col>
			    <Col md={8} sm={24}>
					<FormItem label="">
						<span className={styles.submitButtons}>
							<Button type="primary" htmlType="submit">查询</Button>
							<Button style={{ marginLeft: 8 }} onClick={handleFormReset}>重置</Button>
						</span>
					</FormItem>
			    </Col>
			</Row>
		  </Form>
		)
	}

	/**分页合集---分组分页 start **/
	const showTotalG = (total) => {
		return `共 ${paginationG.total} 条 第 ${paginationG.current} / ${paginationG.pageCount} 页`;
    }
    const onShowSizeChange =(current, pageSize) => {
        const postObj = {
			"pageIndex": current,
			"pageSize": pageSize,
        }
        dispatch({
            type: 'device/setPage',
            payload: current,
            size: pageSize
		})
        //判断查询条件
        if(JSON.stringify(searchList)!=='{}'){
            let _c=searchList
			_c.pageIndex = postObj.pageIndex
			_c.pageSize = postObj.pageSize
            dispatch({
                type: 'device/queryRule',
                payload: _c,
			})
			dispatch({
                type: 'device/searchList',
                payload: _c,
			})
        }else{
            dispatch({
                type: 'device/queryRule',
                payload: postObj,
			})
			dispatch({
                type: 'device/searchList',
                payload: postObj,
			})
		}
    }
    const getNowPageG =(current,pageSize) => {
        let postObj = {
            "pageIndex": current,
            "pageSize": pageSize
		}
        dispatch({
            type: 'device/setPage',
            payload: current,
            size: pageSize
		})
        //判断查询条件
        if(JSON.stringify(searchList)!=='{}'){
            let _c=searchList
			_c.pageIndex = postObj.pageIndex
			_c.pageSize = postObj.pageSize
            dispatch({
                type: 'device/queryRule',
                payload: _c,
			})
			dispatch({
                type: 'device/searchList',
                payload: _c,
			})
			
        }else{
            dispatch({
                type: 'device/queryRule',
                payload: postObj,
			})
			dispatch({
                type: 'device/searchList',
                payload: postObj,
			})
		}
    }
	/**分页合集---分组分页 end **/

	//绑定设备
	const bindOne = (ids,detail,val)=>{
		dispatch({
			type: 'device/bindIds',
			payload: ids
		})
		dispatch({
			type: 'device/equDetail',
			payload: detail
		})
		childRef.current.setModal(true);
	}

	//刷新数据
	const refreshdata=()=>{
		dispatch({
			type: 'device/queryRule',
			payload: searchList,
		})
	}

	return (
		<div>
			<Card className='paddings' bordered={false}>
				<div className={styles2.tableList}>
					<div className={styles2.tableListForm}>
						{renderSimpleForm()}
					</div>
				</div>
			</Card>	
			<Card title='设备列表' style={{ marginTop: '20px'}}>
				<Button icon="plus" type="primary" onClick={addDevice} style={{ marginBottom: '20px'}}>新增</Button>
				<Table 
					className={styles.marginTop} 
					columns={columns} 
					dataSource={data}
					pagination={false}
				/>
				<Pagination
					style={{padding: "20px 0 0",textAlign: "center", marginBottom: '10px'}}
					showSizeChanger
					showQuickJumper
					showTotal={showTotalG}
					onChange={getNowPageG}
					onShowSizeChange={onShowSizeChange}
					defaultCurrent={1}
					total={paginationG.total}
					current={paginationG.current} 
				/>
				<AddDeviceForm
					dispatch={dispatch}
					modalVisible={showModal}
				/>
				<ChooseMan
					bindIds={bindIds}
					equDetail={equDetail}
					ref={childRef}
					refreshdata={refreshdata}
				/>
				<EditDeviceForm
					dispatch={dispatch}
					modalVisible={editModal}
					defData={editData}
				/>
			</Card>
		</div>
	)
}

//添加设备
const AddDeviceForm = Form.create()((props) => {
	const { form,modalVisible,dispatch } = props;
	//确定
	const okHandle = () => {
		form.validateFields((err, values) => {
			if (err) return
			values.createrId = userIds
			//保存
			dispatch({
				type: 'device/deviceSave',
				payload: values,
				address: 0,
			})
		    dispatch({
				type: 'device/showModal',
				payload: false,
			})
			//清空文本框的值
			const fields = form.getFieldsValue()
			for (let item in fields) {
				if ({}.hasOwnProperty.call(fields, item)) {
					if (fields[item] instanceof Array) {
					fields[item] = []
					} else {
					fields[item] = undefined
					}
				}
			}
			form.setFieldsValue(fields)
		});
	} 
	const cancle =()=>{
		dispatch({
			type: 'device/showModal',
			payload: false,
		})
	}
	return (
		<Modal
			title="添加设备"
			visible={modalVisible}
			onOk={okHandle}
			onCancel={cancle}
			width='600px'
		>
			<FormItem
				{...formItemLayout}
				label="设备名称"
			>
				{form.getFieldDecorator('equName',{
					rules: [{
						required: true,
						message: '请输入设备名称',
					}],
				})(
					<Input placeholder='请输入'/>
				)}
			</FormItem>
			<FormItem
				{...formItemLayout}
				label="设备编号"
			>
				{form.getFieldDecorator('equCode',{
					rules: [{
						required: true,
						message: '请输入设备编号',
					}],
				})(
					<Input placeholder='请输入'/>
				)}
			</FormItem>
		</Modal>
	)
})

//修改设备
const EditDeviceForm = Form.create()((props) => {
	const { form,modalVisible,dispatch,defData } = props;
	//确定
	const okHandle = () => {
		form.validateFields((err, values) => {
			if (err) return
			let _ars = defData
			_ars.equName = values.equName
			_ars.equCode = values.equCode
			//保存
			dispatch({
				type: 'device/deviceSave',
				payload: _ars,
				address: 0,
			})
		    dispatch({
				type: 'device/editModal',
				payload: false,
			})
			//清空文本框的值
			const fields = form.getFieldsValue()
			for (let item in fields) {
				if ({}.hasOwnProperty.call(fields, item)) {
					if (fields[item] instanceof Array) {
					fields[item] = []
					} else {
					fields[item] = undefined
					}
				}
			}
			form.setFieldsValue(fields)
		});
	} 
	const cancle =()=>{
		dispatch({
			type: 'device/editModal',
			payload: false,
		})
	}
	return (
		<Modal
			title="修改设备"
			visible={modalVisible}
			onOk={okHandle}
			onCancel={cancle}
			width='600px'
		>
			<FormItem
				{...formItemLayout}
				label="设备名称"
			>
				{form.getFieldDecorator('equName',{
					initialValue: defData==null?'':defData.equName,
					rules: [{
						required: true,
						message: '请输入设备名称',
					}],
				})(
					<Input placeholder='请输入'/>
				)}
			</FormItem>
			<FormItem
				{...formItemLayout}
				label="设备编号"
			>
				{form.getFieldDecorator('equCode',{
					initialValue: defData==null?'':defData.equCode,
					rules: [{
						required: true,
						message: '请输入设备编号',
					}],
				})(
					<Input placeholder='请输入' disabled/>
				)}
			</FormItem>
		</Modal>
	)
})

export default connect(({ loading,device }) => ({ loading,device }))(Form.create()(Device))
