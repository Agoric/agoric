/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce start function to have proper synchronous prelude region',
      recommended: true,
    },
    schema: [], // no options
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (
          !node.declaration ||
          node.declaration.type !== 'FunctionDeclaration'
        ) {
          return;
        }

        const functionNode = node.declaration;
        if (functionNode.id.name !== 'start') {
          return;
        }

        const sourceCode = context.getSourceCode();
        const functionBody = sourceCode.getText(functionNode.body);

        // Check for #region and #endregion markers
        const hasRegionMarker = functionBody.includes(
          '#region synchronous prelude',
        );
        const hasEndRegionMarker = functionBody.includes('#endregion');

        if (!hasRegionMarker || !hasEndRegionMarker) {
          context.report({
            node: functionNode,
            message:
              'start function must contain #region synchronous prelude and #endregion markers',
          });
          return;
        }

        // Get the lines between #region and #endregion
        const lines = functionBody.split('\n');
        let inRegion = false;
        let regionStartLine = -1;
        let regionEndLine = -1;

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('#region synchronous prelude')) {
            inRegion = true;
            regionStartLine = i;
          } else if (lines[i].includes('#endregion')) {
            regionEndLine = i;
            break;
          }
        }

        // Check for await usage before and within the region
        const awaitExpressions = [];
        // Use ESTree visitor to find await expressions
        const checkNode = (node) => {
          if (node.type === 'AwaitExpression') {
            const awaitLine = sourceCode.getLocFromIndex(node.range[0]).line;
            const relativeLine = awaitLine - functionNode.body.loc.start.line;

            if (relativeLine <= regionEndLine) {
              awaitExpressions.push(node);
            }
          }
        };

        // Traverse the AST to find await expressions
        const traverseNode = (node) => {
          if (!node) return;
          checkNode(node);
          
          for (const key of Object.keys(node)) {
            const child = node[key];
            if (Array.isArray(child)) {
              child.forEach(traverseNode);
            } else if (child && typeof child === 'object' && 'type' in child) {
              traverseNode(child);
            }
          }
        };

        traverseNode(functionNode.body);

        if (awaitExpressions.length > 0) {
          context.report({
            node: awaitExpressions[0],
            message:
              'await expressions are not allowed before or within the synchronous prelude region',
          });
        }
      },
    };
  },
};
