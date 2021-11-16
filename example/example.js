import {createStore} from '../simple-redux/index.js';

import reducer from './reducers/index.js'

// 默认第一次会执行一次默认的dispatch，action的值是随机生成的字符串
// 因此会走reducer默认action分支，生成默认的state数据
let store = createStore(reducer)

// dispatch方法会做2件事情
// 1. 执行传入store的reducer
// 2. 执行subscribe方法的回调函数
store.dispatch({ type: 'counter/incremented' })
store.dispatch({ type: 'todo/incremented' })

// subscribe的作用是 每次调用dispatch的时候都会执行这个函数
// 那么，这个订阅功能有什么用呢？
// 想一下，如果我们在这个函数中更新view，是不是很酷呢？
// 每次数据更新我们都能做一些事情
store.subscribe(() => console.log(store.getState()))
store.dispatch({ type: 'counter/incremented' })