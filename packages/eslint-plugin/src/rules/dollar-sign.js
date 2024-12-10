/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Example rule that checks for dollar signs',
      recommended: true,
    },
    schema: [], // no options
  },

  create(context) {
    return {
      Identifier(node) {
        if (node.name.includes('$')) {
          context.report({
            node,
            message: 'Avoid using $ in identifiers',
          });
        }
      },
    };
  },
};
