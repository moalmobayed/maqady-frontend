import { authJson, isValidEmail, readAuthRequestBody } from "@/lib/auth/http";
import { requestAuthSession } from "@/lib/auth/service";
import { setAuthSessionCookies } from "@/lib/auth/session-cookies";

export async function POST(request: Request) {
  const parsed = await readAuthRequestBody(request);
  if (!parsed.ok) return parsed.response;

  const email =
    typeof parsed.body.email === "string" ? parsed.body.email.trim() : "";
  const password =
    typeof parsed.body.password === "string" ? parsed.body.password : "";

  if (!isValidEmail(email) || password.length === 0 || password.length > 1024) {
    return authJson(
      { message: "Enter a valid email and password." },
      400,
    );
  }

  const result = await requestAuthSession("session", { email, password });
  if (!result.ok) {
    return authJson({ message: result.message }, result.status);
  }

  await setAuthSessionCookies(result.session);
  return authJson({
    customer: { fullName: result.session.customer.fullName },
  });
}
