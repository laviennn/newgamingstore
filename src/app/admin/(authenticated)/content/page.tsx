import { checkPermission } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import ContentClient from "./ContentClient";

export default async function ContentPage() {
  if (!(await checkPermission("manage_content"))) {
    redirect("/?error=unauthorized");
  }
  return <ContentClient />;
}
