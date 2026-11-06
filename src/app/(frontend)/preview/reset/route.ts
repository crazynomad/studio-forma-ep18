// The upstream demo reset endpoint could erase a deployed site's database.
// Resets must be performed explicitly from a local administrative command.
export function GET() {
  return new Response(null, { status: 404 });
}
