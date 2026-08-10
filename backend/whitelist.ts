import { Request, Response, NextFunction } from "express";

const whitelist = process.env.WHITELIST_IPS
  ? process.env.WHITELIST_IPS.split(",").map(ip => ip.trim())
  : [];

export function ipWhitelist(req: Request, res: Response, next: NextFunction) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string"
    ? forwarded.split(",")[0]
    : req.socket.remoteAddress;

  if (ip && whitelist.includes(ip)) {
    return next();
  }

  console.warn(`Blocked IP: ${ip}`);
  return res.status(403).json({ error: "Forbidden: IP not whitelisted" });
}
