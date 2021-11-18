/**
    reduce() 方法接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，
    最终计算为一个值。
    reduce() 可以作为一个高阶函数，用于函数的 compose。
 */

var numbers = [65, 44, 12, 4];
 
function getSum(total, num) {
    return total + num;
}
const num=numbers.reduce(getSum)

console.log(num, 'num')


function chained(funcs) {
    return function(input){
      return funcs.reduce(
          function(input, fn){ return fn(input) }, 
          input
        );
    }
}

function fun01(x){ return x+2}
function fun02(x){ return x*2}

var initValue=1
chained([fun01,fun02])(initValue)
/**
    第一步：返回
        function(input){
            return funcs.reduce(
                function(input, fn){ return fn(input) }, 
                input
            );
        }
    第二步执行：
        function(input){
            return funcs.reduce(
                function(input, fn){ return fn(input) }, 
                input
            );
        }
    第三步执行代码：
        funcs.reduce(
          function(input, fn){ return fn(input) }, 
          input
        );
        同时返回这个执行后的结果
    
 */

/**
    开始解析 reducede的过程
    第一步：input=1 然后执行 
        function(input, fn){ 
            return fn(input)
        }
        返回：fun01(1)执行后的结果 fn是传入的第一个函数fun01
    第二步：还是执行这个函数，只不过input是fun01(1)执行后的结果，fn变成了第二个函数fun02

        function(input, fn){ 
            return fn(input)
        }
        返回：fun02(fun01(1)执行后的结果)
    这样，就达到了传入的多个函数按照顺序执行，最终返回最后一个函数执行后返回的结果
 */