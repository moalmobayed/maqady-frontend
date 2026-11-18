import { authJson, isValidEmail, readAuthRequestBody } from "@/lib/auth/http";
import { requestAuthSession } from "@/lib/auth/service";
import { setAuthSessionCookies } from "@/lib/auth/session-cookies";

export async function POST(request: Request) {
  const parsed = await readAuthRequestBody(request);
  if (!parsed.ok) return parsed.response;

  const fullName =
    typeof parsed.body.fullName === "string" ? parsed.body.fullName.trim() : "";
  const email =
    typeof parsed.body.email === "string" ? parsed.body.email.trim() : "";
  const password =
    typeof parsed.body.password === "string" ? parsed.body.password : "";

  if (
    fullName.length < 2 ||
    fullName.length > 100 ||
    !isValidEmail(email) ||
    password.length < 8 ||
    password.length > 1024
  ) {
    return authJson(
      { message: "Enter a valid name, email, and password of at least 8 characters." },
      400,
    );
  }

  const result = await requestAuthSession("registration", {
    fullName,
    email,
    password,
  });
  if (!result.ok) {
    return authJson({ message: result.message }, result.status);
  }

  await setAuthSessionCookies(result.session);
  return authJson(
    { customer: { fullName: result.session.customer.fullName } },
    201,
  );
}
