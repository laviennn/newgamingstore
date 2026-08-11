import { checkPermission } from "@/app/admin/actions";
import ContactsClient from "./ContactsClient";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";

export default async function ContactsPage() {
  if (!(await checkPermission("manage_contacts"))) {
    return <UnauthorizedAccess permission="manage_contacts" />;
  }
  return <ContactsClient />;
}
