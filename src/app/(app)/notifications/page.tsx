import { Bell } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <EmptyState icon={Bell} title="You're all caught up" hint="Likes, follows and finished generations will show up here." />
    </div>
  );
}
