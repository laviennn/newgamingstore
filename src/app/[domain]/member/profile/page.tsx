import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";
import { headers } from "next/headers";

export default async function MemberProfilePage() {
  const supabase = await createClient();

  // Authenticate user
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
