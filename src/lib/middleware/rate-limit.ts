interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  login: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 requests per minute
  register: { windowMs: 60 * 1000, maxRequests: 3 }, // 3 requests per minute
  passwordRecovery: { windowMs: 60 * 1000, maxRequests: 3 }, // 3 requests per minute
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIdentifier(request: Request): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}-${userAgent}`;
}

export function checkRateLimit(action: string, request: Request): { allowed: boolean; remaining: number; retryAfter?: number } {
  const config = rateLimitConfigs[action];
  
  if (!config) {
    return { allowed: true, remaining: 100 };
  }

  const identifier = getClientIdentifier(request);
  const key = `${action}:${identifier}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  if (record.count >= config.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  record.count++;
  rateLimitStore.set(key, record);

  return { allowed: true, remaining: config.maxRequests - record.count };
}

export function createRateLimitHeaders(remaining: number, retryAfter?: number): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(rateLimitConfigs.login?.maxRequests || 100),
    'X-RateLimit-Remaining': String(remaining),
  };
  
  if (retryAfter) {
    headers['Retry-After'] = String(retryAfter);
  }
  
  return headers;
}

export function isRateLimited(action: string, request: Request): boolean {
  const result = checkRateLimit(action, request);
  return !result.allowed;
}
