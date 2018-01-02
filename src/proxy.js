// 代理getUIState的第一个参数，
// eg 使用$connect构建的组件，实例化时传入prefix 为{A: 'tab1'},
// 那么getUIState在获取A model的时候，返回的是A.state.tab1下的属性和值
export const proxyStateForUI = (st, prefix) => {

    const state = Object.create(st);
    const propertyNames = Object.getOwnPropertyNames(st);

    propertyNames.map(name => {
        const namespace = Object.keys(prefix).find(namespace => namespace === name);
        if (namespace) {
            const value = st[namespace][prefix[namespace]];
            Object.defineProperty(state, namespace, {
                get() {
                    return value;
                }
            });
        } else {
            Object.defineProperties(state, {[name]: Object.getOwnPropertyDescriptor(st, name)})
        }
    });

    return state;
};

// dispatch时为action 附加一个参数prefix， prefix所在model根据action.type判断
// 使reducer可以在正确的位置更新状态
export const proxyDispatch = (dispatch, prefix) => {
    return action => {
        prefix = prefix[action.type.split('/')[0]];
        dispatch({
            ...action,
            prefix,
        });
    };
};

// 拿到state[prefix]下的数据
export const proxyGetState = (getState, prefix) => {
    return () => {
        const state = {...getState()};

        Object.keys(prefix).forEach(namespace => {
            state[namespace] = state[namespace][prefix[namespace]];
        });

        return state;
    };
};

// 在state[prefix] 下更新数据
export const proxyReducer = (reducers) => {
    return Object.keys(reducers).reduce((ret, key) => {
        ret[key] = (state, action) => {
            const prefix = action.prefix;

            const result = reducers[key](state[prefix], action);

            return {
                ...state,
                [action.prefix]: {
                    ...result
                }
            };
        };
        return ret;
    }, {});
};