
import { handleLogRequest } from '@/lib/logger';

export async function POST(req: Request) {
  return handleLogRequest(req);
}
