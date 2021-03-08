import { useState, useEffect,useImperativeHandle,forwardRef  } from 'react';
import { Button,Table,Modal,Input,Row, Col, Pagination,TreeSelect,message } from 'antd';
import styles from '../main.less';
import { Link } from 'react-router-dom'
import { cardUrl,userIds} from '../../utils/config';
import request from '../../utils/request';
const confirm = Modal.confirm;

//获取员工数据
async function getMan(search,Fun,Fun2,Fun3){
    Fun2(true);
    let _url = cardUrl+'employee/list';
    const datas = await request(_url,{
        method: 'POST',
        body: search,
    })
    if(datas.code==200&&datas.data!==null&&datas.data.data!==null){
        let _datas = datas.data.data;
        Fun(_datas)
        Fun2(false);
        //分页
        let _pag={}
        _pag.total= datas.data.totalCount
        _pag.pageSize= datas.data.pageSize
        _pag.current= datas.data.currentIndex
        //计算总共多少页
        let _nums = Math.ceil(datas.data.totalCount/datas.data.pageSize)
        _pag.pageCount =_nums
        Fun3(_pag)
    }else{
        let _pag={}
        _pag.total= 0
        _pag.pageSize= 0
        _pag.current= 0
        _pag.pageCount=0
        //分页
        Fun([])
        Fun2(false);
        Fun3(_pag)
    }
}
//绑定
async function bindMan(search,funs){
    let _url = cardUrl+'equipment/save';
    const datas = await request(_url,{
        method: 'POST',
        body: search,
    })
    if(datas.code==200){
        message.success('操作成功！')
        //回调，刷新并且关闭弹窗
        funs()
    }
}
function setOrgs(datas){
    for(let i=0; i<datas.length; i++){
        let _da = datas[i]
        _da.label = _da.orgName
        _da.value = _da.id
        if(_da.children&&_da.children.length>0){
            setOrgs(_da.children)
        }
    }
    return datas;
}
const ChooseMan = forwardRef((props,cRef)=> {
    //fu组件调用方法
  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cRef, () => ({
    // changeVal 就是暴露给父组件的方法
    name: 'xiaoxige',
    removeBind: (val) => {
        confirm({
			title: '确认要将设备从该人员解除绑定？',
			okText: '确定',
			cancelText: '取消',
			onOk() {
				removeBind(val);
			}
		})
    },
    setModal: (val)=>{
        setshowmodal(val)
    }
  }));
  //只允许执行一次
  const [count,setcount] = useState(0);
  const [showmodal,setshowmodal] = useState(false);
  //分页参数
  const [pagination,setpagination] = useState({});
  const [pageindex,setpageindex] = useState(1);
  const [pagesize,setpagesize] = useState(10);
  //查询条件
  const [searchList,setSearchList] = useState({});
  //员工姓名
  const [name,setName] = useState(null);
  //加载中
  const [isLoading,setisLoading] = useState(false);
  //机构-下拉数据
  const [orgData,setOrgDatas] = useState([]);
  //列表数据
  const [manData,setManData] = useState([]);
  //选中的机构-查询条件
  const [chooseId,setChooseId] = useState(null);
  //关闭窗口
  const cancelMan=()=>{
    setshowmodal(false);
  }
  //下拉机构，确认选中
  const onChangeTree =(value)=>{
    setChooseId(value);
  }
  const changeName=(e)=>{
    setName(e.target.value)
  } 
  //搜索
  const searchDevice=()=>{
    let search={}
    search.name = name
    search.orgId = chooseId
    search.pageSize=pagesize
    setSearchList(search)
    getMan(search,setManData,setisLoading,setpagination)
  }
  //重置
  const resetDevice=()=>{
    setChooseId(null);
    setName(null);
    let search={}
    search.name = null
    search.orgId = null
    search.pageSize=pagesize
    setSearchList({})
    getMan(search,setManData,setisLoading,setpagination)
  }
  //表头
  const columnsBind=[{
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => {
        let _ref = 'organization/orgInfo?ids='+record.id
        return (
            <Link to={_ref}>{record.name}</Link>
        )
    }
  },
  {
    title: '职位',
    dataIndex: 'position',  
    key: 'position',
  },
  {
    title: '手机',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '操作',
    dataIndex: 'system',
    key: 'system',
    render: (text, record) => {
        return (
            <div>
                {
                    props.equDetail.bindId!==null&&record.id == props.equDetail.employeeId?
                    <a className={styles.orangeBg}>已绑定</a>
                    :
                    <a onClick={bindOne.bind(this,record.id)}>绑定</a>
                }
            </div>
        )
    }
  }]
  //绑定到人
  const bindOne = (ids)=>{
        let _ars = props.equDetail
        let _ar = {}
        _ar.tarId = ids
        _ar.equipmentId = props.bindIds
        _ar.bindId = userIds
        _ars.bindRel = _ar
        //绑定
        bindMan(_ars,closeModal)
  }
  //回调,关闭弹窗,刷新数据
  const closeModal=()=>{
    setshowmodal(false)
    //刷新列表数据
    props.refreshdata()
  }

  //解绑
  const removeBind = (val)=>{
    let _no = {}
    _no.bindId = null
    _no.tarId = null
    _no.equipmentId = val.equId
    let _ars = val
    _ars.bindId = null
    _ars.bindName = null
    _ars.bindRel = _no
    //绑定
    bindMan(_ars,closeModal)
}
  //获取机构数据
    useEffect(()=>{
        //默认执行一次searchDevice
        if(props.equDetail!==null&&count<1){
            searchDevice();
            const fetchData = async () => {
                let _url2 = cardUrl+'org/list';
                const datas2 = await request(_url2,{
                    method: 'POST',
                    body: {},
                })
                if(datas2.code==200&&datas2.data!==null){
                    let _datas = datas2.data;
                    let _datas2 = setOrgs(_datas)
                    setOrgDatas(_datas2)
                }
            }
            fetchData()
            setcount(count+1)
        }
    });

  /**分页合集---分组分页 start **/
	const showTotalG = (total) => {
		return `共 ${pagination.total} 条 第 ${pagination.current} / ${pagination.pageCount} 页`;
    }
    const onShowSizeChange =(current, pageSize) => {
        const postObj = {
			"pageIndex": current,
			"pageSize": pageSize,
        }
        setpageindex(current)
        setpagesize(pageSize)
        //判断查询条件
        if(JSON.stringify(searchList)!=='{}'){
            let _c=searchList
			_c.pageIndex = postObj.pageIndex
			_c.pageSize = postObj.pageSize
            getMan(_c,setManData,setisLoading,setpagination)
            setSearchList(_c)
        }else{
            getMan(postObj,setManData,setisLoading,setpagination)
            setSearchList(postObj)
		}
    }
    const getNowPageG =(current,pageSize) => {
        let postObj = {
            "pageIndex": current,
            "pageSize": pageSize
		}
        setpageindex(current)
        setpagesize(pageSize)
        //判断查询条件
        if(JSON.stringify(searchList)!=='{}'){
            let _c=searchList
			_c.pageIndex = postObj.pageIndex
			_c.pageSize = postObj.pageSize
            getMan(_c,setManData,setisLoading,setpagination)
            setSearchList(_c)
        }else{
            getMan(postObj,setManData,setisLoading,setpagination)
            setSearchList(postObj)
		}
    }
	/**分页合集---分组分页 end **/
  return (
    <Modal
        title="绑定人员"
        visible={showmodal}
        onCancel={cancelMan}
        width='60%'
        footer={[]}
    >
        <Row className={styles.flexCenter}>
            <Col span={2} className={styles.rightText}>组织机构：</Col>
            <Col span={6}>
                <TreeSelect
                    style={{ width: '100%' }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={orgData}
                    placeholder="请选择"
                    treeDefaultExpandAll
                    onChange={onChangeTree}
                    value={chooseId}
                />
            </Col>
            <Col span={2} className={styles.rightText}>员工姓名：</Col>
            <Col span={6}><Input type='text' placeholder='请输入' onChange={changeName} value={name}/></Col>
            <Col span={8}>
                <Button type='primary' icon='search' className={styles.marginLeft} onClick={searchDevice}> 搜 索 </Button>
                <Button className={styles.marginLeft} onClick={resetDevice} style={{ marginLeft: '20px'}}> 重 置 </Button>
            </Col>
        </Row>
        <div style={{ marginTop: '26px'}}>
            <Table 
                loading={isLoading}
                className={styles.marginTop} 
                columns={columnsBind} 
                dataSource={manData}
                pagination={false}
            />
            {
                manData.length==0?null
                :
                <Pagination
                    style={{padding: "20px 0 0",textAlign: "center", marginBottom: '10px'}}
                    showSizeChanger
                    showQuickJumper
                    showTotal={showTotalG}
                    onChange={getNowPageG}
                    onShowSizeChange={onShowSizeChange}
                    defaultCurrent={1}
                    total={pagination.total}
                    current={pagination.current} 
                />
            }
        </div>
    </Modal>
  );
})

export default ChooseMan;