import { PreSignUpTriggerEvent, Context, Callback } from "aws-lambda";
export const handler = async (
  event: PreSignUpTriggerEvent,
  context: Context,
  callback: Callback,
) => {
  event.response.autoConfirmUser = true;
  callback(null, event);
};
