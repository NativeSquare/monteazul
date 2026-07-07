import { redirect } from "next/navigation";

// The "Team" admin-management flow is disabled for the MVP (see /team). This
// member-detail route redirects to the businesses list. User details are still
// available under /users/[userId].
export default function TeamMemberDetailPage() {
  redirect("/negocios");
}
