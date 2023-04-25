import prisma from "../db";
import { hashPassword, createJWT, comparePassword } from "../modules/auth";
import { Request, Response } from "express";

export const createUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Please provide an email and password" });
    return;
  }
  const user = await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
      password: await hashPassword(req.body.password),
    },
  });

  const token = createJWT(user);
  res.json({ token });
};

export const loginUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  const valid = await comparePassword(req.body.password, user.password);
  if (!valid) {
    res.status(400).json({ error: "Invalid password" });
    return;
  }
  res.status(200).json({ token: createJWT(user) });
};
