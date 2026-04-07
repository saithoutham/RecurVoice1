export function PageIntro({
  eyebrow,
  title,
  body
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="space-y-2.5">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1B4332]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold leading-tight text-[#0A0A0A] md:text-[2.65rem]">
        {title}
      </h1>
      {body ? (
        <p className="max-w-3xl text-base leading-7 text-[#4B5563] md:text-[17px]">
          {body}
        </p>
      ) : null}
    </div>
  );
}
