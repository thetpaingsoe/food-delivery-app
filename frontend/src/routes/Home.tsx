import { useAppSelector } from "../store/store";

export function Home() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16">
      <h1 className="text-2xl font-semibold text-stone-900">
        Hello{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="text-sm text-stone-500">Menu lands here next.</p>
    </div>
  );
}
