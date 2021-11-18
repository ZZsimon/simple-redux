/**
 * 
 * @param  {...any} funcs 改造函数数组
 * @returns 
 */
function compose(...funcs) {
    // 当未传入函数时，返回一个函数：arg => arg
    if(funcs.length === 0) {
        return arg => arg
    }
    
    // 当只传入一个函数时，直接返回这个函数
    if(funcs.length === 1) {
        return funcs[0]
    }
    
    // 返回组合后的函数
    const fun=(a, b) => {
        const fun22=(...args) => {
            return a(b(...args))
        }
        return fun22
    }

    /**
        开始解析 reduce的过程
        第一步：执行 fun函数
            a：functionA(next) { ... }
            b：functionB(next) { ... }
            a是第1个改造函数，b是第2个改造函数
            返回 一个函数：(...args) => {
                            return  a(b(...args))
                        }
        第二步：还是执行fun函数
            a： (...args) => {
                    return  a(b(...args))
                }
            b：functionC(next) { ... }
            
            返回一个函数：(...args) => {
                            return  a(b(...args))
                        }
        1.开始解析第二步中的b(...args)：
                        其实就是 执行 改造函数functionC(dispatch)，返回一个dispatch函数
        2.然后执行a函数：
                        传入一个dispatch函数，然后执行 
                        返回值是 a( b(...args) )
                        因此需要看一下 a( b(...args) )的过程
            2.1 开始解析b(...args)，args是一个dispatch函数数组
            2.2 b函数就是第2个改造函数，那么它返回的也是一个dispatch函数
            2.3 然后在传入a函数，a函数也是一个改造函数，那么它返回的也是一个dispatch函数
            2.4 因此a( b(...args) )的返回结果就是一个 dispatch函数
            2.5 因此这个函数执行完毕，返回的就是一个 dispatch函数
            2.6 也就是说compose函数执行完，返回的就是一个 dispatch函数
            2.7 本质上就是不断的改造前面传递过来的dispatch函数
    */

    /**
     * 对改造函数使用reduce函数，第一个参数是最后一个
     */

    return funcs.reduce(fun)
}

export default compose
