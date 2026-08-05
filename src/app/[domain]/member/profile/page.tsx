import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";
import { headers } from "next/headers";
import { getStorefrontSession } from "@/lib/tenantAuth";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const session = await getStorefrontSession(domain);

  if (!session) {
    redirect("/login");
  }

  // Username mode members redirect ke dashboard (profile settings = email-only)
  if (session.type === "username") {
    redirect("/member/dashboard");
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    redirect("/login");
  }

  // Get pseudo-session data from headers for the "Active Session" section
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown Device';
  const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
  
  // Basic user agent parsing for display
  let browserInfo = "Desktop - Browser";
  if (userAgent.includes("Mobile")) {
    browserInfo = "Mobile Device";
  } else if (userAgent.includes("Chrome")) {
    browserInfo = "Desktop - Chrome";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browserInfo = "Desktop - Safari";
  } else if (userAgent.includes("Firefox")) {
    browserInfo = "Desktop - Firefox";
  } else if (userAgent.includes("Edge")) {
    browserInfo = "Desktop - Edge";
  }

  return (
    <div className="space-y-6">
      <ProfileClient 
        user={user} 
        sessionData={{
          device: browserInfo,
          ip: ip,
          location: "Indonesia", // Mock location based on IP would be better but static for now
        }}
      />
    </div>
  );
}
