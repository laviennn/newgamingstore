import { checkPermission } from "@/app/admin/actions";
import ContentClient from "./ContentClient";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";

export default async function ContentPage() {
  if (!(await checkPermission("manage_content"))) {
    return <UnauthorizedAccess permission="manage_content" />;
  }
  return <ContentClient />;
}
