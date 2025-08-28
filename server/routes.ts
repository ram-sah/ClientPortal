import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { requireAuth, requireOwnerOrAdmin } from "./middleware/auth";
import { authService } from "./services/auth.service";
import { companyService } from "./services/company.service";
import { userService } from "./services/user.service";
import { projectService } from "./services/project.service";
import { auditService } from "./services/audit.service";
import { storage } from "./storage";
import { insertUserSchema, insertCompanySchema, insertProjectSchema, insertDigitalAuditSchema, insertAccessRequestSchema } from "@shared/schema";

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Register schema
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const result = await authService.login(email, password);
      
      if (!result) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      const result = await authService.register(userData);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Registration failed" });
    }
  });

  // Change password
  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6)
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      
      // Verify current password
      const isValid = await authService.verifyPassword(req.user!.email, currentPassword);
      if (!isValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      // Update password
      await authService.changePassword(req.user!.id, newPassword);
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to change password" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to get user" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    // In a production app, you might want to blacklist the token
    res.json({ message: "Logged out successfully" });
  });

  // Company routes
  app.get("/api/companies", requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      
      if (type && typeof type === 'string') {
        const companies = await companyService.getCompaniesByType(type);
        res.json(companies);
      } else {
        // Return companies based on user's access level
        if (req.user!.role === 'owner' || req.user!.role === 'admin') {
          const companies = await companyService.getCompaniesByType('client');
          res.json(companies);
        } else {
          const company = await companyService.getCompany(req.user!.companyId);
          res.json(company ? [company] : []);
        }
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to get companies" });
    }
  });

  app.post("/api/companies", requireOwnerOrAdmin, async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await companyService.createCompany(companyData);
      
      await storage.logActivity(req.user!.id, 'CREATE_COMPANY', 'company', company.id);
      
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create company" });
    }
  });

  app.get("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const canAccess = await storage.canUserAccessCompany(req.user!.id, id);
      if (!canAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const company = await companyService.getCompany(id);
      
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to get company" });
    }
  });

  // User routes
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const { companyId } = req.query;
      
      if (companyId && typeof companyId === 'string') {
        const canAccess = await storage.canUserAccessCompany(req.user!.id, companyId);
        if (!canAccess) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        const users = await userService.getUsersByCompany(companyId);
        res.json(users);
      } else {
        // Return users from user's company
        const users = await userService.getUsersByCompany(req.user!.companyId);
        res.json(users);
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to get users" });
    }
  });

  app.post("/api/users", requireOwnerOrAdmin, async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      const user = await userService.createUser(userData);
      
      await storage.logActivity(req.user!.id, 'CREATE_USER', 'user', user.id);
      
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create user" });
    }
  });

  app.post("/api/users/invite", requireOwnerOrAdmin, async (req, res) => {
    try {
      const { email, companyId, role } = req.body;
      
      const accessRequest = await userService.inviteUser(email, companyId, role, req.user!.id);
      
      await storage.logActivity(req.user!.id, 'INVITE_USER', 'access_request', accessRequest.id);
      
      res.status(201).json(accessRequest);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to invite user" });
    }
  });

  // Project routes
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projects = await projectService.getUserProjects(req.user!.id);
      res.json(projects);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to get projects" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      
      // Set created by
      projectData.createdBy = req.user!.id;
      
      const project = await projectService.createProject(projectData);
      
      await storage.logActivity(req.user!.id, 'CREATE_PROJECT', 'project', project.id);
      
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const canAccess = await projectService.canUserAccessProject(req.user!.id, id);
      if (!canAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const project = await projectService.getProject(id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to get project" });
    }
  });

  // Digital Audit routes
  app.get("/api/audits", requireAuth, async (req, res) => {
    try {
      const { clientCompanyId } = req.query;
      
      if (clientCompanyId && typeof clientCompanyId === 'string') {
        const canAccess = await storage.canUserAccessCompany(req.user!.id, clientCompanyId);
        if (!canAccess) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        const audits = await auditService.getAuditsByClient(clientCompanyId);
        res.json(audits);
      } else {
        // Return audits based on user's company type
        if (req.user!.role === 'owner' || req.user!.role === 'admin') {
          // Get all audits for owner/admin
          const clientCompanies = await companyService.getCompaniesByType('client');
          const allAudits = [];
          
          for (const company of clientCompanies) {
            const audits = await auditService.getAuditsByClient(company.id);
            allAudits.push(...audits);
          }
          
          res.json(allAudits);
        } else {
          // Client users see their company's audits
          const audits = await auditService.getAuditsByClient(req.user!.companyId);
          res.json(audits);
        }
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to get audits" });
    }
  });

  app.post("/api/audits", requireAuth, async (req, res) => {
    try {
      const auditData = insertDigitalAuditSchema.parse(req.body);
      
      // Set created by
      auditData.createdBy = req.user!.id;
      
      const audit = await auditService.createAudit(auditData);
      
      await storage.logActivity(req.user!.id, 'CREATE_AUDIT', 'digital_audit', audit.id);
      
      res.status(201).json(audit);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create audit" });
    }
  });

  // Access Request routes
  app.get("/api/access-requests", requireAuth, async (req, res) => {
    // Check if user has owner or admin role
    if (req.user!.role !== 'owner' && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    try {
      const requests = await storage.getPendingAccessRequests();
      res.json(requests);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to get access requests" });
    }
  });

  app.post("/api/access-requests", async (req, res) => {
    try {
      console.log("🔄 Access request attempt:", JSON.stringify(req.body, null, 2));
      
      const requestData = insertAccessRequestSchema.parse(req.body);
      console.log("✅ Schema validation passed");
      
      const request = await storage.createAccessRequest(requestData);
      console.log("✅ Request created with ID:", request.id);
      
      res.status(201).json(request);
    } catch (error) {
      console.error("❌ Access request failed:");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
      console.error("Full error:", error);
      
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create access request" });
    }
  });

  app.patch("/api/access-requests/:id", requireAuth, async (req, res) => {
    // Check if user has owner or admin role
    if (req.user!.role !== 'owner' && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    try {
      const { id } = req.params;
      const { status, companyId } = req.body;
      
      const request = await storage.getAccessRequest(id);
      if (!request) {
        return res.status(404).json({ error: "Access request not found" });
      }
      
      if (status === 'approved') {
        // Create the user
        await userService.createUser({
          email: request.requesterEmail,
          firstName: request.requesterName.split(' ')[0] || request.requesterName,
          lastName: request.requesterName.split(' ')[1] || '',
          role: request.requestedRole,
          companyId: companyId || request.companyId!
        });
      }
      
      const updatedRequest = await storage.updateAccessRequest(id, {
        status,
        reviewedBy: req.user!.id,
        reviewedAt: new Date()
      });
      
      await storage.logActivity(req.user!.id, 'REVIEW_ACCESS_REQUEST', 'access_request', id);
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update access request" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const userProjects = await projectService.getUserProjects(req.user!.id);
      const activeProjects = userProjects.filter(p => p.status === 'active');
      
      let completedAudits = 0;
      let activeClients = 0;
      let pendingApprovals = 0;
      
      if (req.user!.role === 'owner' || req.user!.role === 'admin') {
        const clientCompanies = await companyService.getCompaniesByType('client');
        activeClients = clientCompanies.length;
        
        for (const company of clientCompanies) {
          const audits = await auditService.getAuditsByClient(company.id);
          completedAudits += audits.filter(a => a.status === 'published').length;
        }
        
        const accessRequests = await storage.getPendingAccessRequests();
        pendingApprovals = accessRequests.length;
      } else {
        const audits = await auditService.getAuditsByClient(req.user!.companyId);
        completedAudits = audits.filter(a => a.status === 'published').length;
        activeClients = 1; // Current client
      }
      
      res.json({
        activeProjects: activeProjects.length,
        completedAudits,
        activeClients,
        pendingApprovals
      });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to get dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
