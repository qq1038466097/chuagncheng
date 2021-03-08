import React,{ Fragment } from 'react';
import { connect } from 'dva';
import { Card, Form, Input,Button,} from 'antd';

const FormItem = Form.Item;
import styles from '../main.less'

const formItemLayout = {
	labelCol: {span: 4},
	wrapperCol: {span: 10},
};

const MapSet = ({
	mapSet, 
	dispatch,
	form: {
		getFieldDecorator,
		validateFields,
	},
})=>{
	
	let { datas } = mapSet

	const handleSubmit = (e) => {
		e.preventDefault();
		validateFields((err, values) => {
			if (err) return;
			let _ars={}
			_ars.cfgCode = 'SCREEN.ONLINE.USER.interval'
			_ars.cfgValue = values.cfgValue
			
			dispatch({
				type: 'mapSet/submit',
				payload:_ars
			})

		});
	}

	const onChange=(val)=>{
		console.log(val.target.value)
	}

	return (
		<Fragment>
				<div>
					<Card className='paddings' title='地图配置' style={{ marginTop: 14}} bordered={false}>
						<Form>
							<FormItem
								{...formItemLayout}
								label="地图位置刷新间隔时间"
								>
								{getFieldDecorator('cfgValue', {
									initialValue: null||datas.cfgValue,
								})(
									<Input />
								)}
								<div className={styles.grayColor}>注：间隔时间为秒（s）</div>
							</FormItem>
						</Form>
					</Card>
					<Button type="primary" htmlType="submit" onClick={handleSubmit} style={{ marginTop: '20px'}}>提 交</Button>
				</div>
		</Fragment>
	)
}

export default connect(({ mapSet }) => ({ mapSet }))(Form.create()(MapSet))