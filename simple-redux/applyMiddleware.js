import compose from './compose.js'

/**
 * 
 * @param  {...any} middlewares 中间件函数数组 输入参数是dispatch函数，输出也是dispatch函数
 * @returns 
 */
function applyMiddleware(...middlewares) {
    
    // 当调用createStore函数的时候传入了applyMiddleware参数，即 createStore(reducer,applyMiddleware(createThunkMiddleware()))
    // 那么最后返回的结果取决于  enhancer(createStore)(reducer, preloadedState) 的返回结果 ，位置在createStore函数源码中
    // applyMiddleware返回的函数相当于enhancer函数，它固定接收createStore函数作为参数
    // 这个enhancer函数执行完毕后，又返回了一个新函数
    // 这个新函数会接受reducer, preloadedState等参数并调用
    // 因此需要看一下调用新函数做了哪些事情
    //      1.调用createStore方法，就和正常调用一样
    //      2.返回一个store对象，这个对象的dispatch参数已经是改造后的函数啦
    return createStore => {

        return (...args) => {
            
            //用参数传进来的createStore创建一个store
            const store  = createStore(...args)
            //注意，我们在这里需要改造的只是store的dispatch方法
            
            // 定义了一个临时的dispatch，后面会被覆盖
            let dispatch = () => { 
                throw new Error(`一些错误信息`)
            } 
            //接下来我们准备将每个中间件与我们的state关联起来（通过传入getState方法），得到改造函数。
            const middlewareAPI = {
                getState: store.getState,
                dispatch: (...args) => dispatch(...args)
            }
            // middleware就是function({ dispatch }) { ... }
            // 执行后返回的函数是 function(next) { ... } 接受一个action
            // 也就是说 chain中所有的函数都是 中间件函数创建的「改造函数」
            // 「改造函数」要求输入一个dispatch参数，返回一个拥有中间件逻辑的dispatch函数
            const chain = middlewares.map(middleware => middleware(middlewareAPI))
            
            // compose本质上就是不断的改造前面传递过来的dispatch函数
            // 最终返回一个被全部改造完毕的dispatch函数
            dispatch = compose(...chain)(store.dispatch)
            
            // 返回store，用改造后的dispatch方法替换store中的dispatch
            return {
                ...store,
                dispatch
            }
        }
    }
}

export default applyMiddleware
