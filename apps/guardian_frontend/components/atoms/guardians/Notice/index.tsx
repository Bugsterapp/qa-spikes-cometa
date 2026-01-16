import { Button } from '@cometa/recreo';

type NoticeProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel: string;
  onClick: () => void;
};

export function Notice({ title, icon, description, actionLabel, onClick }: NoticeProps) {
  return (
    <section className="flex flex-col gap-2 m-5 font-lota antialiased border border-[#e4ebf6] bg-[#fbfcfd] p-4 rounded-lg">
      <div className="flex items-center justify-between gap-8">
        <h3 className="font-bold text-lg text-[#3e4559]">{title}</h3>
        {icon && <div className="bg-[#f3f6fb] rounded-lg p-3">{icon}</div>}
      </div>

      <p className="text-[#686f87] text-sm">{description}</p>

      <div className="mt-1">
        <Button variant="solid-light" color="galaxy" onClick={onClick}>
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}
