import { checkPermission } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import ContactsClient from "./ContactsClient";

export default async function ContactsPage() {
  if (!(await checkPermission("manage_contacts"))) {
    redirect("/?error=unauthorized");
  }
  return <ContactsClient />;
}
