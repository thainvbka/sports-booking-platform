import { Request, Response } from "express";
import { signup } from "../../services/v1/auth.service";
import { CREATED } from "../../utils/success.response";

export const signupController = async (req: Request, res: Response) => {
  const userData = req.body;
  const data = await signup(userData);
  return new CREATED({
    message: "User created successfully",
    data: data,
  }).send(res);
};
