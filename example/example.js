import {createStore,applyMiddleware} from '../simple-redux/index.js';

import reducer from './reducers/index.js'
import createThunkMiddleware from './createThunkMiddleware.js'

// 默认第一次会执行一次默认的dispatch，action的值是随机生成的字符串
// 因此会走reducer默认action分支，生成默认的state数据
let store = createStore(reducer,applyMiddleware(createThunkMiddleware()))
// applyMiddleware(createThunkMiddleware()) 执行后返回的是一个函数

store.subscribe(() => console.log(store.getState()))

// dispatch方法会做2件事情
// 1. 执行传入store的reducer
// 2. 执行subscribe方法的回调函数
store.dispatch({ type: 'counter/incremented' })
store.dispatch({ type: 'todo/incremented' })

const counterIncrementedTimeout = () => {
    return (dispatch) => { 
        setTimeout(()=>{
            dispatch({
                type:'counter/incremented',
            })
        }, 1000)
    }


    
}

store.dispatch(counterIncrementedTimeout())