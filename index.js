const prettier = require('prettier');
const fs = require('fs-extra');

const addStatement = (tplStr, statement, js) => {
    const regExpression = /(for|if|else|switch|case|break|{|})/g;

    tplStr = tplStr.replace(/[\r\t\n]/g,'' )
                   .replace(/\\/g, '\\\\')
                   .replace(/'/g, "\\'");

    statement += js ? tplStr.match(regExpression) ? tplStr : `statements.push(${tplStr});` : `statements.push('${tplStr}');`;
    return statement;
}

const tplFuncGenerate = async ({tpl, inputPath})=>{
    let cursor = 0;
    let statements =  'let statements = [];';
    let regTpl = /<%=?\s*([^%>]+?)\s*%>/g;

    if(inputPath){
        tpl = await fs.readFile(inputPath, 'utf8');
    }

    while(match = regTpl.exec(tpl)){
        statements = addStatement(tpl.slice(cursor, match.index), statements);
        statements = addStatement(match[1], statements, true);
        cursor = match.index + match[0].length;
    }

    statements = addStatement(tpl.slice(cursor), statements);

    statements += 'return statements.join("")';
    return statements;
}

const tplGenerate = async ({tpl, inputPath, outputPath, data}) => {
    const funcStr = await tplFuncGenerate({tpl, inputPath});
    const funcStrLint = prettier.format(funcStr, { parser: 'babel' });
    const generateFunc = new Function(funcStrLint);

    const result = generateFunc.apply(data);

    if(outputPath){
        await fs.outputFile(outputPath, result)
    }

    return result;
}

module.exports = {
    tplGenerate
}