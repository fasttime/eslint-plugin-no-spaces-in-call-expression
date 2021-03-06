'use strict';

const meta =
{
    docs:
    {
        description: 'disallow spaces after the left side of a call or new expression',
        category: 'Stylistic Issues',
    },
    fixable: 'whitespace',
    schema: [],
};

function create(context)
{
    function checkSpacing(node, exprTypeName)
    {
        let prevToken = sourceCode.getLastToken(node.callee);
        let parenToken = sourceCode.getTokenAfter(prevToken);
        for (;;)
        {
            if (!(parenToken && parenToken.range[1] < node.range[1]))
                return;
            if (parenToken.value === '(')
                break;
            prevToken = parenToken;
            parenToken = sourceCode.getTokenAfter(parenToken);
        }
        const [, separatorStart] = prevToken.range;
        const [separatorEnd] = parenToken.range;
        const separator = text.slice(separatorStart, separatorEnd);
        const match = /^(?:(?=.)\s)+(?!.)/.exec(separator);
        if (match)
        {
            const rangeToRemove = [separatorStart, separatorStart + match[0].length];
            const report =
            {
                node,
                loc: prevToken.loc.end,
                message: `Unexpected space after left side of ${exprTypeName} expression.`,
                fix: fixer => fixer.removeRange(rangeToRemove),
            };
            context.report(report);
        }
    }

    const sourceCode = context.getSourceCode();
    const text = sourceCode.getText();
    const result =
    {
        CallExpression: node => checkSpacing(node, 'call'),
        NewExpression:  node => checkSpacing(node, 'new'),
    };
    return result;
}

module.exports = { meta, create };
