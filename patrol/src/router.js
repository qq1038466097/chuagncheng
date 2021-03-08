import React from 'react'
import { LocaleProvider } from 'antd';
import { HashRouter as Router, Switch, Route, Redirect, routerRedux  } from 'dva/router'
import dynamic from 'dva/dynamic'
import App from 'routes/app'
import zhCN from 'antd/lib/locale-provider/zh_CN';

const { ConnectedRouter } = routerRedux

const Routers = function ({ history, app }) {
  const error = dynamic({
    app,
    path: '/404',
    models: () => [import('./models/error')],
    component: () => import('./routes/error'),
  })
  const routes = [ 
    {
      path: '/dataSet',//点位
      models: () => [import('./models/product/dataSet')],
      component: () => import('./routes/product/dataSet'),
    },
    {
      path: '/message',//短信配置
      models: () => [import('./models/product/message')],
      component: () => import('./routes/product/message'),
    },
    {
      path: '/notice',//临时消息
      models: () => [import('./models/product/notice')],
      component: () => import('./routes/product/notice'),
    },
    {
      path: '/dot',//点位
      models: () => [import('./models/product/dot')],
      component: () => import('./routes/product/dot'),
    },
    {
      path: '/dot/dotAdd',//点位新增
      models: () => [import('./models/product/dotAdd')],
      component: () => import('./routes/product/dotAdd'),
    },
    {
      path: '/dot/dotEdit',//点位编辑
      models: () => [import('./models/product/dotEdit')],
      component: () => import('./routes/product/dotEdit'),
    },
    {
      path: '/dotType',//点位类型
      models: () => [import('./models/product/dotType')],
      component: () => import('./routes/product/dotType'),
    },
    {
      path: '/dotType/add',//点位类型-add
      models: () => [import('./models/product/dotTypeAdd')],
      component: () => import('./routes/product/dotTypeAdd'),
    },
    {
      path: '/dotType/Edit',//点位类型-修改
      models: () => [import('./models/product/dotTypeEdit')],
      component: () => import('./routes/product/dotTypeEdit'),
    },
    {
      path: '/dotRule',//点位条例
      models: () => [import('./models/product/dotRule')],
      component: () => import('./routes/product/dotRule'),
    },
    {
      path: '/dotRule/add',//点位条例
      models: () => [import('./models/product/dotRuleAdd')],
      component: () => import('./routes/product/dotRuleAdd'),
    },
    {
      path: '/dotRule/edit',//点位条例
      models: () => [import('./models/product/dotRuleEdit')],
      component: () => import('./routes/product/dotRuleEdit'),
    },
    {
      path: '/404',//404
      models: () => [import('./models/error')],
      component: () => import('./routes/error'),
    },
	  {
      path: '/login',//登录
      models: () => [import('./models/login/login')],
      component: () => import('./routes/login/index'),
    },
    {
      path: '/upPassword',//修改密码
      models: () => [import('./models/login/upPassword')],
      component: () => import('./routes/login/upPassword'),
    },
    {
      path: '/organization',//商户后台-组织管理
      models: () => [import('./models/system/organization')],
      component: () => import('./routes/system/organization'),
    },
    {
      path: '/organization/addOrganization',
      models: () => [import('./models/system/addOrganization')],
      component: () => import('./routes/system/addOrganization')
    },
    {
      path: '/organization/editOrganization',
      models: () => [import('./models/system/editOrganization')],
      component: () => import('./routes/system/editOrganization')
    },
    {
      path: '/organization/orgInfo',
      models: () => [import('./models/system/orgInfo')],
      component: () => import('./routes/system/orgInfo')
    },
    {
      path: '/screen',
      models: () => [import('./models/product/screen')],
      component: () => import('./routes/product/screen')
    },
    //自定义功能
    {
      path: '/funsList',
      models: () => [import('./models/system/funsList')],
      component: () => import('./routes/system/funsList')
    },
    {
      path: '/funsList/add',
      models: () => [import('./models/system/funsAdd')],
      component: () => import('./routes/system/funsAdd')
    },
    {
      path: '/funsList/edit',
      models: () => [import('./models/system/funsEdit')],
      component: () => import('./routes/system/funsEdit')
    },
    //角色管理
    {
      path: '/roleBind',
      models: () => [import('./models/system/roleBind')],
      component: () => import('./routes/system/roleBind')
    },
    {
      path: '/roleBind/add',
      models: () => [import('./models/system/roleBindAdd')],
      component: () => import('./routes/system/roleBindAdd')
    },
    {
      path: '/roleBind/edit',
      models: () => [import('./models/system/roleBindEdit')],
      component: () => import('./routes/system/roleBindEdit')
    },
    //周报分析analyWeek
    {
      path: '/analyWeek',
      models: () => [import('./models/analy/analyWeek')],
      component: () => import('./routes/analy/analyWeek')
    },
    {
      path: '/analyday',
      models: () => [import('./models/analy/analyday')],
      component: () => import('./routes/analy/analyday')
    },
    {
      path: '/analyCycle',
      models: () => [import('./models/analy/analyCycle')],
      component: () => import('./routes/analy/analyCycle')
    },
    {
      path: '/device',
      models: () => [import('./models/product/device')],
      component: () => import('./routes/product/device')
    },
    {
      path: '/mapSet',
      models: () => [import('./models/product/mapSet')],
      component: () => import('./routes/product/mapSet')
    },
  ]
  return (
    <ConnectedRouter history={history}>
      <LocaleProvider locale={zhCN}>
        <App>
          <Switch>
            <Route exact path="/" render={() => (<Redirect to="/dot" />)} />
              {
                routes.map(({ path, ...dynamics }, key) => (
                  <Route key={key}
                    exact
                    path={path}
                    component={dynamic({
                      app,
                      ...dynamics,
                    })}
                  />
                ))
              }
            <Route component={error} />
          </Switch>
        </App>
	    </LocaleProvider>
    </ConnectedRouter>
  )
}
export default Routers
