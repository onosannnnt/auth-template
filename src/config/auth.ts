export const salt: number = Number(process.env.SALT);
export const jwtSecret: string = process.env.JWT_SECRET;
export const cookiesConfig = {
  httpOnly: true,
  secure: true,
  samesite: "none",
  maxAge: 1000 * 60 * 60 * 24 * 3,
};
