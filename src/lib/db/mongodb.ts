import { MongoClient } from "mongodb";
import dns from "node:dns";

// Fix Node.js DNS resolver issue with MongoDB SRV records (EBADRESP)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore in environments where setServers is unsupported
}

const options = {
  serverSelectionTimeoutMS: 5000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'Missing environment variable "MONGODB_URI". Set it in your .env file or deployment environment (e.g. Vercel, Railway, etc.).'
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect().catch((err) => {
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  } else {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }
}

// Lazy proxy for default clientPromise export
const clientPromise: Promise<MongoClient> = new Proxy({} as Promise<MongoClient>, {
  get(_target, prop) {
    try {
      const promise = getClientPromise();
      const val = (promise as any)[prop];
      return typeof val === "function" ? val.bind(promise) : val;
    } catch {
      return undefined;
    }
  },
});

export default clientPromise;

export async function getDatabase(dbName?: string) {
  try {
    const client = await getClientPromise();
    return client.db(dbName || process.env.MONGODB_DB || "anguillabonthesea");
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      global._mongoClientPromise = undefined;
    }
    throw err;
  }
}
