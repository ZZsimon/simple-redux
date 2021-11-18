// 生成默认的state和监听函数数组
// 返回dispatch、subscribe等函数
function createStore(reducer, preloadedState, enhancer) {
    // 当传入applyMiddleware方法的时候，preloadedState就是一个函数：createStore(reducer,applyMiddleware(createThunkMiddleware))
    // applyMiddleware(createThunkMiddleware)返回的是一个函数，同时enhancer是undefined
    // 此时，把函数赋值给enhancer，preloadedState设为{}
    // 因此applyMiddleware返回的函数会赋值给enhancer
    if (!enhancer && typeof preloadedState === "function") {
        enhancer = preloadedState
        preloadedState={}
    }
    // 如果发现有enhancer，就说明应用了中间件
    // enhancer方法需要接收一个参数：createStore方法
    // 直接执行enhancer方法，获取它返回的方法。其实这个返回的方法就是createStore方法
    // 然后再传入reducer, preloadedState，调用这个返回的方法。此时就和正常调用createStore方法一样了
    // 因此需要看一下applyMiddleware方法执行后返回的函数是怎么样的
    if(enhancer && typeof enhancer === "function"){
        // enhancer(createStore)(reducer, preloadedState)
        // 这个函数最终执行完，会返回一个store对象，只不过里面的dispatch已经不是默认的dispatch方法了
        // 它被改造过了
        return enhancer(createStore)(reducer, preloadedState)
    } 


    
    let currentReducer = reducer // 当前store中的reducer
    let currentState = preloadedState // 当前store中存储的状态
    let currentListeners = [] // 当前store中放置的监听函数
    let nextListeners = currentListeners // 下一次dispatch时的监听函数
    // 注意：当我们新添加一个监听函数时，只会在下一次dispatch的时候生效。
    let isDispatch = false;
    
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
        if (isDispatch) return action
        // dispatch必须一个个来
        isDispatch = true

        // 调用reducer，得到新state
        currentState = currentReducer(currentState, action);
        isDispatch = false
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