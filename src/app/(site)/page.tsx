import { redirect } from "next/navigation";

// The platform is private; the landing page for a signed-in user is their
// dashboard. Signed-out visitors are sent to /login by the (site) layout.
export default function HomePage() {
  redirect("/dashboard");
}
