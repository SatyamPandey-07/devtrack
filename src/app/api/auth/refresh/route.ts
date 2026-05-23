import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  USE_SECURE_COOKIES,
  createAccessToken,
  createRefreshToken,
  getTokenCookieName,
  verifyRefreshToken,
} from "@/lib/auth-tokens";

function unauthorizedResponse() {
  const response = NextResponse.json(
    { error: "Invalid refresh token" }, 
    { status: 401 }
  );

  response.cookies.set({
    name: getTokenCookieName("access"),
    value: "",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set({
    name: getTokenCookieName("refresh"),
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(getTokenCookieName("refresh"))?.value;
  if (!refreshToken) {
    return unauthorizedResponse();
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return unauthorizedResponse();
  }

  const accessToken = createAccessToken({
    githubId: payload.githubId,
    githubLogin: payload.githubLogin,
  });
  const newRefreshToken = createRefreshToken({
    githubId: payload.githubId,
    githubLogin: payload.githubLogin,
  });

  const response = NextResponse.json({
    ok: true,
    accessTokenExpiresIn: ACCESS_TOKEN_MAX_AGE,
  });

  response.cookies.set({
    name: getTokenCookieName("access"),
    value: accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: USE_SECURE_COOKIES,
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  response.cookies.set({
    name: getTokenCookieName("refresh"),
    value: newRefreshToken,
    httpOnly: true,
    sameSite: "lax",
    secure: USE_SECURE_COOKIES,
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return response;
}



