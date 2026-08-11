import { Request, Response, NextFunction } from "express";
import ipRangeCheck from "ip-range-check";

const whitelist = process.env.WHITELIST_IPS
  ? process.env.WHITELIST_IPS.split(",").map(ip => ip.trim())
  : [];

function normalizeIp(ip: string | undefined): string | null {
  if (!ip) return null;

  if (ip.startsWith("::ffff:")) {
    return ip.replace("::ffff:", "");
  }

  const zoneIndex = ip.indexOf("%");
  if (zoneIndex !== -1) {
    return ip.substring(0, zoneIndex);
  }

  return ip;
}

export function ipWhitelist(req: Request, res: Response, next: NextFunction) {
  const rawIp = req.ip;
  const ip = normalizeIp(rawIp);

  if (ip && ipRangeCheck(ip, whitelist)) {
    console.warn(`Allowed IP: ${ip}`);
    return next();
  }

  console.warn(`Blocked IP: ${ip}`);
  return res.status(403).json({ error: "Forbidden: IP not whitelisted" });
}
