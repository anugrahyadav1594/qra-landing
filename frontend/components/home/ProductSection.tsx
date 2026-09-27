import { ProductPreview } from "@/components/ProductPreview";
import { Reveal } from "@/components/Reveal";
import { Button, Section, SectionLabel, SectionStatement } from "@/components/ui";
import { PRODUCT } from "@/lib/content";

/** The product: one company, five questions, an explanation and its source. */
export function ProductSection() {
  return (
    <Section id="product" tone="raised" labelledBy="product-heading">
      <Reveal>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel tone="brand">{PRODUCT.label}</SectionLabel>
            <SectionStatement id="product-heading" lines={PRODUCT.statement} as="h2" className="mt-5" />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-paper-mute lg:text-right">
            {PRODUCT.support}
          </p>
        </div>
      </Reveal>

      <Reveal delay={120} variant="scale" className="mt-12">
        <ProductPreview />
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href="/product" variant="outline">
            See the full product page
          </Button>
          <p className="text-sm text-paper-mute">
            Numbers are easy. Knowing what they mean isn’t — that’s the part we’re building.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
