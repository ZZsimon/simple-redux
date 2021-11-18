function createThunkMiddleware() {
    return function({ dispatch }) { // 这是「中间件函数」
        //参数是store中的dispatch和getState方法

        return function(next) { // 这是中间件函数创建的「改造函数」
            
            //参数next是被当前中间件改造前的dispatch
            //因为在被当前中间件改造之前，可能已经被其他中间件改造过了，所以不妨叫next
            return function(action) { // 这是改造函数「改造后的dispatch方法」
                if (typeof action === 'function') {
                  //如果action是一个函数，就调用这个函数，并传入参数给函数使用
                  return action(dispatch);
                }
                
                //否则调用用改造前的dispatch方法
                return next(action);
            }
        } 
    }
}

export default createThunkMiddleware

