import React,{ Fragment } from 'react';
import { connect } from 'dva';
import { Card, Form, Radio,Button,} from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
	labelCol: {span: 4},
	wrapperCol: {span: 10},
};

const Message = ({
	message, 
	dispatch,
	form: {
		getFieldDecorator,
		validateFields,
	},
})=>{
	
	let { datas } = message

	const handleSubmit = (e) => {
		e.preventDefault();
		validateFields((err, values) => {
			if (err) return;
			let _ars={}
			_ars.cfgCode = 'WatchEvent.SMS'
			_ars.cfgValue = values.cfgValue
			
			dispatch({
				type: 'message/submit',
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
					<Card className='paddings' title='短信配置' style={{ marginTop: 14}} bordered={false}>
						<Form>
							<FormItem
								{...formItemLayout}
								label="是否发送短信"
								>
								{getFieldDecorator('cfgValue', {
									initialValue: null||datas.cfgValue,
								})(
									<Radio.Group onChange={onChange}>
										<Radio value='1'>发送短信</Radio>
										<Radio value='0'>不发送</Radio>
									</Radio.Group>
								)}
							</FormItem>
						</Form>
					</Card>
					<Button type="primary" htmlType="submit" onClick={handleSubmit} style={{ marginTop: '20px'}}>提 交</Button>
				</div>
		</Fragment>
	)
}

export default connect(({ message }) => ({ message }))(Form.create()(Message))