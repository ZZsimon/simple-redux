function todoReducer(state = { age: 0 }, action) {
    switch (action.type) {
      case 'todo/incremented':
        return { age: state.age + 1 }
      case 'todo/decremented':
        return { age: state.age - 1 }
      default:
        return state
    }
  }

  export default todoReducer