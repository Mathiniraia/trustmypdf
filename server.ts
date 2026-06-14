import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Initialize express app
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5173;

// Lazy Razorpay initialization
let razorpayInstance: any = null;
function getRazorpay(): any {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    return null;
  }
  
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
}

// Razorpay API Route to create payment orders
app.post("/api/razorpay/order", async (req, res) => {
  try {
    const { amount, planId } = req.body;
    
    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Invalid amount provided." });
    }

    const rzp = getRazorpay();
    const mockMode = rzp === null;

    const amountInPaise = amount * 100; // Razorpay expects amount in paise (1 INR = 100 paise)

    if (mockMode) {
      // Return beautiful demo checkout parameters so the user can test their flow in sandbox
      return res.json({
        id: `order_demo_${Math.random().toString(36).substring(2, 11)}`,
        amount: amountInPaise,
        currency: "INR",
        planId: planId,
        isDemo: true,
        message: "Razorpay environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) not set. Running in Demonstration/Sandbox mode.",
        keyId: "rzp_test_demo_key"
      });
    }

    // Real Razorpay order generation
    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${planId}_${Date.now()}`,
      notes: {
        planId: planId,
        planType: planId === "daily" ? "Daily Pass" : planId === "weekly" ? "Weekly Pass" : "Monthly Pro",
      },
    });

    return res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      planId: planId,
      isDemo: false,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    return res.status(500).json({ error: error.message || "Failed to create Razorpay payment order." });
  }
});

// Mock/Sandbox verify-payment endpoint
app.post("/api/razorpay/verify", async (req, res) => {
  const { orderId, paymentId, signature, isDemo } = req.body;
  if (isDemo || !getRazorpay()) {
    // Automatically succeed in sandbox mode
    return res.json({ success: true, message: "Demo transaction verified successfully!" });
  }
  
  // Real verification check
  const crypto = await import("crypto");
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: "Missing Razorpay configuration." });
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (generatedSignature === signature) {
    return res.json({ success: true });
  } else {
    return res.status(400).json({ error: "Payment verification failed" });
  }
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "secure_32_byte_passphrase_key_12";
const IV_LENGTH = 16;

export function encryptData(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptData(text: string): string {
  try {
    if (!text) return "";
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return "Decryption Error";
  }
}

const supabaseUrl = process.env.SUPABASE_URL || "https://your-project-id.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "your-anon-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.post("/api/crm/sync-user", async (req, res) => {
  try {
    const { displayName, avatarUrl, email, phone, authProvider, planStatus } = req.body;

    // Sanitize authProvider: Supabase CHECK constraint only allows "google" | "phone"
    const safeAuthProvider = (authProvider === "phone") ? "phone" : "google";

    const encryptedEmail = email ? encryptData(email) : null;
    const encryptedPhone = phone ? encryptData(phone) : null;

    // 1. Sync to CRM Webhook
    const contactInfo = email || phone || "";
    const encryptedContactInfo = contactInfo ? encryptData(contactInfo) : "";

    try {
      const crmResponse = await fetch("http://localhost:3001/api/admin/trigger-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": "mathinirai.a@gmail.com"
        },
        body: JSON.stringify({
          customerName: displayName,
          planType: planStatus === "pro" ? "Monthly Pro" : "Daily Pass",
          contactNumberOrEmail: encryptedContactInfo
        })
      });

      if (!crmResponse.ok) {
        const errText = await crmResponse.text();
        console.warn("CRM returned error status:", crmResponse.status, errText);
      }
    } catch (crmErr: any) {
      // CRM webhook is optional — don't fail the entire sync if CRM is unreachable
      console.warn("CRM webhook unreachable (non-blocking):", crmErr.message);
    }

    // 2. Sync to Supabase Database (with graceful fallback for missing columns)
    const fullPayload: Record<string, any> = {
      display_name: displayName,
      avatar_url: avatarUrl,
      encrypted_email: encryptedEmail,
      encrypted_phone: encryptedPhone,
      auth_provider: safeAuthProvider,
      plan_status: planStatus || "free",
    };

    let { data, error } = await supabase
      .from("crm_users")
      .upsert(fullPayload, { onConflict: "encrypted_email" })
      .select();

    // If plan_status or usage_count columns don't exist yet, retry without them
    if (error && error.message.includes("schema cache")) {
      console.warn("[CRM Sync] Retrying without plan_status (column may not exist yet)...");
      const { plan_status, usage_count, ...corePayload } = fullPayload;
      const retryResult = await supabase
        .from("crm_users")
        .upsert(corePayload, { onConflict: "encrypted_email" })
        .select();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.warn("Supabase sync warning:", error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log(`[CRM Sync] User "${displayName}" synced to Supabase (provider=${safeAuthProvider}, plan=${planStatus})`);
    return res.json({ success: true, user: data?.[0] });
  } catch (err: any) {
    console.error("Failed to sync user session:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to sync user session." });
  }
});


// ================= PERSISTENT IP/ACCOUNT USAGE LIMITS =================
const USAGE_FILE = path.join(process.cwd(), "ip_usage.json");
let ipUsageStore: Record<string, { count: number; unlocked: boolean }> = {};

if (fs.existsSync(USAGE_FILE)) {
  try {
    ipUsageStore = JSON.parse(fs.readFileSync(USAGE_FILE, "utf-8"));
  } catch (e) {
    ipUsageStore = {};
  }
}

function saveUsage() {
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(ipUsageStore, null, 2));
  } catch (e) {
    console.error("Failed to save usage file:", e);
  }
}

function getUsageKey(req: express.Request, email?: string): string {
  if (email && email.trim() !== "") {
    return `email:${email.trim().toLowerCase()}`;
  }
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
  const ipStr = Array.isArray(ip) ? ip[0] : ip || "127.0.0.1";
  return `ip:${ipStr.trim()}`;
}

app.get("/api/usage/status", (req, res) => {
  const email = req.query.email as string | undefined;
  const key = getUsageKey(req, email);
  
  if (!ipUsageStore[key]) {
    ipUsageStore[key] = { count: 0, unlocked: false };
    saveUsage();
  }
  
  res.json({
    count: ipUsageStore[key].count,
    premiumUnlocked: ipUsageStore[key].unlocked
  });
});

app.post("/api/usage/increment", async (req, res) => {
  const { email } = req.body;
  const key = getUsageKey(req, email);

  if (!ipUsageStore[key]) {
    ipUsageStore[key] = { count: 0, unlocked: false };
  }

  // If already premium, let them proceed
  if (ipUsageStore[key].unlocked) {
    return res.json({ allowed: true, count: ipUsageStore[key].count });
  }

  const LIMIT = 3; // 3 free uses

  if (ipUsageStore[key].count >= LIMIT) {
    return res.json({ allowed: false, count: ipUsageStore[key].count });
  }

  ipUsageStore[key].count += 1;
  saveUsage();

  // Sync updated task count to Supabase so CRM dashboard reflects changes in real-time
  if (email && email.trim()) {
    const encryptedEmail = encryptData(email);
    supabase
      .from("crm_users")
      .update({ usage_count: ipUsageStore[key].count })
      .eq("encrypted_email", encryptedEmail)
      .then(({ error }) => {
        if (error) console.warn("Supabase usage sync warning:", error.message);
        else console.log(`[Usage Sync] Task count updated to ${ipUsageStore[key].count} for ${email}`);
      });
  }

  res.json({ allowed: true, count: ipUsageStore[key].count });
});

app.post("/api/usage/unlock", async (req, res) => {
  const { email } = req.body;
  
  // Unlock by both IP and email (to be robust)
  const emailKey = getUsageKey(req, email);
  if (!ipUsageStore[emailKey]) ipUsageStore[emailKey] = { count: 0, unlocked: true };
  ipUsageStore[emailKey].unlocked = true;

  const ipKey = getUsageKey(req, undefined);
  if (!ipUsageStore[ipKey]) ipUsageStore[ipKey] = { count: 0, unlocked: true };
  ipUsageStore[ipKey].unlocked = true;

  saveUsage();

  // Sync premium unlock to Supabase so CRM dashboard shows upgraded status
  if (email && email.trim()) {
    const encryptedEmail = encryptData(email);
    supabase
      .from("crm_users")
      .update({ plan_status: "pro" })
      .eq("encrypted_email", encryptedEmail)
      .then(({ error }) => {
        if (error) console.warn("Supabase unlock sync warning:", error.message);
        else console.log(`[CRM Sync] Premium unlocked for ${email}`);
      });
  }

  res.json({ success: true });
});

app.post("/api/usage/reset", async (req, res) => {
  const { email } = req.body;
  const emailKey = getUsageKey(req, email);
  if (ipUsageStore[emailKey]) {
    ipUsageStore[emailKey] = { count: 0, unlocked: false };
  }
  const ipKey = getUsageKey(req, undefined);
  if (ipUsageStore[ipKey]) {
    ipUsageStore[ipKey] = { count: 0, unlocked: false };
  }
  saveUsage();

  // Sync reset to Supabase so CRM dashboard reflects the downgrade
  if (email && email.trim()) {
    const encryptedEmail = encryptData(email);
    supabase
      .from("crm_users")
      .update({ plan_status: "free", usage_count: 0 })
      .eq("encrypted_email", encryptedEmail)
      .then(({ error }) => {
        if (error) console.warn("Supabase reset sync warning:", error.message);
        else console.log(`[CRM Sync] Usage reset for ${email}`);
      });
  }

  res.json({ success: true });
});


// Configure Vite middleware in development or express.static in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
