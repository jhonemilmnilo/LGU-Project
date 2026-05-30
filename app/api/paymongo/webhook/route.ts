import * as handler from '../../webhooks/paymongo/route';

export async function POST(request: Request) {
  return handler.POST(request);
}
