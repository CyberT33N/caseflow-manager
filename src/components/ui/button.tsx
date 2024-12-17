// Importiere notwendige Bibliotheken und Komponenten
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Definition der Button-Varianten mit class-variance-authority
// Dies erstellt eine Funktion, die basierend auf Props die richtigen Klassen zurückgibt
const buttonVariants = cva(
  // Basis-Klassen, die immer angewendet werden
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      // Verschiedene Varianten für das Aussehen des Buttons
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Verschiedene Größenvarianten
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    // Standardwerte, falls keine Variante oder Größe angegeben wird
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Extrahiere die Prop-Typen aus den Button-Varianten
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Button-Komponente mit React.forwardRef für Ref-Weiterleitung
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Wenn asChild true ist, wird Slot verwendet, ansonsten ein normaler button
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        // Kombiniere die generierten Varianten-Klassen mit zusätzlichen className Props
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

// Setze den Display-Namen für DevTools und Debugging
Button.displayName = "Button"

// Exportiere die Button-Komponente und die Varianten-Funktion
export { Button, buttonVariants }
