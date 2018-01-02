import React from 'react';
import invariant from 'invariant';
import {setCache, getCache} from "./cache";
import {proxyStateForUI, proxyGetState, proxyDispatch, proxyReducer} from "./proxy";


export default function (app) {

    return {
        $model,
        $connect
    };

    function $connect(getUIState, callbacks, ...connectArgs) {
        return UI => {
            class ComponentWithPrefix extends React.Component {
                render() {
                    const prefix = this.props.prefix;
                    const cachePath = [getUIState, callbacks, UI, JSON.stringify(prefix)];
                    let Component = getCache(cachePath);

                    if (Component) {
                        return <Component {...this.props}/>;
                    }

                    const wrappedModelGetUIState = (...args) => {
                        const [state, ...extArgs] = args;
                        return getUIState(proxyStateForUI(state, prefix), ...extArgs);
                    };
                    const wrappedModelCallbacks = Object.keys(callbacks).reduce((ret, key) => {
                        ret[key] = ({dispatch, getState}, ...args) => {
                            callbacks[key].call(null, {
                                dispatch: proxyDispatch(dispatch, prefix),
                                getState: proxyGetState(getState, prefix)
                            }, ...args);
                        };
                        return ret;
                    }, {});

                    Component = app.connect(wrappedModelGetUIState, wrappedModelCallbacks, ...connectArgs)(UI);
                    setCache(cachePath, Component);

                    return <Component {...this.props}/>;
                }
            }

            return ComponentWithPrefix;
        }
    }

    function $model(m) {
        invariant(
            m.prefix,
            '[deef-plugin-build-common-componen]->model: prefix should be defined'
        );
        const modelState = {...m.state};

        m.state = m.prefix.reduce((ret, key) => {
            ret[key] = modelState;
            return ret;
        }, {});

        // reducers
        m.reducers = proxyReducer(m.reducers);

        app.model(m);
    }
}
