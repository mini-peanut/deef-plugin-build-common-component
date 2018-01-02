# deef插件：build-common-component
用于封装大型公共业务组件

本插件在model中加入prefix字段，数据的读写都自动代理到相应prefix中，使用起来更简单，一个model即可解决所有问题


## 特点
- 除了model中加入prefix字段和组件实例化时额外插入一个prefix参数, 其他的写法完全与deef组件一致
- 只有两个api($connect, $model)，用法与之前的app.connect和app.model完全一致
- 组件更易于维护
- 数据之间不会产生干扰

## 原理

- 在原来model的基础上加一个字段prefix，注入model时，同一份数据根据prefix被分发为多份
- 引用组件时，传入prefix，格式为{namespace: prefix} 这个参数决定了
 1. getUIState，找到相应的namespace时，会映射到哪个prefix上的数据
 2. getState 会在找到相应的model后，找到哪个prefix上的数据
 2. dispatch 时会将action额外附加上这个参数，prefix
 3. reducer收到dispatch的action后，会根据action的prefix，决定最终更新哪个prefix下的state

### 如何用
app.js 引入deef-plugin-build-common-component

1. 项目引用
```js
import deef from 'deef';
import buildCommonComponent from 'deef-plugin-build-common-component';

const app = deef();

export const connect = app.connect;
export const {$model, $connect} = buildCommonComponent(app);

```

index.js 入口处注入公共组件的model
```javascript
import app, {$model} from 'feedAds/app';
import modelList from './models';
import commonModelList from './commonModels';

const initApp = () => {
    modelList.map(model => app.model(model));
    commonModelList.map(model => $model(model)) // 在这里注入公共组件的model
} 
```

2. 组件写法
eg: 
model todo.js 相对之前多加一个prefix字段，需为数组格式
```javascript
export default {
    namespace: 'todo',
    prefix: ['todo1'], // 多加一个prefix字段
    state: {},
    reducers: {}
}
```

index.js 不同之处仅仅在于加了一个$
```js
import {$connect} from 'app';
export default $connect(getUIState, callbacks)(UI); 

```
 
 UI.js 引用时仅仅需要多传入一个参数prefix
```js
import Component from './path/../';

export default () => {
    return <div>
    // otherElement
    <Component {{prefix: {todo: 'todo1'}}}/>
</div>
}
```