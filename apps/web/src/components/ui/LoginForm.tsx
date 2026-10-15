import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const formVariants = cva(
    "w-full space-y-4",
    {
        variants: {
            variant: {
                default: "",
                card: "p-6 bg-card text-card-foreground rounded-lg border shadow-sm",
            },
            size: {
                default: "",
                sm: "max-w-sm",
                lg: "max-w-lg",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface LoginFormProps
    extends React.FormHTMLAttributes<HTMLFormElement>,
        VariantProps<typeof formVariants> {
    asChild?: boolean;
}

const LoginForm = React.forwardRef<HTMLFormElement, LoginFormProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "form"
        return (
            <Comp
                className={cn(formVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)

LoginForm.displayName = "LoginForm"

export { LoginForm, formVariants }
