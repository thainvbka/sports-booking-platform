import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { config } from "../configs";
import { verifyAccessToken } from "./jwt";

let io: Server | null = null;

export const initSocket = async (server: HttpServer): Promise<Server> => {
  if (io) return io;

  const allowedOrigins = (config.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Sử dụng Redis Adapter để đồng bộ Socket.IO events giữa nhiều backend instances
  // Khi scale backend=2, mỗi instance có io riêng. Redis pub/sub đảm bảo event emit
  // trên instance A cũng được broadcast sang instance B → client luôn nhận được notification.
  try {
    const pubClient = createClient({ url: config.REDIS_URL });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log("::::: Socket.IO Redis Adapter initialized for multi-instance sync");
  } catch (error) {
    console.error("::::: Failed to setup Socket.IO Redis Adapter, falling back to in-memory:", error);
    // Fallback: vẫn hoạt động nhưng không sync giữa các instances
  }

  io.use((socket, next) => {
    const authToken = socket.handshake.auth.token as string | undefined;
    const authorizationHeader = socket.handshake.headers.authorization;
    const normalizedHeader = Array.isArray(authorizationHeader)
      ? authorizationHeader[0]
      : authorizationHeader;
    const headerToken = normalizedHeader?.startsWith("Bearer ")
      ? normalizedHeader.slice("Bearer ".length).trim()
      : normalizedHeader?.trim();
    const normalizedAuthToken = authToken?.startsWith("Bearer ")
      ? authToken.slice("Bearer ".length).trim()
      : authToken?.trim();
    const token = normalizedAuthToken || headerToken;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.data.accountId = decoded.accountId;
      next();
    } catch (_error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const accountId = socket.data.accountId as string | undefined;
    if (!accountId) return;

    socket.join(accountId);
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }
  return io;
};
