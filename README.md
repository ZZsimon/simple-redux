## 为什么需要redux？

随着前端单页应用越来越复杂，前端需要管理的数据状态越来越多。经常会面临这样一个场景：各个层级组件的数据互相依赖，变得混乱无章，难以理解和维护。

<img src='https://awps-assets.meituan.net/mit-x/blog-images-bundle-2017/ab393aa7.png' />


因此有必要将应用中的数据统一放到一个地方，并分类管理起来。


## redux如何使用？
```js

import {createStore} from '../simple-redux/index.js';

import reducer from './reducers/index.js'

// 默认第一次会执行一次默认的dispatch，action的值是随机生成的字符串
// 因此会走reducer默认action分支，生成默认的state数据
let store = createStore(reducer)

// 只有调用dispatch才能更改数据
store.dispatch({ type: 'counter/incremented' })
store.dispatch({ type: 'todo/incremented' })

// subscribe的作用是 每次调用dispatch的时候都会执行这个函数
// 那么，这个订阅功能有什么用呢？
// 想一下，如果我们在这个函数中更新view，是不是很酷呢？
// 每次数据更新我们都能做一些事情
store.subscribe(() => console.log(store.getState()))
store.dispatch({ type: 'counter/incremented' })

```
## redux各个方法实现

#### createStore、subscribe、dispatch、getState
```js
// 生成默认的state和监听函数数组
// 返回dispatch、subscribe等函数
function createStore(reducer, preloadedState, enhancer) {
    if(enhancer){  // 这个我们后面会解释，可以先忽略
        return enhancer(createStore)(reducer, preloadedState)
    } 
    
    let currentReducer = reducer // 当前store中的reducer
    let currentState = preloadedState // 当前store中存储的状态
    let currentListeners = [] // 当前store中放置的监听函数
    let nextListeners = currentListeners // 下一次dispatch时的监听函数
    // 注意：当我们新添加一个监听函数时，只会在下一次dispatch的时候生效。
    
    // 获取state
    function getState() {
        return currentState
    }
    
    // 调用dispatch可以改变store中的值，那么它是怎么改变的呢？
    // dispatch接收一个action
    // 然后调用currentReducer方法，currentReducer是调用createStore传入的reducer
    // 所以需要看一下reducer的代码
    // reducer就是一个纯函数，根据传入的action和当前store中的值，返回一个新数据

    function dispatch(action) {
        // 调用reducer，得到新state
        currentState = currentReducer(currentState, action);
        // 非常简单，更新数据的功能已经完成了

        // 下面是执行监听函数
        // 因为我们会发现redux有一个函数：store.subscribe(() => console.log(store.getState()))
        // 一旦设置了订阅，那么每次dispatch的时候就会调用
        // 所以在这个dispatch源码中，更新完数据后，下面还得执行这些订阅的函数
        // 因此我们得看一下subscribe方法
        
        // 看完之后就可以理解下面的代码，subscribe方法作用就是维护更新监听事件列表nextListeners
        // 更新监听数组
        // 第一次nextListeners=[]
        // 每次调用监听函数的时候都会从nextListeners数组中拿
        currentListeners = nextListeners;
        //调用监听数组中的所有监听函数
        for(let i = 0; i < currentListeners.length; i++) {
            const listener = currentListeners[i];
            listener();
        }
    }

    // 添加一个监听函数，每当dispatch被调用的时候都会执行这个监听函数
    function subscribe(listener) {
        // 添加到监听函数数组，
        // 注意：我们添加到了下一次dispatch时才会生效的数组
        nextListeners.push(listener)
        
        let isSubscribe = true //设置一个标志，标志该监听器已经订阅了
        // 返回取消订阅的函数，即从数组中删除该监听函数
        return function unsubscribe() {
            if(!isSubscribe) {
                return // 如果已经取消订阅过了，直接返回
            }
            
            isSubscribe = false
            // 从下一轮的监听函数数组（用于下一次dispatch）中删除这个监听器。
            const index = nextListeners.indexOf(listener)
            nextListeners.splice(index, 1)
        }
    }
    

    // 调用createStore的时候就会调用一次dispatch
    // 此时action的type源码中是一个随机生成的字符串
    // 这样就会走用户定义的reducer函数的默认分支，因为匹配不到任何一个action
    // 而一旦调用reducer函数，就会根据action生成一份新的state值
    // 这时的state值，就是reducer函数中定义的默认返回数据

    // 第一次调用的时候监听函数是空的
    dispatch({ type:'' })


    return {
        dispatch,
        subscribe,
        getState,
    }
}

export default createStore

```
#### combineReducers
```js
/**
    循环执行每一个reducer
    由于每一个action都是唯一的
        1.如果是遍历到的reducer有这个action，那么reducer会返回新数据。
        2.如果是遍历到的reducer没有这个action，那么应该会返回原数据
 */
function combineReducers(reducers) {
    //先获取传入reducers对象的所有key
    const reducerKeys = Object.keys(reducers)
    const finalReducers = {} // 最后真正有效的reducer存在这里
    
    //下面从reducers中筛选出有效的reducer
    for(let i = 0; i < reducerKeys.length; i++){
        const key  = reducerKeys[i]
        
        if(typeof reducers[key] === 'function') {
            finalReducers[key] = reducers[key] 
        }
    }
    const finalReducerKeys = Object.keys(finalReducers);
    //返回合并后的reducer
    return function combination(state= {}, action){
  		//这里的逻辑是：
    	//取得每个子reducer对应的state，与action一起作为参数给每个子reducer执行。
    	let hasChanged = false //标志state是否有变化
        let nextState = {}
        for(let i = 0; i < finalReducerKeys.length; i++) {
            const key = finalReducerKeys[i]
            // reducer是一个纯函数
            const reducer = finalReducers[key]
            // 得到该子reducer对应的旧状态
            // 这里可以获取到是因为第一次就设置了key值：nextState[key] = nextStateForKey
            // 然后把nextState返出去，赋值给了store中的state
            const previousStateForKey = state[key]
            // 调用子reducer得到新状态
            const nextStateForKey = reducer(previousStateForKey, action)
            // 存到nextState中（总的状态）
            // 利用key值来区分每一个reducer的state值
            // 获取的时候也利用key获取：const previousStateForKey = state[key]
            nextState[key] = nextStateForKey
            hasChanged = hasChanged || previousStateForKey !== nextStateForKey
        }
        return hasChanged ? nextState : state
    }
} 


export default combineReducers


```
