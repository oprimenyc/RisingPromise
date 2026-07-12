import type { RequestHandler } from "express";
import { storage } from "./storage";

type Role = "student" | "instructor" | "staff" | "admin";

/**
 * Role gate. Must be chained AFTER isAuthenticated.
 * Looks the user up in the database on every call so a role revocation
 * takes effect immediately (roles are not cached in the session/JWT).
 *
 * Denials are logged with actor + path — privileged-endpoint probing is
 * a signal we want visible (CONSTITUTION §1: no silent failures).
 */
export function requireRole(...allowed: Role[]): RequestHandler {
  return async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      const role = (user?.role ?? "student") as Role;
      if (!allowed.includes(role)) {
        console.warn(
          `[rbac] DENIED role=${role} user=${userId} ${req.method} ${req.path}`
        );
        return res.status(403).json({ message: "Forbidden: insufficient role" });
      }
      req.rpRole = role;
      return next();
    } catch (error) {
      console.error("[rbac] role check failed:", error);
      // Fail closed: an error while checking authorization never grants access
      return res.status(403).json({ message: "Forbidden" });
    }
  };
}

export const requireAdmin = requireRole("admin");
export const requireStaff = requireRole("admin", "staff");
