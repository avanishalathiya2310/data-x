import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const upstream = await fetch("https://app.datax.nuvinno.no/.auth/logout", {
      method: "GET",
      headers: {
        // Forward incoming cookies so auth works server-side
        cookie,
        // Ensure JSON back
        accept: "application/json",
      },
      // Do not cache auth
      cache: "no-store",
    });

    const body = await upstream.text();

    // Pass through status and content-type
    const res = new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    });

    // Forward Set-Cookie from upstream so browser updates cookies
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) {
      res.headers.set("set-cookie", setCookie);
    }

    return res;
  } catch (err) {
    return NextResponse.json(
      { message: "Proxy error", error: (err && err.message) || String(err) },
      { status: 502 }
    );
  }
}
