import { checkPermission } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { getPromoCodes } from "./actions";
import { PromosClient } from "./PromosClient";

export const dynamic = "force-dynamic";

export default async function PromosPage() {
  if (!(await checkPermission("manage_promos"))) {
    return <UnauthorizedAccess permission="manage_promos" />;
  }

  const promos = await getPromoCodes();
  
  return <PromosClient initialPromos={promos} />;
}
