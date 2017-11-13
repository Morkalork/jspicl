import * as declarationMapper from "./declarations";
import * as expressionMapper from "./expressions";
import * as statementMapper from "./statements";

export const mappers = Object.assign({},
  declarationMapper,
  expressionMapper,
  statementMapper
);

export const generalPolyfills = {
  "Math.max": values => `max(${values})`,
  "Math.floor": value => `flr(${value})`,
  "Object.assign": values => `merge({${values}})`,
  "Object.keys": values => `kvpMap(${values}, function(key, value) return key end)`,
  "Object.values": values => `kvpMap(${values}, function(key, value) return value end)`,
  "Object.entries": values => `kvpMap(${values}, function(key, value) return {key, value} end)`,
  "Math.random": () => "rnd(1)",
  "console.log": argument => `print(${argument})`
};

export const arrayPolyfills = {
  forEach: (context, args) => `foreach(${context}, ${args})`,
  push: (context, args) => `add(${context}, ${args})`,
  join: (context, args) => `join(${context}, ${args})`,
  map: (context, args) => `_map(${context}, ${args})`,
  includes: (context, arg) => `includes(${context}, ${arg})`,
  toString: context => `_tostring(${context})`,
  filter: (context, args) => `_filter(${context}, ${args})`,
  reduce: (context, args) => `_reduce(${context}, ${args})`
};

// TODO: The polyfills should have a prefix to avoid name clashing
export const polyfills = `
function kvpMap(source, mapper)
  local mappedValues = {}
  for key, value in pairs(source) do
    add(mappedValues, mapper(key, value))
  end

  return mappedValues
end
function merge(sources)
  local target = sources[1]
  del(sources, target)
  for source in all(sources) do
    for key, value in pairs(source) do
      target[key] = value
    end
  end

  return target
end
function join(table, separator)
  local result = ""
  for value in all(table) do
    result = result..separator..value
  end

  if (separator != "") then
    result = sub(result, 2)
  end

  return result
end
function includes(arr, value)
  for i = 1, #arr do
    if arr[i] == value then
      return true
    end
  end
  return false
end
function _map(table, args)
  local result = {}
  for value in all(table) do
    add(result, args(value))
  end
  return result
end
function _tostring(input, level)
  level = max(level, 1)
  local output = ""

  if type(input) != "table" then
    return tostr(input)
  end

  local indentation = ""
  for i=2, level do
    indentation = indentation.."  "
  end
    
  for key, value in pairs(input) do
    if type(value) == "table" then
      output = output..indentation.."  "..key..": ".._tostring(value, level + 1).."\n"
    elseif key != value then
        output = output..indentation.."  "..key..": ".._tostring(value, level + 1).."\n"
    else
        output = output..value..", "
    end
  end
  
  if sub(output, -2) == ", " then
      output = indentation.."  "..sub(output, 1, -3).."\n" -- remove last comma
  end
  
  return "{\n"..output..indentation.."}"
end
function _reduce(table, callback, initialvalue)
  local result = table[1]
  local startindex = 2
  if initialvalue then
    result = initialvalue
    startindex = 1
  end
  for i=startindex, #table do
    result = callback(result, table[i])
  end
  return result
end
function _filter(collection, predicate)
  local filteredValues = {}
  for value in all(collection) do
    local result = predicate(value)
    if result then
      add(filteredValues, value)
    end
  end
  return filteredValues
end
`;
