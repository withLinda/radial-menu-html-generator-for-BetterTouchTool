import dynamic from "next/dynamic";

const RadialMenuGenerator = dynamic(() => import("../components/RadialMenuGenerator"), { ssr: false });

export default function Page() {
  return <RadialMenuGenerator />;
}
