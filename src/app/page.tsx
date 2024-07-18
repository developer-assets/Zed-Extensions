import { ExtensionsTable } from "@/components/custom/table";
import { getExtensions } from "@/lib/actions";

export default async function Home() {
  const extensions = await getExtensions();

  return (
    <main className="px-2 container max-w-7xl w-full mx-auto">
      <h1 className="text-center mx-auto font-light text-5xl text-primary mt-16 max-w-prose">
        Code at the speed of thought
      </h1>
      <p className="mt-5 text-center mx-auto max-w-prose">
        Zed is a high-performance, multiplayer code editor from the creators of
        Atom and Tree-sitter. It&apos;s also open source.
      </p>
      <div className="mt-24">
        <ExtensionsTable initialExtensions={extensions} />
      </div>
    </main>
  );
}
