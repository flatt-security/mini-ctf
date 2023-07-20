import { GraphQLError, ValidationRule } from "graphql";

/**
 * 巨大なクエリを実行されないようにクエリのバイト数を制限する
 */
export function querySizeLimit(sizeLimit: number): ValidationRule {
  return (context) => ({
    Document: {
      enter(node) {
        const length = node.loc?.source.body.length;
        if (length === undefined || length > sizeLimit) {
          context.reportError(new GraphQLError("invalid query size"));
        }
      },
    },
  });
}

/**
 * first引数において不正な値の入力を禁止する
 * https://relay.dev/graphql/connections.htm
 */
export function validatePaginationArgument({
  maximumValue,
  variableValues,
}: {
  maximumValue: number;
  variableValues: Record<string, any> | null | undefined;
}): ValidationRule {
  return (context) => ({
    Argument: {
      enter(node) {
        if (node.name.value === "first") {
          let value: number;
          switch (node.value.kind) {
            case "IntValue":
              value = Number(node.value.value);
              break;
            case "Variable":
              value = Number(variableValues?.[node.value.name.value]);
              break;
            default:
              return;
          }
          if (value < 0 || value > maximumValue) {
            context.reportError(
              new GraphQLError(`invalid pagination argument: ${value}`)
            );
          }
        }
      },
    },
  });
}
