/**
 * MIT License
 *
 * Copyright (c) 2017 Stem
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * graphql-depth-limit
 * https://www.npmjs.com/package/graphql-depth-limit
 *
 * 上記のライブラリの一部を改変し、型の追加と一部バグの修正をしています
 */

import {
  ASTNode,
  DefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  GraphQLError,
  Kind,
  OperationDefinitionNode,
  ValidationContext,
  ValidationRule,
} from "graphql";

interface Options {
  ignore?: Array<string | RegExp | ((fieldName: string) => boolean)>;
}

type QueryDepths = { [name: string]: number | undefined };
type Fragments = { [name: string]: FragmentDefinitionNode };
type QueriesAndMutations = { [name: string]: OperationDefinitionNode };

/**
 * Creates a validator for the GraphQL query depth
 * @param {Number} maxDepth - The maximum allowed depth for any operation in a GraphQL document.
 * @param {Object} [options]
 * @param {String|RegExp|Function} options.ignore - Stops recursive depth checking based on a field name. Either a string or regexp to match the name, or a function that reaturns a boolean.
 * @param {Function} [callback] - Called each time validation runs. Receives an Object which is a map of the depths for each operation.
 * @returns {Function} The validator function for GraphQL validation phase.
 */
export const depthLimit: (
  maxDepth: number,
  options?: Options,
  callback?: (queryDepths: QueryDepths) => void
) => ValidationRule =
  (maxDepth, options = {}, callback = () => {}) =>
  (validationContext) => {
    try {
      const { definitions } = validationContext.getDocument();
      const fragments = getFragments(definitions);
      const queries = getQueriesAndMutations(definitions);
      const queryDepths: QueryDepths = {};
      for (let name in queries) {
        queryDepths[name] = determineDepth(
          queries[name],
          fragments,
          0,
          maxDepth,
          validationContext,
          name,
          options
        );
      }
      callback(queryDepths);
      return {};
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

function getFragments(definitions: readonly DefinitionNode[]) {
  return definitions.reduce((map, definition) => {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      map[definition.name.value] = definition;
    }
    return map;
  }, {} as Fragments);
}

// this will actually get both queries and mutations. we can basically treat those the same
function getQueriesAndMutations(definitions: readonly DefinitionNode[]) {
  return definitions.reduce((map, definition) => {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      map[definition.name ? definition.name.value : ""] = definition;
    }
    return map;
  }, {} as QueriesAndMutations);
}

function determineDepth(
  node: ASTNode | undefined,
  fragments: Fragments,
  depthSoFar: number,
  maxDepth: number,
  context: ValidationContext,
  operationName: string,
  options: Options
): number | undefined {
  if (depthSoFar > maxDepth) {
    return context.reportError(
      new GraphQLError(
        `'${operationName}' exceeds maximum operation depth of ${maxDepth}`,
        [node!]
      )
    );
  }

  // バグ修正: nodeがundefinedである場合を考慮
  if (!node) {
    return;
  }

  switch (node.kind) {
    case Kind.FIELD:
      // by default, ignore the introspection fields which begin with double underscores
      const shouldIgnore =
        /^__/.test(node.name.value) || seeIfIgnored(node, options.ignore);

      if (shouldIgnore || !node.selectionSet) {
        return 0;
      }
      return (
        1 +
        Math.max(
          ...node.selectionSet.selections.map(
            (selection) =>
              determineDepth(
                selection,
                fragments,
                depthSoFar + 1,
                maxDepth,
                context,
                operationName,
                options
              )!
          )
        )
      );
    case Kind.FRAGMENT_SPREAD:
      return determineDepth(
        fragments[node.name.value],
        fragments,
        depthSoFar,
        maxDepth,
        context,
        operationName,
        options
      );
    case Kind.INLINE_FRAGMENT:
    case Kind.FRAGMENT_DEFINITION:
    case Kind.OPERATION_DEFINITION:
      return Math.max(
        ...node.selectionSet.selections.map(
          (selection) =>
            determineDepth(
              selection,
              fragments,
              depthSoFar,
              maxDepth,
              context,
              operationName,
              options
            )!
        )
      );
    default:
      throw new Error("uh oh! depth crawler cannot handle: " + node.kind);
  }
}

function seeIfIgnored(node: FieldNode, ignore: Options["ignore"]) {
  for (let rule of ignore ?? []) {
    const fieldName = node.name.value;
    switch (rule.constructor) {
      case Function:
        if ((rule as (fieldName: string) => boolean)(fieldName)) {
          return true;
        }
        break;
      case String:
      case RegExp:
        if (fieldName.match(rule as RegExp)) {
          return true;
        }
        break;
      default:
        throw new Error(`Invalid ignore option: ${rule}`);
    }
  }
  return false;
}
