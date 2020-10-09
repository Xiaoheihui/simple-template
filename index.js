const prettier = require('prettier');
const fs = require('fs-extra');
const md5 = require('md5');
const { stat } = require('fs');

const cache = {};

const addStatement = (tplStr, statement, js) => {
    // 匹配js语句的正则表达式
    const regExpression = /(for|if|else|switch|case|break|{|})/g;
    // 对传入的字符串做预处理，空白字符转换成空字符串，对反斜杠与单引号做转义
    tplStr = tplStr.replace(/[\r\t\n]/g,'' )
                   .replace(/\\/g, '\\\\')
                   .replace(/'/g, "\\'");
    
    // 分三种情况：
    // 1、html：添加 `statements.push('${tplStr}');`
    // 2、js变量： 添加 `statements.push(${tplStr});`
    // 3、js语句： 直接添加匹配到的tplStr
    statement += js ? tplStr.match(regExpression) ? tplStr : `statements.push(${tplStr});` : `statements.push('${tplStr}');`;
    return statement;
}

const tplFuncGenerate = async (tpl)=>{
    // 游标位置，记录我们处理到的分割字符串的位置
    let cursor = 0;
    // 用于记录我们生成的语句
    let statements =  'const statements = [];';
    // 用于匹配<%= %>与<% %>里面的内容
    let regTpl = /<%=?\s*([^%>]+?)\s*%>/g;

    while(match = regTpl.exec(tpl)){
        // <%= %>与<% %>之外的内容
        statements = addStatement(tpl.slice(cursor, match.index), statements);
        // <%= %>与<% %>里面的内容，可能是变量也可能是语句
        statements = addStatement(match[1], statements, true);
        // 更新我们的游标位置，更新为上一个<%= %>或<% %>之后
        cursor = match.index + match[0].length;
    }

    // 加上模板中的最后一个html字符串
    statements = addStatement(tpl.slice(cursor), statements);
    // 将里面的数组合并，生成最终字符串
    statements += 'return statements.join("")';
    return statements;
}

const tplEngine = async ({tpl, inputPath, outputPath, data}) => {
    let func;

    if(inputPath){
        tpl = await fs.readFile(inputPath, 'utf8');
    }
    // 做一次md5散列
    tplToken = md5(tpl);
    // 判断缓存中有无对应的模板生成函数
    if(cache[tplToken]){
        func = cache[tplToken];
    }else{
        const funcStr = await tplFuncGenerate(tpl);
        const funcStrLint = prettier.format(funcStr, { parser: 'babel' });
        func = new Function(funcStrLint);
        // 将新生成的模板生成函数加入缓存中
        cache[tplToken] = func;
    }

    const result = func.apply(data);

    if(outputPath){
        await fs.outputFile(outputPath, result)
    }

    return result;
}

module.exports = {
    tplEngine
}

