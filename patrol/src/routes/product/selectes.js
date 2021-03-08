import React, { PureComponent } from 'react';
import { Select } from 'antd'

class Selectes extends PureComponent{
	constructor(props) {
	  super(props);
	  this.state = {
		currency: 'rmb',
	  }
	  //this.handleCurrencyChange = this.handleCurrencyChange.bind(this)
	}

	setarea=()=>{
		console.log('666')
		let _data = this.props.datas //areaName
		let _option=[]
		for(let i=0; i<_data.length; i++){
			let _op=<Select.Option value={_data[i]} key={i}>{_data[i]}</Select.Option>
			_option.push(_op)
		}
		return _option
	}

	/*handleCurrencyChange = (currency) => {
		if (!('value' in this.props)) {
		  this.setState({ currency });
		}
		this.triggerChange({ currency });
	}

	triggerChange = (changedValue) => {
		// Should provide an event to pass value to Form.
		const onChange = this.props.onChange;
		if (onChange) {
			onChange(Object.assign({}, this.state, changedValue));
		}
	}*/
	

	render() {
		return (
			<Select placeholder='请设置111' >
				{this.setarea()}
			</Select>
		);
	}
  }
  
  export default Selectes
