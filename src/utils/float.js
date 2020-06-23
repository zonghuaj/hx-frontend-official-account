/*
 * 判断obj是否为一个整数
 */
function isInteger (obj) {
  return Math.floor(obj) === obj;
}

/*
 * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
 * @param floatNum {number} 小数
 * @return {object}
 *   {times:100, num: 314}
 */
function toInteger (floatNum) {
  const ret = { times: 1, num: 0 };
  if (isInteger(floatNum)) {
    ret.num = floatNum;
    return ret;
  }
  const strfi = floatNum + '';
  const dotPos = strfi.indexOf('.');
  const len = strfi.substr(dotPos + 1).length;
  const times = Math.pow(10, len);
  const intNum = parseInt(floatNum * times + 0.5, 10);
  ret.times = times;
  ret.num = intNum;
  return ret;
}

/*
 * 核心方法，实现加减乘除运算，确保不丢失精度
 * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
 *
 * @param a {number} 运算数1
 * @param b {number} 运算数2
 * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
 *
 */
function operation (a, b, op) {
  const o1 = toInteger(a);
  const o2 = toInteger(b);
  const n1 = o1.num;
  const n2 = o2.num;
  const t1 = o1.times;
  const t2 = o2.times;
  const max = t1 > t2 ? t1 : t2;
  let result = null;
  switch (op) {
    case 'add':
      if (t1 === t2) {
        result = n1 + n2;
      } else if (t1 > t2) {
        result = n1 + n2 * (t1 / t2);
      } else {
        result = n1 * (t2 / t1) + n2;
      }
      return result / max;
    case 'subtract':
      if (t1 === t2) {
        result = n1 - n2;
      } else if (t1 > t2) {
        result = n1 - n2 * (t1 / t2);
      } else {
        result = n1 * (t2 / t1) - n2;
      }
      return result / max;
    case 'multiply':
      result = (n1 * n2) / (t1 * t2);
      return result;
    case 'divide':
      result = (n1 / n2) * (t2 / t1);
      return result;
  }
}

function add (value1, value2, precision) {
  precision = precision || 2;
  const pow = Math.pow(10, precision);
  let value = operation(value1, value2, 'add');
  value = Math.round(operation(value, pow, 'multiply')) / pow;
  return value;
}

function subtract (value1, value2, precision) {
  precision = precision || 2;
  const pow = Math.pow(10, precision);
  let value = operation(value1, value2, 'subtract');
  value = Math.round(operation(value, pow, 'multiply')) / pow;
  return value;
}

function multiply (value1, value2, precision) {
  precision = precision || 2;
  const pow = Math.pow(10, precision);
  let value = operation(value1, value2, 'multiply');
  value = Math.round(operation(value, pow, 'multiply')) / pow;
  return value;
}

function divide (value1, value2, precision) {
  precision = precision || 2;
  const pow = Math.pow(10, precision);
  let value = operation(value1, value2, 'divide');
  value = Math.round(operation(value, pow, 'multiply')) / pow;
  return value;
}

function isEqual (value1, value2, precision) {
  return parseFloat(value1).toFixed(precision) === parseFloat(value2).toFixed(precision);
}

const float = {
  add: add,
  subtract: subtract,
  multiply: multiply,
  divide: divide,
  isEqual: isEqual
};

export default float;
