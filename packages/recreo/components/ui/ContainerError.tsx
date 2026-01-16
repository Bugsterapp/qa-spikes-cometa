export function ContainerError({ error }: { error?: string }) {
  if (!error) return null;

  return <div className="ml-4 text-xs leading-5 text-red-500 text-elipsis">{error}</div>;
}
