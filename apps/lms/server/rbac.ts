import type { RequestHandler } from "express";
import { storage } from "./storage";
import { authorize } from "../../../server/core/policy";

/**
 * Policy-driven role gate (M1 Policy Engine). Must be chained AFTER
 * isAuthenticated. The allowed-role sets live in server/core/policy.ts —
 * this middleware holds NO permission logic of its own (no duplicated
 * permission rules, RP mission rule 3).
 *
 * The user is looked up in the database on every call so a role revocation
 * takes effect immediately (roles are not cached in the session/JWT).
 * Denials are logged with actor + path (CONSTITUTION §1: no silent failures).
 */
export function requirePolicy(action: string): RequestHandler {
  return async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      const role = user?.role ?? "student";
      const decision = authorize(action, [role]);
      if (!decision.allowed) {
        console.warn(`[rbac] DENIED ${decision.policyId} role=${role} user=${userId} ${req.method} ${req.path}: ${decision.reason}`);
        return res.status(403).json({ message: "Forbidden: insufficient role" });
      }
      req.rpRole = role;
      req.rpPolicy = decision.policyId;
      return next();
    } catch (error) {
      console.error("[rbac] role check failed:", error);
      // Fail closed: an error while checking authorization never grants access
      return res.status(403).json({ message: "Forbidden" });
    }
  };
}

export const requireAdmin = requirePolicy("lms.admin");
export const requireStaff = requirePolicy("lms.staff");
