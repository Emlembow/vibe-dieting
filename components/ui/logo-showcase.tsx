import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

export function LogoShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo Variations</CardTitle>
        <CardDescription>Available logo variations for the Vibe Dieting app</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center gap-2">
            <Logo variant="default" size="lg" />
            <span className="text-sm text-muted-foreground">Default</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Logo variant="icon" size="lg" />
            <span className="text-sm text-muted-foreground">Icon Only</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Logo variant="horizontal" size="lg" />
            <span className="text-sm text-muted-foreground">Horizontal</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Logo variant="vertical" size="lg" />
            <span className="text-sm text-muted-foreground">Vertical</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-slate-900 p-4 rounded-md">
            <Logo variant="light" size="lg" />
            <span className="text-sm text-slate-300">Light (for dark bg)</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-slate-100 p-4 rounded-md">
            <Logo variant="dark" size="lg" />
            <span className="text-sm text-slate-700">Dark (for light bg)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
