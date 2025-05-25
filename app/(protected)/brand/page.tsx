import { LogoShowcase } from "@/components/ui/logo-showcase"

export default function BrandPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Brand Assets</h1>
        <p className="text-muted-foreground">Logo variations and brand assets for Vibe Dieting</p>
      </div>

      <LogoShowcase />

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Usage Guidelines</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use the default logo on marketing materials and primary app screens</li>
          <li>The icon-only version works well for app icons and small spaces</li>
          <li>Horizontal layout is ideal for headers and navigation bars</li>
          <li>Vertical layout works well for splash screens and centered layouts</li>
          <li>Always maintain the logo's aspect ratio when resizing</li>
          <li>Use the light version on dark backgrounds and dark version on light backgrounds</li>
        </ul>
      </div>
    </div>
  )
}
