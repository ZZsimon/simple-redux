import combineReducers from '../../simple-redux/combineReducers.js'
import todos from './todos.js'
import counter from './counter.js'

// 最后肯定也是一个纯函数
// 就说明combineReducers函数返回的是一个纯函数
export default combineReducers({
  counter,
  todos,
})