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
            //到这里时有一个问题:
            //就是如果子reducer不能处理该action，那么会返回 previousStateForKey
            //也就是旧状态，当所有状态都没改变时，我们直接返回之前的state就可以了。
            hasChanged = hasChanged || previousStateForKey !== nextStateForKey
        }
        return hasChanged ? nextState : state
    }
} 


export default combineReducers
