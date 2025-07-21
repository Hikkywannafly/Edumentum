import { FeatureListSection } from "@/components/features/section";
import { Footer } from "@/components/footer";
import Logo from "@/components/logo";
import * as FadeIn from "@/components/motion/fade";

export default function Home() {
  return (
    <FadeIn.Container className="flex flex-col gap-6">
      <FadeIn.Item>
        <div className="flex flex-row items-center space-x-3">
          <Logo />
          <div className="flex flex-col font-medium">
            <span className="text-sm">Edumentum</span>
          </div>
        </div>

        <FeatureListSection />
      </FadeIn.Item>

      <FadeIn.Item>
        <Footer />
      </FadeIn.Item>
    </FadeIn.Container>
  );
}
