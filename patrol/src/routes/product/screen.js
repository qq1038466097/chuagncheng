import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Form} from 'antd';
import styles from '../main.less';

const Screen = ({
	screen, 
	dispatch,
	loading,
	formValues, //搜索条件
	form: {
		getFieldDecorator,
		setFieldsValue,
		getFieldsValue
	},
})=>{
	
	const tohref = ()=>{
		const w=window.open('about:blank');
		w.location.href="www.baidu.com"
	}
	
	return (
		<div>
			<a className={styles.screenHref} onClick={tohref}>点击跳转到大屏展示</a>
		</div>
	)
}

export default connect(({ screen,loading }) => ({ screen,loading }))(Form.create()(Screen))