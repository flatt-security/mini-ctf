import { Dispatch } from "react";
export interface PageBaseProps {
  isAuth: boolean;
  setAuth: Dispatch<React.SetStateAction<boolean>>;
}
