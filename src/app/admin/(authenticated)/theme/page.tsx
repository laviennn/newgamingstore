import { checkPermission } from "@/app/admin/actions";
import ThemeClient from "./ThemeClient";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";

export default async function ThemePage() {
  if (!(await checkPermission("manage_theme"))) {
    return <UnauthorizedAccess permission="manage_theme" />;
  }
  return <ThemeClient />;
}
