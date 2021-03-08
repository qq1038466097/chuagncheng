import { Component,PureComponent } from "react";
import {connect} from 'dva';

class AddProtest extends PureComponent{
  constructor(props) {
    super(props);
    // 设置 initial state
    this.state = { }
  }

  render() {
    return (
        <div>
           <div>今天是个好日子啊:{JSON.stringify(this.props.names)}</div>
        </div>
    );
  }
}

export default AddProtest
