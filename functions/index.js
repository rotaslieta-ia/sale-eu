export async function onRequest(context) {
  return new Response("SALE-EU Functions OK", {
    headers: { "content-type": "text/plain; charset=UTF-8" }
  });
}
